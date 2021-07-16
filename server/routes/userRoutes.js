rooms = {}
const createRoom = (org, dept) => {
    var o = org
    var d = dept
    if (o in rooms && d in rooms[o]){
        console.log(`Game going on`)
    } else {
        rooms[o] = []
        rooms[o].push(d)
        console.log(rooms)
    }
}
module.exports = {createRoom}