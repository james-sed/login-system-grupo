import express from "express";
import session from "express-session";
import "dotenv/config";
import { Register, Login, getUsers, sendEmail, resetPassword } from "./db.js";

const app = express();
import rateLimit from "express-rate-limit";

let limiter = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000,
  message:
    "We have received too many requests from this IP address, please try again after one hour",
});
app.use("/api", limiter);

app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
    },
  }),
);

const PORT = process.env.PORT;
console.log(PORT);

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  next();
}

app.get("/api/users", requireAuth, (req, res) => {
  const users = getUsers();
  res.json({
    message: "Get all the users",
    users: users,
  });
});

app.get("/api/user/me", requireAuth, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

app.post("/api/user/registration", async (req, res) => {
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

app.post("/api/user/login", limiter, async (req, res) => {
  try {
    const user = await Login(req.body.username, req.body.password);

    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
    };

    res.json({
      success: true,
      message: "Successfully logged in",
      user: req.session.user,
    });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: "Invalid username or password" });
  }
});

app.post("/api/user/send-email", async (req, res) => {
  try {
    let userEmail = await sendEmail(req.body.email);

    //email must checked before reseting password to ensure email exists.
    req.session.resetEmail = req.body.email;

    res.status(200).json({
      success: true,
      message:
        "Successfully checked your email, you can now reset your password",
      email: userEmail,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, message: "Email Does not exist" });
  }
});

app.post("/api/user/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

app.put("/api/user/reset-password", async (req, res) => {
  try {
    //ensure that email must be checked and completed by the users
    if (!req.session.resetEmail) {
      return res.status(400).json({
        success: false,
        message: "Please you must send an email first",
      });
    }

    //making sure that user must use the same email
    if (req.session.resetEmail !== req.body.email) {
      return res.status(403).json({
        success: false,
        message: "Email must be the same email you sent",
      });
    }

    const update_password = await resetPassword(
      req.body.password,
      req.body.confirm_password,
      req.body.email,
    );
    //remove reset permission after success reseting password
    req.session.resetEmail = null;

    res.status(200).json({
      success: true,
      message: "You Successfuly Reseted your password!",
      user: update_password,
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ success: false, message: "Password does not match" });
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port${PORT}`);
});
