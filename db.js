import Database from "better-sqlite3";
import bcrypt from "bcrypt";
const db = new Database("authentication.db");

const columns = db.prepare("PRAGMA table_info(users)").all();
const columnNames = columns.map((column) => column.name);

console.log(columnNames);

if (!columnNames.includes("confirm_password")) {
  db.prepare(`ALTER TABLE users ADD COLUMN confirm_password STRING`).run();
}

if (!columnNames.includes("role")) {
  db.prepare(
    `ALTER TABLE users ADD COLUMN role STRING NOT NULL DEFAULT 'user' CHECK (role in ('user', 'admin'))`,
  ).run();
}

const findUser = db.prepare("SELECT id FROM users WHERE username = ?");

if (!findUser.get("AdminJay")) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash("MinMin@31", salt);
  db.prepare(
    "INSERT INTO users (name, username, email, password, role) VALUES(?, ?, ?, ?, ?)",
  ).run("Jay", "AdminJay", "AdminJay@gmail.com", hashedPassword, "admin");
}

if (!findUser.get("Admin2")) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash("Jamesj@20", salt);
  db.prepare(
    "INSERT INTO users (name, username, email, password, role) VALUES(?, ?, ?, ?, ?)",
  ).run("James", "Admin2", "Admin2sederia@gmail.com", hashedPassword, "admin");
}

const users = db.prepare(`SELECT * FROM users`).all();
console.log(users);

console.log("sqlite Connected");

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

  if (!user_email) {
    throw new Error("User email not found.");
  }
  return user_email;
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
