require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function upsert(nombre, correo, pass, rol, driver = null) {
  const hash = await bcrypt.hash(pass, 10);
  const [existing] = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
  let id;
  if (existing.length) {
    await pool.query(
      `UPDATE usuarios SET contraseña = ?, estado = 'activo', nombre = ?, rol = ? WHERE correo = ?`,
      [hash, nombre, rol, correo]
    );
    id = existing[0].id_usuario;
    console.log('OK update', correo);
  } else {
    const [r] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contraseña, telefono, rol, estado)
       VALUES (?, ?, ?, '3000000000', ?, 'activo')`,
      [nombre, correo, hash, rol]
    );
    id = r.insertId;
    console.log('OK create', correo);
  }

  if (rol === 'conductor' && driver) {
    const [cond] = await pool.query('SELECT id_conductor FROM conductores WHERE id_usuario = ?', [id]);
    if (!cond.length) {
      await pool.query(
        `INSERT INTO conductores (id_usuario, documento, licencia, disponibilidad)
         VALUES (?, ?, ?, TRUE)`,
        [id, driver.documento, driver.licencia]
      );
    }
  }
}

async function main() {
  await upsert('Admin JM', 'admin@johnmove.com', 'Admin123!', 'administrador');
  await upsert('Pasajero Demo', 'pasajero@johnmove.com', 'Test1234', 'pasajero');
  await upsert('Conductor Demo', 'conductor@johnmove.com', 'Test1234', 'conductor', {
    documento: 'CC9001',
    licencia: 'LIC9001',
  });
  console.log('\nCredenciales listas:');
  console.log('  admin@johnmove.com / Admin123!');
  console.log('  pasajero@johnmove.com / Test1234');
  console.log('  conductor@johnmove.com / Test1234');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
