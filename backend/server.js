const express = require("express");
const cors = require("cors");
require("dotenv").config();
const assetsLiabilitiesRoutes = require("./routes/assetsLiabilitiesRoutes");
const transactionRoutes = require("./routes/transactions");



const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Import transactions route
app.use("/api/transactions", transactionRoutes);

app.use("/api", assetsLiabilitiesRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
