const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const { Room } = require('./models/Room.js')
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json())
const http = require('http')
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
})
const PORT = 5000 || process.env.PORT
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => app.listen(PORT, () => console.log(`Server Started on ${PORT}`)) )
        .catch(error => console.log(error.message) )

mongoose.connect(process.env.ROOM, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(()=> {console.log(`Rooms are active`)})
        .catch(error => console.log(error.message))

app.post('/startRoom', (req, res) => {
  var { name } = req.body
  name += new Date().toLocaleTimeString()
  var roomName = crypto.createHash('sha1').update(name).digest('hex')
  console.log(roomName)    
  const newRoom = new Room({roomName, dummy: [0]})
  newRoom.save()
  return res.status(200).send(roomName)
})

io.on('connect', socket => {
  socket.on('join', async ({room, email}, callback) => {
  
    var roomPool = await Room.find({room})
    if (roomPool) {
      var prevRoom = roomPool
      if (prevRoom.dummy.length!==0) {
          
        console.log('Guys joining the room')
          prevRoom.dummy.push({email})
          if (prevRoom.dummy.length == 21) {
              console.log('All users have joined the game')
              // RANDOM ALLOTMENT FOR NOW
              for ( var i=1; i<prevRoom.dummy.length; i++) {
                  if (i%2==1) {
                    prevRoom.team1.push(prevRoom.dummy[i].email)
                  } else {
                    prevRoom.team2.push(prevRoom.dummy[i].email)
                  }
              }
            dummy.clear()
            } else {
            console.log(`${21-prevRoom.dummy.length} more users needed`) 
          }
        Room.findByIdAndUpdate(roomPool._id, prevRoom, {new: true})
        if (prevRoom.dummy.length==0) {
        socket.broadcast.to(room).emit('servermessage', { text: `START` });
        }
        else {
        socket.emit('servermessage', { text: `WAIT`});
        }
      }
    } else {
      socket.emit('servermessage', { text: `INVALID ROOM ID`});
    }
  })
  socket.on('disconnect', async () => {
    // NEEDS WORK
    
    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
})