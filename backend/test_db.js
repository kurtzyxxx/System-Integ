import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
  connectionString: 'postgresql://study_planner_db_7y4w_user:2bGkSOJFjJjwGqiE3LMHD2K6h3HWrz5I@dpg-d0j7f3e3jp1c73djm86g-a.singapore-postgres.render.com/study_planner_db_7y4w',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT id, email, username FROM users;', (err, res) => {
  if (err) throw err;
  console.log(res.rows);
  pool.end();
});
