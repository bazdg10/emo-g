# emo-g
# Node-js: socket-io | express
# Mongo DB

SCHEMAS :   Room    User

*gamemessages* are sent for any game related communication
*servermessages* are sent for room entry/ exit communication

#Room
name     ROOM NAME
teams -  TEAM NAMES
current - LAST WORD IN THE ROOM
player -  CURRENT PLAYER THAT GIVES STATEMENTS
mails - EMAIL IDS OF PLAYERS
game - IF GAME IS ON
turn - CURRENT TEAM PLAYING
dummy - SOCKET ID STORAGE
score - SCORES OF THE TWO TEAMS
rounds - ROUNDS LEFT
st - STATEMENT ISSUED ( removable )
word - WORD ISSUED ( removed )


#User
email - EMAIL-ID OF USER 
score - USERS SCORE TILL DATE
tempId - STORES SOCKET ID OF USER FOR THE GAME
room - STORES USER'S ROOM FOR THE GAME


Why this design ?

We want to keep in mind that user may loose internet connectivity.
To ensure a break-less gaming experience we store all nessecary info to ensure game runs smoothly even in absence of a user who could possibly be an integral part of the game

