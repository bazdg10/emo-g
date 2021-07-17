const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const { Room } = require('./models/Room.js')
const { User } = require('./models/User.js')
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
  socket.on('join', async ({room, email, name}, callback) => {

    var roomPool = await Room.find({room})
    if (roomPool) {
        
      const userAlreadyJoined = User.find({name, email})
      var uid = "IDK"
      if (typeof(userAlreadyJoined)!="undefined" && typeof(userAlreadyJoined.room)!="undefined")
      {
        socket.emit('servermessage', { text: `YOU ARE ALREADY PART OF A GAME`});
        uid = "DONT"
      }  
      if (typeof(userAlreadyJoined)!="undefined")
        uid = userAlreadyJoined._id       
      if (uid!="DONT") {
        var prevRoom = roomPool
        if (uid=="IDK") {
          //  ADD LOGIN ETC
          if (prevRoom.game==1) {
            uid="DONT"    // RANDOM PERSON TRYING TO JOIN GAME AFTER IT'S STARTED
          }
          else{
            var newUser = new User({name, email})
            newUser = await User.save(newUser)
            uid = newUser._id
          }
        }
        if ( prevRoom.game==1 || prevRoom.dummy.length!==0 ) {
        console.log('Guys joining the room')
        if ( prevRoom.game==1 ) {
          // Retrieve user's data and let him/ her join the room
        }  
          prevRoom.dummy.push({email})
          if (prevRoom.dummy.length == 21) {
              console.log('All users have joined the game')
              // RANDOM ALLOTMENT FOR NOW
              for ( var i=1; i<prevRoom.dummy.length; i++) {
                  if (i%2==1) {
                    prevRoom.team1.push(prevRoom.dummy[i])
                  } else {
                    prevRoom.team2.push(prevRoom.dummy[i])
                  }
              }
            prevRoom.dummy.clear()
            prevRoom.game = 1
            } else {
            console.log(`${21-prevRoom.dummy.length} more users needed`) 
          }
        Room.findByIdAndUpdate(roomPool._id, prevRoom, {new: true})
        if (prevRoom.dummy.length==0) {
        socket.broadcast.to(room).emit('gamemessage', { text: `START` });
        }
        else {
        socket.emit('servermessage', { text: `WAIT`});
        }
      }
      await User.findByIdAndUpdate(uid,{name, email, room, tempId: socket.id}, { new: true })
      }
    } else {
      socket.emit('servermessage', { text: `INVALID ROOM ID`});
    }
  })

  socket.on('disconnect', async () => {
    // NEEDS WORK
    var userLeaving = await User.find({tempId: socket.id})
    if ( userLeaving && userLeaving.room) {

      var room = await Room.find({name: userLeaving.room})
      if (room)
      {
        delete userLeaving.room
        var idxOfLeave;
        idxOfLeave = room.dummy.indexOf(userLeaving.email)
        if (idxOfLeave!=-1) {
        // User leaves before game starts        
          room.dummy.splice(idxOfLeave, 1)
        } else {
          idxOfLeave = room.team1.indexOf(userLeaving.email)
          if (idxOfLeave!=-1) {
            room.team1.splice(idxOfLeave, 1)
          } else {
            idxOfLeave = room.team2.indexOf(userLeaving.email)
            room.team2.splice(idxOfLeave, 1)
          }
        }
        User.findByIdAndUpdate(userLeaving._id, userLeaving, { new: true })
        Room.findByIdAndUpdate(room._id, room, { new: true })
      }
    }
  })
})