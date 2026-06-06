import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { cloneDefaultUsers } from "../seedData/defaultUsers.js";
import { getJwtSecret } from "../config/auth.js";

const fallbackUsers = cloneDefaultUsers();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const normalizeEmail = (value) => (value ?? "").toLowerCase().trim();

const findFallbackUser = (email) =>
  fallbackUsers.find((user) => user.email === normalizeEmail(email));

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const existingUser = isDatabaseReady()
      ? await User.findOne({ email: normalizedEmail })
      : findFallbackUser(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = isDatabaseReady()
      ? await User.create({
          name,
          email: normalizedEmail,
          password: hashedPassword,
        })
      : {
          _id: `fallback-${Date.now()}`,
          id: `fallback-${Date.now()}`,
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "user",
        };

    if (!isDatabaseReady()) {
      fallbackUsers.push(user);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const user = isDatabaseReady()
      ? await User.findOne({ email: normalizedEmail })
      : findFallbackUser(normalizedEmail);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
