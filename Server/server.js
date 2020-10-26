const WebSocket = require('ws');
const server = new WebSocket.Server({
    port: 15000
});

const password = "LetUsPlay";
const hostpassword = "GimmieHost"

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
            info: "Incorrect password! Please reload and try again!"
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

const NameTakenJSON = {
    return_type: "NAME",
    run: [
        {
            name: "NameError",
            type: "MESSAGE",
            info: "Name Already Taken! Please Try again!"
        },
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
            if (object.return.password === password) {
                authData[socket].Auth = true;
            }
            if (object.return.hostpassword === hostpassword) {
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
                let found = false;
                sockets.forEach(s => {
                    if (playerData[s].name === object.return.name) {found = true;}
                });
                if (found) {
                    socket.send(JSON.stringify(NameTakenJSON));
                } else {
                    playerData[socket] = createPlayerData(object.return.name, authData[socket].Host);
                }
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