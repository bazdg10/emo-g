const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const { Room } = require('./models/Room.js')
const { User } = require('./models/User.js')
// app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json())
const http = require('http')
const server = http.createServer(app);
let io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
})
app.set('io', io)
const router = express.Router()


const PORT = 5000 || process.env.PORT
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => app.listen(PORT, () => console.log(`Server Started on ${PORT}`)) )
        .catch(error => console.log(error.message) )

mongoose.connect(process.env.ROOM, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(()=> {console.log(`Rooms are active`)})
        .catch(error => console.log(error.message))


const emoMatrix = [
  [ 'content', 'glad', 'happy', 'excited', 'ecstatic' ],
  [ 'down', 'unhappy', 'sad', 'glum', 'depressed'],
  [ 'upset', 'frustrated', 'angry', 'agitated', 'furious'],
  [ 'aware', 'curious', 'interested', 'surprised', 'amazed' ],
  [ 'startled', 'nervous', 'scared', 'afraid', 'terrified'],
  [ 'drowsy', 'sleepy', 'tired', 'worn out', 'exhausted' ],
  [ 'sorry', 'regretful', 'guilty', 'remorseful', 'ashamed'],
  [ 'hopeful', 'sure', 'confident', 'strong', 'powerful'],
  [ 'uneasy', 'tense', 'worried', 'anxious', 'panicked'],
  [ 'capable', 'pleased', 'proud', 'dignified', 'triumphant']
]

app.post('/startRoom', async (req, res) => {
  var { name } = req.body
  name += new Date().toLocaleTimeString()
  var roomName = crypto.createHash('sha1').update(name).digest('hex')
  console.log(roomName)    
  const newRoom = new Room({roomName, dummy: [0]})
  return res.status(200).send({ roomName: roomName, redirectUrl: `/admin/${generatedRoom._id}` })
})

io.on('connect', socket => {
  
  socket.on('moderator', ({room, word}) => {
    console.log(room)
    const r = Room.find({room})
    if (r.game==1) {
      words.push(word)
      // Random allocation to a user
      var player = Math.floor(Math.random()*10)
      var user = User.find({tempId: r.teams[0][player].tempId}).tempId
      io.sockets.in(user).emit('servergamemessage', word)
      Room.findByIdAndUpdate(room._id, room, { new: true })
    } else {
      socket.emit('servermessage', { text: `WAIT FOR PLAYERS TO JOIN`})
    }
  })
  
  socket.on('gamemessage', ({room, word}) => {
    console.log(room)
    const r = Room.find({room})
    if (r.game==1) {
      if (r.words.length==1)
      {
      rooms.words.push(word)
      r.rounds--;
      var player = Math.floor(Math.random()*10)
      var user = User.find({tempId: r.teams[1][player].tempId}).tempId
      io.sockets.in(user).emit('servergamemessage', r.words[word.length-1])
      Room.findByIdAndUpdate(room._id, room, { new: true })
    } else {
      rooms.words.push(word)
      var origin = words[0]
      // find distance of both words
      var x;
      for ( var i=0; i<emoMatrix.length; i++ ) {
        x = emoMatrix[i].indexOf(origin)
        if (x!=-1 ) {
          origin = i
          break    
        }
      }
      var s = [0, 0]
      for ( var i=0; i<2; i++ ) {
        var j = emoMatrix[origin].indexOf(r.words[i+1])
        if (j!=-1){
          r.score[i] += (5-Math.abs(x-j))
        } 
      }      
    Room.findByIdAndUpdate(room._id, r, {new: true})
    socket.broadcast.to(r).emit('servergamemessage', { scores:`${r.score}` });
    }
  }
  })
  
  
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
      // Retrieve
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
              prevRoom.teams = [[], []]
              for ( var i=1; i<prevRoom.dummy.length; i++) 
                  prevRoom.team[i%2].push(prevRoom.dummy[i])  
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
          idxOfLeave = room.teams[0].indexOf(userLeaving.email)
          if (idxOfLeave!=-1) {
            room.teams[0].splice(idxOfLeave, 1)
          } else {
            idxOfLeave = room.team2.indexOf(userLeaving.email)
            room.teams[1].splice(idxOfLeave, 1)
          }
        }
        User.findByIdAndUpdate(userLeaving._id, userLeaving, { new: true })
        Room.findByIdAndUpdate(room._id, room, { new: true })
      }
    }
  })
})

// const score = (emo) => {
//     const idx = punchedIn[4]
//     if (id)    
// }


