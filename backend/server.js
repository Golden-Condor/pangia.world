require("dotenv").config({ path: __dirname + '/.env' });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const path = require("path");

const app = express();

app.get("/test", (req, res) => {
  res.send("It works!");
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
let server; // Store the server instance
console.log("🧩 FULL ENV:", process.env);
console.log("✅ CLIENT_URL:", process.env.CLIENT_URL);
console.log("✅ STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "loaded" : "❌ missing");


// Stripe webhook must come before body parsers
app.use('/api/payments/webhook', require('./routes/stripeWebhook'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});
// app.use('/api/webhook', require('./routes/webhook'));

app.use((req, res, next) => {
  console.log("📡 Backend received:", req.method, req.originalUrl);
  next();
});

app.use((req, res, next) => {
  console.log("🟣 Incoming:", req.method, req.originalUrl);
  console.log("🔵 Headers:", req.headers);
  console.log("🟢 Body:", req.body);
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve dashboard.html for /dashboard route
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Import Routes
const authRoutes = require(path.join(__dirname, "routes", "auth"));
app.use("/api/orders", require("./routes/order")); // Order routes
app.use("/api/payments", require("./routes/payment")); // Payment routes
app.use("/api/auth", authRoutes);
app.use("/api/connect", require("./routes/connect"));
app.use("/api/dashboard", require("./routes/dashboard"));


// Redirect root to homepage
app.get("/", (req, res) => {
  res.redirect("/pages/index.html");
});

// Database Connection
const connectDB = async () => {
  try {
      const mongoUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGO_URI : process.env.MONGO_URI;
      console.log(`🟡 Connecting to MongoDB at: ${mongoUri}`);  // Debugging
      await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          bufferCommands: false,
          serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ Connected to MongoDB");
  } catch (err) {
      console.error("❌ MongoDB connection error:", err.message);
      throw new Error("Database connection failed");
  }
};

mongoose.connection.on("connected", () => console.log("✅ MongoDB Connected Successfully"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB Connection Error:", err));
mongoose.connection.on("disconnected", () => console.log("⚠️ MongoDB Disconnected"));


const PORT = 5000;

const startServer = async () => {
  try {
    console.log("🛠 Starting server...");

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is undefined");
    } else {
      console.log("✅ MONGO_URI detected:", process.env.MONGO_URI);
    }

    await connectDB();
    console.log("✅ MongoDB Connected and Ready.");

    console.log("🔊 About to call app.listen...");
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log("🚀 Pangia CI/CD deployed successfully!");
    });
  } catch (error) {
    console.error("❌ Server failed to start due to MongoDB connection error:", error);
    process.exit(1);
  }
};


// Graceful Shutdown
const closeServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log("🛑 Server closed");
  }
  await mongoose.disconnect();
  console.log("✅ MongoDB Disconnected");
};

module.exports = { app, startServer, closeServer };

if (require.main === module) {
  startServer();
}