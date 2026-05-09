import bcrypt from 'bcrypt';
import sql from './db.js';

async function testLogin() {
  try {
    const users = await sql`SELECT * FROM users WHERE email = ${'john@gmail.com'}`;
    if (users.length === 0) {
      console.log("User not found!");
    } else {
      console.log("User found:", users[0].email, "role:", users[0].role);
      const isMatch = await bcrypt.compare('hatred143', users[0].password);
      console.log("Password hatred143 match?", isMatch);
      const isMatch2 = await bcrypt.compare('Hatred14*', users[0].password);
      console.log("Password Hatred14* match?", isMatch2);
    }
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    process.exit();
  }
}
testLogin();
