const connectToMongo = require("./db");
const express = require("express");
const runSocketServer = require("./socket");

// const runSocketServer = require("./socket");
var cors = require("cors");
const bodyParser = require("body-parser");

runSocketServer();
connectToMongo();

const app = express();
const server = require("http").Server(app);
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //for form post requests
app.use(express.static(`${__dirname}/public`));

// Avaliable routes
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).send("server working fine");
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/experts", require("./routes/experts"));
app.use("/api/appointment", require("./routes/appointment"));
app.use("/api/review", require("./routes/review"));
app.use("/api/payment", require("./routes/payment"));
// app.use("/api/user", require("./routes/user"));

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
