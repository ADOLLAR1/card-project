const { strict } = require('assert');
const WebSocket = require('ws');
const server = new WebSocket.Server({
    port: 15000
});

const cards = [ "1","1","1","1","1","1","1","1","1","1","1","1",
                "2","2","2","2","2","2","2","2","2","2","2","2",
                "3","3","3","3","3","3","3","3","3","3","3","3",
                "4","4","4","4","4","4","4","4","4","4","4","4",
                "5","5","5","5","5","5","5","5","5","5","5","5",
                "6","6","6","6","6","6","6","6","6","6","6","6",
                "7","7","7","7","7","7","7","7","7","7","7","7",
                "8","8","8","8","8","8","8","8","8","8","8","8",
                "9","9","9","9","9","9","9","9","9","9","9","9",
                "10","10","10","10","10","10","10","10","10","10","10","10",
                "11","11","11","11","11","11","11","11","11","11","11","11",
                "12","12","12","12","12","12","12","12","12","12","12","12",
                "SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB","SB" ]

let draw_pile = [], build_pile_1 = [], build_pile_2 = [], build_pile_3 = [], build_pile_4 = [];

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
            info: "Host Password (Press OK)"
        }
    ]
}

const AuthFailedJSON = {
    return_type: "LOGIN",
    run: [
        {
            name: "AuthError",
            type: "MESSAGE",
            info: "Incorrect password! Please try again!"
        },
        {
            name: "password",
            type: "PROMPT",
            info: "Password"
        },
        {
            name: "hostpassword",
            type: "PROMPT",
            info: "Host Password (Press OK)"
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
            info: "Name already taken! Please try again!"
        },
        {
            name: "name",
            type: "PROMPT",
            info: "Enter your name"
        }
    ]
}

const NotHostJSON = {
    return_type: null,
    run: [
        {
            name: "NotHostError",
            type: "MESSAGE",
            info: "You are not host and cannot do this!"
        }
    ]
}

const NotEnoughPlayersJSON = {
    return_type: null,
    run: [
        {
            name: "NotEnoughPlayersError",
            type: "MESSAGE",
            info: "Not enough players to start the game!"
        }
    ]
}

const TooManyPlayersJSON = {
    return_type: null,
    run: [
        {
            name: "TooManyPlayersError",
            type: "MESSAGE",
            info: "Too many players to start the game!"
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
    console.log("Connection recived!");
    
    
    socket.send(JSON.stringify(LoginJSON));

    // When you receive a message, do stuff
    socket.on('message', function(msg) {
        let object = JSON.parse(msg) //create Object

        if (object.type === "LOGIN") { //Login
            console.log("Recived Login message!");
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
            console.log("Recived Name Message!")
            if (authData[socket].Auth) {
                let found = false;
                sockets.forEach(s => {
                    if (playerData[s] != null) {
                        if (playerData[s].name === object.return.name) {found = true;}
                    }
                });
                if (found) {
                    socket.send(JSON.stringify(NameTakenJSON));
                } else {
                    playerData[socket] = createPlayerData(object.return.name, authData[socket].Host);
                    socket.send(JSON.stringify({
                        return_type: null,
                        run: [
                            {
                                name: "Host",
                                type: "SET",
                                value: authData[socket].Host
                            },
                            {
                                name: "Name",
                                type: "SET",
                                value: playerData[socket].name
                            }
                        ]
                    }));
                }
            }
        }

        if (object.type === "START") {
            console.log(sockets.length);
            console.log (authData[socket].Host);
            console.log("Recived Start Message!");
            if (authData[socket].Host) {
                if (sockets.length >= 2) {
                    if (sockets.length <= 6) {
                        build_pile_1 = [], build_pile_2 = [], build_pile_3 = [], build_pile_4 = [];
                        draw_pile = [...cards];
                        shuffle(draw_pile);
                        if (sockets.length <= 4) {
                            sockets.forEach(s => {
                                for (let i = 0; i < 30; i++) {
                                    pushCard(playerData[s].stock_pile, popCard(draw_pile));
                                }
                                s.send(JSON.stringify({
                                    return_type: null,
                                    run: [
                                        {
                                            name: "StockCard",
                                            type: "SET",
                                            value: getTopCard(playerData[s].stock_pile)
                                        }
                                    ]
                                }));
                            });
                        } else {
                            sockets.forEach(s => {
                                let temp_pile = []
                                for (let i = 0; i < 20; i++) {
                                    pushCard(playerData[s].stock_pile, popCard(draw_pile));
                                }
                                s.send(JSON.stringify({
                                    return_type: null,
                                    run: [
                                        {
                                            name: "StockCard",
                                            type: "SET",
                                            value: getTopCard(playerData[s].stock_pile)
                                        }
                                    ]
                                }));
                            });
                        }
                        sockets.forEach(s => {
                            for (let i = 0; i < 5; i++) {
                                pushCard(playerData[s].hand, popCard(draw_pile));
                            }
                            s.send(JSON.stringify({
                                return_type: null,
                                run: [
                                    {
                                        name: "Hand1Card",
                                        type: "SET",
                                        value: playerData[s].hand[0]
                                    },
                                    {
                                        name: "Hand2Card",
                                        type: "SET",
                                        value: playerData[s].hand[1]
                                    },
                                    {
                                        name: "Hand3Card",
                                        type: "SET",
                                        value: playerData[s].hand[2]
                                    },
                                    {
                                        name: "Hand4Card",
                                        type: "SET",
                                        value: playerData[s].hand[3]
                                    },
                                    {
                                        name: "Hand5Card",
                                        type: "SET",
                                        value: playerData[s].hand[4]
                                    }
                                ]
                            }));
                        });
                    } else {
                        socket.send(JSON.stringify(TooManyPlayersJSON));
                    }
                } else {
                    socket.send(JSON.stringify(NotEnoughPlayersJSON));
                }
            } else {
                socket.send(JSON.stringify(NotHostJSON));
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
        host: host,
        stock_pile: [],
        discard_pile_1: [],
        discard_pile_2: [],
        discard_pile_3: [],
        discard_pile_4: [],
        hand: []
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 != currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function pushCard(deck, card) {
    deck.push(card);
}

function popCard(deck) {

    if (deck.length >= 1) {
        let card = deck.pop();
        return card;
    }
    return null;
}

function getTopCard(deck) {
    if (deck.length >= 1) {
        let card = deck[deck.length-1];
        return card;
    }
    return null;
}
