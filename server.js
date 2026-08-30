import express from "express";
import { Register, Login, getUsers } from "./db.js";

const app = express();
app.use(express.json());
const port = 5000;

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
  const users = await Register(req.body);
  res.json({
    message: "Succesfully registered",
    users: users,
  });
});

app.post("/user/login", async (req, res) => {
  const users = await Login(req.body.username, req.body.password);
  res.json({
    message: "Successfuly Logged in",
    users: users,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port${port}`);
});
