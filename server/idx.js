const express = require('express')
const cors = require('cors')
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
app.use(cors())
app.set('io', io)
const router = express.Router()


const PORT = 5000 || process.env.PORT
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => app.listen(PORT, () => console.log(`Server Started on ${PORT}`)) )
        .catch(error => console.log(error.message) )

mongoose.connect(process.env.ROOM, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(()=> {console.log(`Rooms are active`)})
        .catch(error => console.log(error.message))

var sentence = "Everyday at work feels like the first day!";
var quality = [0, 3]
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


app.post('/getRoom', async (req, res)=> {
    var { name } = req.body
    const newRoom = await Room.save({roomName, dummy: [0]})
    if (newRoom) {
        return { id: newRoom._id, name: newRoom._id };
    } else {
        return { error: `Room not created!` }
    }
})

io.on('connect', () => {

    // GAME JOIN ()

    socket.on ( 'connect', async ({email, roomName}) => {
        const user = await User.find({email})
        if (!user) {
            // CREATE SOME SORT OF AUTH ETC.
            User.save({email, tempId: socket.id})
        }
        const room = await Room.find({name: roomname});
        if (user.room && user.room!=room) {
            // PLAYER OF SOME OTHER GAME
            socket.emit('servermessage', { user: 'server', text: `Go to your game`});
        } else {
            if (room!==undefined) {
                user.room = room;
                User.findByIdAndUpdate(user._id, user);
                // Join Game
                if (room.game==0) {
                    // room.dummy.push(email)
                    if (room.dummy[0].empty() || len(room.dummy[0])>=len(room.dummy[1])) {
                        room.dummy[0].push(socket.id);    
                        room.mails[0].push(email);
                    } else {
                        room.dummy[1].push(socket.id);
                        room.mails[1].push(email);
                    }
                    if (len(room.dummy[1]) == 10 && len(room.dummy[0]) == 10) {
                        room.game = 1;
                        var j = Math.floor(Math.random()*10);
                        room.player = dummy[0][j];
                        room.current = quality;
                        Room.findByIdAndUpdate(room._id, room); 
                        io.to(room.player).emit('game', { user: `server`, text: emoMatrix[quality[0]][quality[1]] });
                    } else {
                        socket.emit('servermessage', { user: `server`, text: `Waiting for others to join` } );
                    }
                } else {
                   //  User lost connectivity previously 
                for ( var i=0; i<2; i++ ) {
                    var j = room.mails[i].indexOf(user.email);
                 if (j!==-1) {
                     // I found this player
                     room.dummy[i].splice(j , 0, socket.id);
                    } 
                }
                    Room.findByIdAndUpdate(room._id, room);         
                }   
            } else {
                socket.emit('servermessage', { user: `server`, text: `Invalid Roomid`});
            }   
        }
    });
      
    //   GAME LEAVE

    socket.on ( 'disconnect', async () => {
        var userSocket = socket.id;
        const user = await User.find({tempId: userSocket});
        const useroom = user.room;
        const room = await Room.find({name: useroom});
        if (room!==undefined) {
           var end = false;
           for ( var i=0; i<2; i++ ) {
               var j = room.mails[i].indexOf(user.email);
            if (j!==-1) {
                // I found this player
                room.dummy[i].splice(j ,1);
                end = len(room.dummy[i]==0) && len(room.dummy[1-i]==0);
            } 
           }
           if (!end)
              Room.findByIdAndUpdate(room._id, room);
           else {
               for ( var i=0; i<2; i++ ) {
                   for ( var j=0; j<len(room.mails[i]); j++ ) {
                       var usr = User.find({ email: room.mails[i][j] });
                       if (usr) {
                           usr.score += room.score[i];
                           User.findByIdAndUpdate(usr._id, usr);
                       }
                   }
               }
               Room.remove({_id: room._id});
           }
        } 
    });


    // GAME FUNCTIONS
    socket.on( 'game', async (reply) => {
        const user = await User.find({email})
        if (!user) {
            // CREATE SOME SORT OF AUTH ETC.
            User.save({email, tempId: socket.id})
        }
        const room = await Room.find({name: roomname});
        if (user.room && user.room!=room) {
            // PLAYER OF SOME OTHER GAME
            socket.emit('servermessage', { user: 'server', text: `Go to your game`});
        } else {
            if (reply.userSentence!==undefined){ 
            room.st = userSentence;
            Room.findByIdAndUpdate(room._id, room);
            socket.emit('gamemessage', {user: `server`, sentence: room.st} );
            } else {
                var word = reply.guess;
                var gen = false;
                for ( var i=0; i<len(words[i]); i++ ) {
                    if (words[i].indexOf(word)!==-1) {
                        //  check if word is having similar emos
                        if (room.current[0]!==i) {
                            // current team gets 0 points   
                            // check if 1st team is responding
                            if (room.turn == room.rounds%2) {
                                room.turn = 1 - room.turn;
                                var j = Math.floor(Math.random()*len(room.dummy[turn]));
                                room.player = room.dummy[room.turn][j];
                                Room.findByIdAndUpdate(room._id, room);
                                io.to(room.player).emit('game', { user: `server`, text: emoMatrix[quality[0]][quality[1]] });
                                break;
                            } else {
                                // Second team also guesses wrong
                                room.rounds--;
                                gen = true;
                            }
                        } else {
                            // We landed in the same row
                            var k = emoMatrix[i].indexOf(word);
                            if (k==j) {
                                // Team guessed right answer
                                if (room.rounds%2!==room.turn) {
                                    room.score[room.turn] += 3;
                                } else {
                                    room.score[room.turn] += 2;
                                }
                                room.rounds--;
                                gen = true;
                            } else {
                                // Team found the right row only
                                if (room.rounds%2==room.turn) {
                                    room.turn = 1 - room.turn;
                                var j = Math.floor(Math.random()*len(room.dummy[turn]));
                                var row = Math.floor(Math.random()*len(emoMatrix));
                                var col = Math.floor(Math.random()*len(emoMatrix[row]));
                                room.current[0] = row; room.current[1] = col;
                                room.player = room.dummy[room.turn][j];
                                Room.findByIdAndUpdate(room._id, room);
                                io.to(room.player).emit('game', { user: `server`, text: emoMatrix[row][col] });
                                } else {
                                    room.rounds--;
                                    gen = true;
                                }
                            }
                        }

                    }
                }
                if (gen) {
                    // if rounds == 0 ecit route create
                    if (room.rounds%2 !== room.turn) {
                        room.turn = room.rounds%2;
                    }
                    
                    // Generating New Emotion

                    var j = Math.floor(Math.random()*len(room.dummy[turn]));
                    var row = Math.floor(Math.random()*len(emoMatrix));
                    var col = Math.floor(Math.random()*len(emoMatrix[row]));
                    room.current[0] = row; room.current[1] = col;
                    room.player = room.dummy[room.turn][j];
                    Room.findByIdAndUpdate(room._id, room);
                    io.to(room.player).emit('game', { user: `server`, text: emoMatrix[row][col] });
                                      
                }
            }
        }      
    })

    

})