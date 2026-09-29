const { query } = require('../config/db');

async function getDriverByUserId(id_usuario) {
  const rows = await query(
    `SELECT id_conductor, id_usuario, documento, licencia, disponibilidad
     FROM conductores WHERE id_usuario = ?`,
    [id_usuario]
  );
  return rows[0] || null;
}

async function setAvailability(req, res) {
  const { disponibilidad } = req.body;
  if (typeof disponibilidad !== 'boolean') {
    return res.status(400).json({ error: 'disponibilidad debe ser boolean' });
  }
  try {
    const driver = await getDriverByUserId(req.user.id_usuario);
    if (!driver) return res.status(404).json({ error: 'Perfil de conductor no encontrado' });

    await query(
      `UPDATE conductores SET disponibilidad = ? WHERE id_conductor = ?`,
      [disponibilidad, driver.id_conductor]
    );
    res.json({ ...driver, disponibilidad });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar disponibilidad' });
  }
}

async function registerVehicle(req, res) {
  const { placa, marca, modelo, color } = req.body;
  if (!placa) return res.status(400).json({ error: 'placa es obligatoria' });

  try {
    const driver = await getDriverByUserId(req.user.id_usuario);
    if (!driver) return res.status(404).json({ error: 'Perfil de conductor no encontrado' });

    const result = await query(
      `INSERT INTO vehiculos (id_conductor, placa, marca, modelo, color)
       VALUES (?, ?, ?, ?, ?)`,
      [driver.id_conductor, placa.toUpperCase(), marca || null, modelo || null, color || null]
    );
    res.status(201).json({
      id_vehiculo: result.insertId,
      id_conductor: driver.id_conductor,
      placa: placa.toUpperCase(),
      marca,
      modelo,
      color,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Placa ya registrada' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrar vehículo' });
  }
}

async function listVehicles(req, res) {
  try {
    const driver = await getDriverByUserId(req.user.id_usuario);
    if (!driver) return res.status(404).json({ error: 'Perfil de conductor no encontrado' });

    const vehicles = await query(
      `SELECT id_vehiculo, placa, marca, modelo, color FROM vehiculos WHERE id_conductor = ?`,
      [driver.id_conductor]
    );
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar vehículos' });
  }
}

async function getProfile(req, res) {
  try {
    const driver = await getDriverByUserId(req.user.id_usuario);
    if (!driver) return res.status(404).json({ error: 'Perfil de conductor no encontrado' });
    const vehicles = await query(
      `SELECT id_vehiculo, placa, marca, modelo, color FROM vehiculos WHERE id_conductor = ?`,
      [driver.id_conductor]
    );
    res.json({ ...driver, vehiculos: vehicles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener perfil de conductor' });
  }
}

module.exports = {
  getDriverByUserId,
  setAvailability,
  registerVehicle,
  listVehicles,
  getProfile,
};
