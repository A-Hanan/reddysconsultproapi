const connectToMongo = require("./db");
const express = require("express");
const runSocketServer = require("./socket");

// const runSocketServer = require("./socket");
var cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
// const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);

const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
console.log();

// const app = express();
// const server = require("http").Server(app);
const port = process.env.PORT || 5000;
// const io = require("socket.io");

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //for form post requests
app.use(express.static(`${__dirname}/public`));

runSocketServer(io);
connectToMongo();

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
