const express = require("express");
const userRouter = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors')
const app = express();

app.use(cors())


// middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, authorization, x-access-token"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  
  next();
});



app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", userRouter);

module.exports = app;
