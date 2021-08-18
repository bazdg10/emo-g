# emo-g
# Node-js | socket-io | MongoDB

SCHEMAS :   Room    User

*game* event for any game related communication
*servermessages* event for room entry/ exit communication

Room
>  name <br />
  teams <br />
  current *last word*<br /> 
  player *Last player to give statement* <br />
  mails <br />
  game <br />
  turn <br />
  dummy *store socket ids of users*<br />
  score *store score of player*<br />
  rounds <br />
  st *Needed for data retrieval if statement player looses connectivity*  <br />
  word *Data retrieval* <br />


User
>  email <br />
  score  <br />
  tempId *Removed when user looses connectivity* <br />
  room *Removed when user looses connectivity*<br />
  

When user leaves game, we remove the socket id from Room of the user from database. <br />
Data Retrieval on user rejoining done through dummy array that stores the socket id.


