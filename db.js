import Database from "better-sqlite3";
import bcrypt from "bcrypt";
const db = new Database("authentication.db");

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

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid password");
  }

  return user;
}

export { db, Register, Login, getUsers };
