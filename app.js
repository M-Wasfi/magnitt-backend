const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const colors = require("colors");

const userRoutes = require("./routes/user_routes");
const companyRoutes = require("./routes/company_routes");

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.disable("etag");

app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);

module.exports = app;
