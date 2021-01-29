const express = require("express");

const app = express();
const validateRouter = require("./routes/validate-rule-route");

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(validateRouter);

module.exports = app;
