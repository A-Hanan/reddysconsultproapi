// const io = require("socket.io")(8990, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

const runSocketServer = (io) => {
  console.log("running socket server");

  let users = [];
  const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  };
  const removeUser = (socketId) => {
    // console.log("before remove users>>> ", users);
    users = users.filter((user) => user.socketId !== socketId);
    //console.log("after remove user >>> ", users);
  };
  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  const getUserBySocketId = (socketId) => {
    return users.find((user) => user.socketId === socketId);
  };

  io.on("connection", (socket) => {
    //when connect
    // console.log("a user connected to a socket server!");
    // after wvery connection take userId and SocketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });
    // console.log("socket users>>> ", users);
    //send and recieve message

    socket.on(
      "sendMessage",
      ({ senderId, receiverId, text, imgUrl, isReceived }) => {
        const user = getUser(receiverId);
        //console.log(text, " for  ", user);

        io.to(user?.socketId).emit("getMessage", {
          senderId,
          text,
          imgUrl,
          isReceived,
        });
      }
    );

    socket.emit("me", socket.id);

    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
      // console.log("call ended");
    });
    // console.log("here call user runs");
    socket.on(
      "callUser",
      ({ userToCall, signalData, from, name, appointmentId, receiverId }) => {
        // console.log("users active while calling>>> ", users);
        // console.log("running call user");
        const fromUser = getUserBySocketId(from);
        const user = getUser(userToCall);
        // console.log("calling ", userToCall, user?.socketId);
        io.to(user?.socketId).emit("callUser", {
          signal: signalData,
          from: fromUser?.userId,
          name,
          appointmentId,
          receiverId,
        });
        // console.log("users>>", users);
        // console.log("call user emitting>>> name>", name, "from>", from);
      }
    );

    socket.on("answerCall", (data) => {
      // console.log("data at answer call", data);
      const rec = getUser(data?.receiverId);
      // console.log("reciever socket id after accepting call", rec?.socketId);
      io.to(rec?.socketId).emit("callAccepted", data.signal);
      // const user = getUser(data.to);
      // console.log("reciever socket id after accepting call", user?.socketId);
      // io.to(user?.socketId).emit("callAccepted", data.signal);
      //console.log("answer call");
    });
    socket.on("endCall", ({ receiverId }) => {
      const user = getUser(receiverId);
      io.to(user?.socketId).emit("endCall", true);
      //console.log("ending call with ", receiverId);
    });

    //when disconnect
    socket.on("disconnect", () => {
      // console.log("a user disconnected");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

module.exports = runSocketServer;
