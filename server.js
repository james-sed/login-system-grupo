import express from "express";
import session from "express-session";
import 'dotenv/config';
import { Register, Login, getUsers } from "./db.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true
  }
}));

const PORT = process.env.PORT;
console.log(PORT)

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  next();
}

app.get("/users", requireAuth, (req, res) => {
  const users = getUsers();
  res.json({
    message: "Get all the users",
    users: users,
  });
});

app.get("/user/me", requireAuth, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

app.post("/user/registration", async (req, res) => {
  try {
    const result = await Register(req.body);
    if (!result) {
      return res.json({
        success: false,
        message: "Registration failed. Username may already be taken.",
      });
    }
    res.json({ success: true, message: "Successfully registered" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Registration failed" });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const user = await Login(req.body.username, req.body.password);

    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
    };

    res.json({ success: true, message: "Successfully logged in", user: req.session.user });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: "Invalid username or password" });
  }
});

app.post("/user/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port${PORT}`);
});
