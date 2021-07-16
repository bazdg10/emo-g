const organisations = {}
// const departments = {}
// const players = {}
const createRoom = (org, dept, id) => {
    if (! (org in organisations)) {
        organisations[org] = []
    } 
    if (! (dept in organisations[org])) {
        organisations[org].push(dept)
        organisations[org][dept] = {}
    }    
    if (id in organisations[org][dept]) {
        joinRoom(org, dept, id)
        console.log(`Game On`)
    } else {
        organisations[org][dept] = {}
        organisations[org][dept][id] = 0
        console.log(organisations)
    }
}

const joinRoom = (org, dept, idt) => {
    console.log('Welcome to the game')
}

module.exports = {createRoom}