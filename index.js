const express = require('express');

const mongoose = require('mongoose');
const  bodyParser = require('body-parser');
const ticketRoutes=require('./router/index')
const app = express();


// MongoDB connection
const PORT = 3000;
const DBURL = "mongodb+srv://SOHEL:IamSohelIslam@apjcwebapp.vpjo2pm.mongodb.net/?retryWrites=true&w=majority&appName=APJCWEBAPP";

app.use('/tickets',ticketRoutes)

mongoose
  .connect(DBURL)
  .then(() => {
    console.log("DB CONNECTED");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });