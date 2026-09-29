const { query, pool } = require('../config/db');
const { getDriverByUserId } = require('./driverController');

function estimatePrice(origen, destino) {
  const base = 5000;
  const factor = Math.min(Math.max(origen.length + destino.length, 10), 40);
  return Number((base + factor * 350).toFixed(2));
}

async function requestTrip(req, res) {
  const { origen, destino } = req.body;
  if (!origen || !destino) {
    return res.status(400).json({ error: 'origen y destino son obligatorios' });
  }

  try {
    const precio = estimatePrice(origen, destino);
    const result = await query(
      `INSERT INTO viajes (id_pasajero, origen, destino, estado, precio)
       VALUES (?, ?, ?, 'solicitado', ?)`,
      [req.user.id_usuario, origen, destino, precio]
    );
    const rows = await query(`SELECT * FROM viajes WHERE id_viaje = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al solicitar viaje' });
  }
}

async function listOpenRequests(req, res) {
  try {
    const driver = await getDriverByUserId(req.user.id_usuario);
    if (!driver) return res.status(404).json({ error: 'Conductor no encontrado' });
    if (!driver.disponibilidad) {
      return res.status(400).json({ error: 'Debes estar disponible para ver solicitudes' });
    }

    const trips = await query(
      `SELECT v.*, u.nombre AS pasajero_nombre, u.telefono AS pasajero_telefono
       FROM viajes v
       JOIN usuarios u ON u.id_usuario = v.id_pasajero
       WHERE v.estado = 'solicitado'
       ORDER BY v.fecha_solicitud ASC`
    );
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar solicitudes' });
  }
}

async function acceptTrip(req, res) {
  const id_viaje = Number(req.params.id);
  const { id_vehiculo } = req.body;

  const conn = await pool.getConnection();
  try {
    const driver = await getDriverByUserId(req.user.id_usuario);
    if (!driver) {
      conn.release();
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }
    if (!driver.disponibilidad) {
      conn.release();
      return res.status(400).json({ error: 'Debes estar disponible' });
    }

    let vehicleId = id_vehiculo;
    if (!vehicleId) {
      const [vehicles] = await conn.execute(
        `SELECT id_vehiculo FROM vehiculos WHERE id_conductor = ? LIMIT 1`,
        [driver.id_conductor]
      );
      if (!vehicles.length) {
        conn.release();
        return res.status(400).json({ error: 'Registra un vehículo antes de aceptar viajes' });
      }
      vehicleId = vehicles[0].id_vehiculo;
    } else {
      const [owned] = await conn.execute(
        `SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ? AND id_conductor = ?`,
        [vehicleId, driver.id_conductor]
      );
      if (!owned.length) {
        conn.release();
        return res.status(400).json({ error: 'Vehículo no válido' });
      }
    }

    await conn.beginTransaction();
    const [trips] = await conn.execute(
      `SELECT * FROM viajes WHERE id_viaje = ? FOR UPDATE`,
      [id_viaje]
    );
    if (!trips.length || trips[0].estado !== 'solicitado') {
      await conn.rollback();
      conn.release();
      return res.status(409).json({ error: 'Viaje no disponible' });
    }

    await conn.execute(
      `UPDATE viajes SET id_conductor = ?, id_vehiculo = ?, estado = 'aceptado'
       WHERE id_viaje = ?`,
      [driver.id_conductor, vehicleId, id_viaje]
    );
    await conn.commit();

    const [updated] = await conn.execute(`SELECT * FROM viajes WHERE id_viaje = ?`, [id_viaje]);
    res.json(updated[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al aceptar viaje' });
  } finally {
    conn.release();
  }
}

async function updateTripStatus(req, res) {
  const id_viaje = Number(req.params.id);
  const { estado } = req.body;
  const allowed = ['en_curso', 'finalizado', 'cancelado'];
  if (!allowed.includes(estado)) {
    return res.status(400).json({ error: 'Estado no permitido' });
  }

  try {
    const trips = await query(`SELECT * FROM viajes WHERE id_viaje = ?`, [id_viaje]);
    if (!trips.length) return res.status(404).json({ error: 'Viaje no encontrado' });
    const trip = trips[0];

    const isPassenger = trip.id_pasajero === req.user.id_usuario;
    let isDriver = false;
    if (req.user.rol === 'conductor') {
      const driver = await getDriverByUserId(req.user.id_usuario);
      isDriver = driver && trip.id_conductor === driver.id_conductor;
    }

    if (estado === 'cancelado') {
      if (!isPassenger && !isDriver && req.user.rol !== 'administrador') {
        return res.status(403).json({ error: 'No autorizado' });
      }
      if (['finalizado', 'cancelado'].includes(trip.estado)) {
        return res.status(409).json({ error: 'El viaje ya no se puede cancelar' });
      }
    } else {
      if (!isDriver) return res.status(403).json({ error: 'Solo el conductor puede avanzar el viaje' });
      if (estado === 'en_curso' && trip.estado !== 'aceptado') {
        return res.status(409).json({ error: 'El viaje debe estar aceptado' });
      }
      if (estado === 'finalizado' && !['aceptado', 'en_curso'].includes(trip.estado)) {
        return res.status(409).json({ error: 'Estado inválido para finalizar' });
      }
    }

    await query(
      `UPDATE viajes
       SET estado = ?,
           fecha_finalizacion = CASE WHEN ? IN ('finalizado', 'cancelado') THEN NOW() ELSE fecha_finalizacion END
       WHERE id_viaje = ?`,
      [estado, estado, id_viaje]
    );
    const updated = await query(`SELECT * FROM viajes WHERE id_viaje = ?`, [id_viaje]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
}

async function getTrip(req, res) {
  const id_viaje = Number(req.params.id);
  try {
    const rows = await query(
      `SELECT v.*,
              p.nombre AS pasajero_nombre, p.telefono AS pasajero_telefono,
              c.id_usuario AS conductor_usuario_id,
              u.nombre AS conductor_nombre, u.telefono AS conductor_telefono,
              ve.placa, ve.marca, ve.modelo, ve.color
       FROM viajes v
       JOIN usuarios p ON p.id_usuario = v.id_pasajero
       LEFT JOIN conductores c ON c.id_conductor = v.id_conductor
       LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
       LEFT JOIN vehiculos ve ON ve.id_vehiculo = v.id_vehiculo
       WHERE v.id_viaje = ?`,
      [id_viaje]
    );
    if (!rows.length) return res.status(404).json({ error: 'Viaje no encontrado' });
    const trip = rows[0];

    const isPassenger = trip.id_pasajero === req.user.id_usuario;
    let isDriver = false;
    if (req.user.rol === 'conductor') {
      const driver = await getDriverByUserId(req.user.id_usuario);
      isDriver = driver && trip.id_conductor === driver.id_conductor;
    }
    if (!isPassenger && !isDriver && req.user.rol !== 'administrador') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener viaje' });
  }
}

async function myTrips(req, res) {
  try {
    let trips;
    if (req.user.rol === 'pasajero') {
      trips = await query(
        `SELECT v.*, u.nombre AS conductor_nombre, ve.placa
         FROM viajes v
         LEFT JOIN conductores c ON c.id_conductor = v.id_conductor
         LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
         LEFT JOIN vehiculos ve ON ve.id_vehiculo = v.id_vehiculo
         WHERE v.id_pasajero = ?
         ORDER BY v.fecha_solicitud DESC`,
        [req.user.id_usuario]
      );
    } else if (req.user.rol === 'conductor') {
      const driver = await getDriverByUserId(req.user.id_usuario);
      if (!driver) return res.status(404).json({ error: 'Conductor no encontrado' });
      trips = await query(
        `SELECT v.*, p.nombre AS pasajero_nombre
         FROM viajes v
         JOIN usuarios p ON p.id_usuario = v.id_pasajero
         WHERE v.id_conductor = ?
         ORDER BY v.fecha_solicitud DESC`,
        [driver.id_conductor]
      );
    } else {
      trips = await query(
        `SELECT v.*, p.nombre AS pasajero_nombre, u.nombre AS conductor_nombre
         FROM viajes v
         JOIN usuarios p ON p.id_usuario = v.id_pasajero
         LEFT JOIN conductores c ON c.id_conductor = v.id_conductor
         LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
         ORDER BY v.fecha_solicitud DESC`
      );
    }
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar viajes' });
  }
}

async function rateTrip(req, res) {
  const id_viaje = Number(req.params.id);
  const { puntuacion, comentario } = req.body;
  if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
    return res.status(400).json({ error: 'puntuacion debe estar entre 1 y 5' });
  }

  try {
    const trips = await query(`SELECT * FROM viajes WHERE id_viaje = ?`, [id_viaje]);
    if (!trips.length) return res.status(404).json({ error: 'Viaje no encontrado' });
    const trip = trips[0];
    if (trip.id_pasajero !== req.user.id_usuario) {
      return res.status(403).json({ error: 'Solo el pasajero puede calificar' });
    }
    if (trip.estado !== 'finalizado') {
      return res.status(409).json({ error: 'Solo se califican viajes finalizados' });
    }
    if (!trip.id_conductor) {
      return res.status(400).json({ error: 'Viaje sin conductor' });
    }

    const result = await query(
      `INSERT INTO calificaciones (id_viaje, id_pasajero, id_conductor, puntuacion, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [id_viaje, req.user.id_usuario, trip.id_conductor, puntuacion, comentario || null]
    );
    res.status(201).json({
      id_calificacion: result.insertId,
      id_viaje,
      puntuacion,
      comentario: comentario || null,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este viaje ya fue calificado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al calificar' });
  }
}

module.exports = {
  requestTrip,
  listOpenRequests,
  acceptTrip,
  updateTripStatus,
  getTrip,
  myTrips,
  rateTrip,
};
