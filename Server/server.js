const { Socket } = require('dgram');
const WebSocket = require('ws');
const server = new WebSocket.Server({
    port: 15000
});

/*
    JSON Messages
*/

const LoginJSON = {
    return_type: "LOGIN",
    run: [
        {
            name: "password",
            type: "PROMPT",
            info: "Password"
        },
        {
            name: "hostpassword",
            type: "PROMPT",
            info: "Host Password (Press Skip)"
        }
    ]
}

const AuthFailedJSON = {
    return_type: null,
    run: [
        {
            name: "AuthError",
            type: "MESSAGE",
            info: "Incorrect password. Please reload and try again."
        }
    ]
}

const NameJSON = {
    return_type: "NAME",
    run: [
        {
            name: "name",
            type: "PROMPT",
            info: "Enter your name"
        }
    ]
}

/*
    Data Holding
*/

let sockets = [];
let playerData = {};
let authData = {};

/*
    Server Handling
*/

server.on('connection', function(socket) {
    sockets.push(socket);
    
    
    socket.send(JSON.stringify(LoginJSON));

    // When you receive a message, do stuff
    socket.on('message', function(msg) {
        let object = JSON.parse(msg) //create Object

        if (object.type === "LOGIN") { //Login
            authData[socket] = {};
            if (object.return.password === "LetUsPlay") {
                authData[socket].Auth = true;
            }
            if (object.return.hostpassword === "GimmieHost") {
                authData[socket].Host = true;
            }
            if (authData[socket].Auth) {
                socket.send(JSON.stringify(NameJSON))
            } else {
                socket.send(JSON.stringify(AuthFailedJSON))
            }
        }

        if (object.type === "NAME") { //Set Name
            if (authData[socket].Auth) {
                playerData[socket] = createPlayerData(object.return.name, authData[socket].Host);
            }
        }
    });
  
    // When a socket closes, or disconnects, remove it from the array and all other data related to it.
    socket.on('close', function() {
        sockets = sockets.filter(s => s !== socket);
        authData[socket] = {};
        playerData[socket] = {};
    });
});


function createPlayerData(name, host) {
    return {
        name: name,
        host: host
    }
}