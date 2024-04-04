const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ticketRoutes = require("./router");
const app = express();

// MongoDB connection
const PORT = process.env.PORT || 3000;
const DBURL =
  process.env.DB_URL ||
  "mongodb+srv://SOHEL:IamSohelIslam@apjcwebapp.vpjo2pm.mongodb.net/?retryWrites=true&w=majority&appName=APJCWEBAPP";

app.use("/tickets", ticketRoutes);

mongoose
  .connect(DBURL)
  .then(() => {
    console.log("DB CONNECTED");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
