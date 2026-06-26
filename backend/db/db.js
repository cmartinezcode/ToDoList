import { Pool } from "pg";
import "dotenv/config";
const pool = new Pool({
    connectionString: process.env.DATABASE_URL_EXTERNAL,
    ssl: {
    rejectUnauthorized: false, // Permite conectar a Render sin necesidad de descargar un certificado CA local
  },
});

pool.query('SELECT NOW()')
  .then(res => console.log('¡CONECTADO CON ÉXITO A POSTGRES', res.rows[0]))
  .catch(err => console.error('ERROR REAL:', err));


export default pool;

/*
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
*/
