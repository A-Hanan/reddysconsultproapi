const mongoose = require("mongoose");

const mongoURI =
  "mongodb://reddynithin:4g8Y12ntwKAz0vK0@ac-2xxs63m-shard-00-00.km0wcxl.mongodb.net:27017,ac-2xxs63m-shard-00-01.km0wcxl.mongodb.net:27017,ac-2xxs63m-shard-00-02.km0wcxl.mongodb.net:27017/?ssl=true&replicaSet=atlas-qge6br-shard-0&authSource=admin&retryWrites=true&w=majority";
const connectToMongo = () => {
  //mongoose.connect(mongoURI).catch((error) => console.log(error));

  mongoose
    .connect(mongoURI, () => {
      console.log("connected to mongoDB");
    })
    .catch((err) => console.log(err, "prrr"));

  // mongoose.connect("", {
  //   useNewUrlParser: true, // Boilerplate for Mongoose 5.x
  // });
  // mongoose.connection.on("connected", () => console.log("Connected"));
  // mongoose.connection.on("error", (err) =>
  //   console.log("Connection failed with - ", err)
  // );
};

module.exports = connectToMongo;
