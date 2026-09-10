import Database from "better-sqlite3";
import bcrypt from "bcrypt";
const db = new Database("authentication.db");
/*
const columns = db.prepare("PRAGMA table_info(users)").all();

console.log(columns.map((column) => column.name));
*/
//db.prepare(`ALTER TABLE users ADD COLUMN confirm_password STRING`);
const users = db.prepare(`SELECT * FROM users`).all();
console.log(users);

if (db) {
  console.log("sqlite Connected");
}

function getUsers() {
  const query = `SELECT * FROM users`;
  const users = db.prepare(query).all();

  return users;
}

async function Register(user) {
  const insertdata = db.prepare(
    "INSERT INTO users (name, username, email, password) VALUES(?, ?, ?, ?)",
  );
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const query = insertdata.run(
      user.name,
      user.username,
      user.email,
      hashedPassword,
    );

    return query;
  } catch (err) {
    console.log("error: " + err);
    return;
  }
}

async function Login(username, password) {
  const query = db.prepare(`SELECT * FROM users WHERE username = ?`);
  const user = query.get(username);

  if (!user) {
    throw new Error("User not found");
  }

  const CheckedPassword = await bcrypt.compare(password, user.password);
  if (!CheckedPassword) {
    throw new Error("Invalid password");
  }
  return user;
}

async function sendEmail(email) {
  const query = db.prepare(`SELECT email FROM users WHERE email = ?`);
  const user_email = query.get(email);
  try {
    if (!user_email || user_email === null) {
      throw new Error("User email not found.");
    }
    return user_email;
  } catch (err) {
    console.log("Error: " + err);
    return;
  }
}
async function resetPassword(password, confrim_password, email) {
  const update_password = db.prepare(
    `UPDATE users SET password = ? WHERE email = ?`,
  );

  if (password !== confrim_password) {
    throw new Error("Password does not match confirm password.");
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const query = update_password.run(hashedPassword, email);
  return query;
}

export { db, Register, Login, getUsers, sendEmail, resetPassword };
