const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth.js");
const { validateUserProfileData } = require("../utils/validation.js");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateUserProfileData(req);
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    console.log(loggedInUser);
    await loggedInUser.save();

    res.json({ message: "Profile updated successfully", data: loggedInUser });
  } catch (err) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

profileRouter.patch("/profile/changepassword", userAuth, async (req, res) => {
  try {
    const { emailId } = req.user;
    const { newPassword, newPassword2 } = req.body;

    if (!newPassword || !newPassword2) {
      return res.status(400).send("password fields cant be empty");
    }

    if (newPassword !== newPassword2) {
      return res.status(400).send("password does not match");
    }

    const user = await User.findOne({ emailId: emailId });
    if (user) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = newHashedPassword;
      await user.save();

      res.send("password updated successfully");
    } else {
      throw new Error("user not found");
    }
  } catch (err) {
    res.status(400).send("something went wrong: " + err.message);
  }
});

module.exports = profileRouter;
