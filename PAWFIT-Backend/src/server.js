import "dotenv/config";
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import petRoutes from "./routes/pets.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payment.js";
import assets3DRoutes from "./routes/assets3D.js";
import path from "path";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (GLB models, thumbnails, etc.)
app.use("/assets", express.static("public/assets"));
app.use("/models", express.static("public/models"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/assets-3d", assets3DRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "PawFit API is running" });
});

const port = process.env.PORT || 5000;

const startServer = (message) => {
  if (message) {
    console.warn(message);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB Atlas");
      startServer();
    })
    .catch((err) => {
      startServer(
        `MongoDB connection error, starting in fallback mode: ${err.message}`,
      );
    });
} else {
  startServer(
    "MONGO_URI is not set, starting in fallback mode with in-memory products",
  );
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // 📍 PLACEHOLDER: upload folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
