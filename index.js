require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const connectDb = require("./dbconnect");
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const ACTIONS = require("./action");
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST"],
  },
});
const corsOption = {
  credentials: true,
  origin: ["http://localhost:3000"],
};
app.use(cors(corsOption));
app.use("/storage", express.static("storage"));
const PORT = process.env.PORT || 5500;
// const PORT = process.env.PORT || 5500 ;
url = process.env.DB_URL;
//connectDb(process.env.DB_URL);
app.use(express.json({ limit: "8mb" }));
app.use(router);
app.get("/", (req, res) => {
  res.send("Hello from express Js");
});
// Sockets
const socketUserMap = {};

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId,user }) =>{
    socketUserMap[socket.id] = user;
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.ADD_PEER, {
        peerId: socket.id,
        createOffer: false,
        user,
      });
      socket.emit(ACTIONS.ADD_PEER, {
        peerId: clientId,
        createOffer: true,
        user: socketUserMap[clientId],
      });
    });
    socket.join(roomId);
  });

  socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
    io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
      peerId: socket.id,
      icecandidate,
    });
  });

  socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
    io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerId: socket.id,
      sessionDescription,
    });
  });

  socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.MUTE, {
        // peerId: socket.id,
        userId,
      });
    });
  });

  socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.UNMUTE, {
        peerId: socket.id,
        userId,
      });
    });
  });
  socket.on(ACTIONS.VIDEO_ON, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.VIDEO_ON, {
        userId,
      });
    });
  });

  socket.on(ACTIONS.VIDEO_OFF, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.VIDEO_OFF, {
        // 7peerId: socket.id,
        userId,
      });
    });
  });

  socket.on(ACTIONS.MUTE_INFO, ({ userId, roomId, isMute }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      if (clientId !== socket.id) {
        //console.log("mute info");
        io.to(clientId).emit(ACTIONS.MUTE_INFO, {
          userId,
          isMute,
        });
      }
    });
  });



  const leaveRoom = () => {
    const { rooms } = socket;
    Array.from(rooms).forEach((roomId) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      clients.forEach((clientId) => {
        io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
          peerId: socket.id,
          userId: socketUserMap[socket.id]?.id,
        });
        // socket.emit(ACTIONS.REMOVE_PEER, {
        //     peerId: clientId,
        //     userId: socketUserMap[clientId]?.id,
        // });
      });
      socket.leave(roomId);

    });
    delete socketUserMap[socket.id];
  };
  socket.on('mute_state',({peerId,mute_info,userAbout,video_info})=>{
    io.to(peerId).emit('mute_state', {
      mute_info,userAbout,video_info
    });
  })
  socket.on('new_message', ({ newMsg,roomId,userSocketId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      if(clientId!=userSocketId){
        io.to(clientId).emit('new_message', {
          newMsg
        });
      }
    });
  });
  socket.on(ACTIONS.START_SCREEN_SHARE, ({ roomId, userId }) => {
    socket.to(roomId).emit(ACTIONS.START_SCREEN_SHARE, { userId });
  });
  socket.on(ACTIONS.STOP_SCREEN_SHARE, ({ roomId }) => {
    socket.to(roomId).emit(ACTIONS.STOP_SCREEN_SHARE);
  });
  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on("disconnecting", leaveRoom);
});

//server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
connectDb(url)
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at : ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("database connection error:");
    process.exit(1);
  });
