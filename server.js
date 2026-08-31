import express from "express";
import { Register, Login, getUsers } from "./db.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));
const port = 3000;

app.get("/users", (req, res) => {
  const users = getUsers();
  console.log(users);
  res.json({
    message: "Get all the users",
    users: users,
  });
});
app.post("/user/registration", async (req, res) => {
  console.log("req body: ", req.body);
  try {
    const result = await Register(req.body);
    if (!result) {
      return res.json({ success: false, message: "Registration failed. Username may already be taken." });
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
    res.json({ success: true, message: "Successfully logged in", user });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: "Invalid username or password" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port${port}`);
});
