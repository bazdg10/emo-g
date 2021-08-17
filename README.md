# emo-g
# Node-js: socket-io | express
# Mongo DB

SCHEMAS :   Room    User

*gamemessages* are sent for any game related communication
*servermessages* are sent for room entry/ exit communication

#Room
name     ROOM NAME <br />
teams -  TEAM NAMES <br />
current - LAST WORD IN THE ROOM <br />
player -  CURRENT PLAYER THAT GIVES STATEMENTS <br />
mails - EMAIL IDS OF PLAYERS <br />
game - IF GAME IS ON  <br />
turn - CURRENT TEAM PLAYING  <br />
dummy - SOCKET ID STORAGE  <br />
score - SCORES OF THE TWO TEAMS  <br />
rounds - ROUNDS LEFT  <br />
st - STATEMENT ISSUED ( removable )  <br />
word - WORD ISSUED ( removed )  <br />


#User
email - EMAIL-ID OF USER  <br />
score - USERS SCORE TILL DATE  <br />
tempId - STORES SOCKET ID OF USER FOR THE GAME  <br />
room - STORES USER'S ROOM FOR THE GAME  <br />


Why this design ? <br />

We want to keep in mind that user may loose internet connectivity. <br />
To ensure a break-less gaming experience we store all nessecary info to ensure game runs smoothly even in absence of a user who could possibly be an integral part of the game

