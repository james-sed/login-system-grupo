import Database from "better-sqlite3";
import bcrypt from "bcrypt";
const db = new Database("authentication.db");
/*
const columns = db.prepare("PRAGMA table_info(users)").all();

console.log(columns.map((column) => column.name));
*/
db.prepare(`ALTER TABLE users ADD COLUMN confirm_password STRING`)
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
    //const salt = await bcrypt.genSalt();
    //const hashedPassword = await bcrypt.hash(user.password, salt);

    const query = insertdata.run(
      user.name,
      user.username,
      user.email,
      user.password,
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

  if (password !== user.password) {
    throw new Error("Invalid password");
  }

  return user;
}

export { db, Register, Login, getUsers };
