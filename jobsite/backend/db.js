// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "sideline_au_db",
    password: "123kurt",
    port: 5432,
});

export default pool;
