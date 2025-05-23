const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middleware/auth.js");
const User = require("../models/user");
const { validateSignUp } = require("../utils/validation.js");

authRouter.post("/signup", async (req, res) => {
  try {
    //validating signup
    validateSignUp(req);

    const { firstName, lastName, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    //creating a new instance of user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expiresIn: "1d",
    });
    res.json({ message: "user added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("error saving the data: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    //returns whole user
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    console.log(isPasswordValid);

    if (isPasswordValid) {
      //creating a jwt token
      const token = await user.getJWT();
      console.log("token yes");

      res.cookie("token", token);
      console.log(user);
      res.send(user);
    } else {
      throw new Error("invalid credentials");
    }
  } catch (err) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("logout successful");
});

module.exports = authRouter;
