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

let turn_index = 0;

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

const NotYourTurnJSON = {
    return_type: null,
    run: [
        {
            name: "NotYourTurnError",
            type: "MESSAGE",
            info: "You cannot do this as it is not your turn!"
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
            console.log("Recived Start Message!");
            if (authData[socket].Host) {
                if (sockets.length >= 2) {
                    if (sockets.length <= 6) {
                        build_pile_1 = [], build_pile_2 = [], build_pile_3 = [], build_pile_4 = [], turn_index = 0;
                        draw_pile = [...cards];
                        shuffle(draw_pile);
                        if (sockets.length <= 4) {
                            sockets.forEach(s => {
                                playerData[s].stock_pile = popMultCard(draw_pile, 30);
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
                                playerData[s].stock_pile = popMultCard(draw_pile, 20);
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
                            playerData[s].hand = popMultCard(draw_pile, 5);
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
        
        if (object.type === "PLACE") {
            console.log("REcived Place Message!");
            if (socket == sockets[turn_index]) {
                let pop = object.return.pop;
                let push = object.return.push;
                if (!((push === "Discard1Card" || push === "Discard2Card" || push === "Discard3Card" || push === "Discard4Card") && (pop === "Discard1Card" || pop === "Discard2Card" || pop === "Discard3Card" || pop === "Discard4Card"))) {
                    if (!((push === "Discard1Card" || push === "Discard2Card" || push === "Discard3Card" || push === "Discard4Card") && pop === "StockCard")) {
                        if (push === "Discard1Card" || push === "Discard2Card" || push === "Discard3Card" || push === "Discard4Card") {
                            pushCard(translateDeckName(push, socket), popHandCard(pop, socket));
                            turn_index++;
                            if (turn_index == sockets.length) turn_index = 0;
                        } else if (pop === "StockCard") {
                            if (CheckCardPlacement(translateDeckName(push, socket), getTopCard(translateDeckName(pop, socket)))) {
                                pushCard(translateDeckName(push, socket), getTopCard(translateDeckName(pop, socket)));
                            }
                        } else if (pop === "Hand1" || pop === "Hand2" || pop === "Hand3" || pop === "Hand4" || pop === "Hand5") {
                            if (CheckCardPlacement(translateDeckName(push, socket), translateDeckName(pop, socket))) {
                                pushCard(translateDeckName(push, socket), popHandCard(pop, socket));
                            }
                        }
                        socket.send(JSON.stringify({
                            return_type: null,
                            run: [
                                {
                                    name: "Hand1Card",
                                    type: "SET",
                                    value: playerData[socket].hand[0]
                                },
                                {
                                    name: "Hand2Card",
                                    type: "SET",
                                    value: playerData[socket].hand[1]
                                },
                                {
                                    name: "Hand3Card",
                                    type: "SET",
                                    value: playerData[socket].hand[2]
                                },
                                {
                                    name: "Hand4Card",
                                    type: "SET",
                                    value: playerData[socket].hand[3]
                                },
                                {
                                    name: "Hand5Card",
                                    type: "SET",
                                    value: playerData[socket].hand[4]
                                },
                                {
                                    name: "Discard1Card",
                                    type: "SET",
                                    value: getTopCard(playerData[socket].discard_pile_1)
                                },
                                {
                                    name: "Discard2Card",
                                    type: "SET",
                                    value: getTopCard(playerData[socket].discard_pile_2)
                                },
                                {
                                    name: "Discard3Card",
                                    type: "SET",
                                    value: getTopCard(playerData[socket].discard_pile_3)
                                },
                                {
                                    name: "Discard4Card",
                                    type: "SET",
                                    value: getTopCard(playerData[socket].discard_pile_4)
                                },
                                {
                                    name: "StockCard",
                                    type: "SET",
                                    value: getTopCard(playerData[socket].stock_pile)
                                }
                            ]
                        }));
                        sockets.forEach(s => {
                            s.send(JSON.stringify({
                                return_type: null,
                                run: [
                                    {
                                        name: "Build1Card",
                                        type: "SET",
                                        value: getTopCard(build_pile_1)
                                    },
                                    {
                                        name: "Build2Card",
                                        type: "SET",
                                        value: getTopCard(build_pile_2)
                                    },
                                    {
                                        name: "Build3Card",
                                        type: "SET",
                                        value: getTopCard(build_pile_3)
                                    },
                                    {
                                        name: "Build4Card",
                                        type: "SET",
                                        value: getTopCard(build_pile_4)
                                    }
                                ]
                            }));
                        });
                    }
                }
            } else {
                socket.send(JSON.stringify(NotYourTurnJSON));
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

function popMultCard(deck, amount) {
    if (deck.length >= amount) {
        let card = deck.splice(deck.length-amount-1, amount);
        return card;
    } else {
        return null;
    }
}

function translateDeckName(name, socket) {
    if (name === "Discard1Card") {
        return playerData[socket].discard_pile_1;
    } else if (name === "Discard2Card") {
        return playerData[socket].discard_pile_2;
    } else if (name === "Discard3Card") {
        return playerData[socket].discard_pile_3;
    } else if (name === "Discard4Card") {
        return playerData[socket].discard_pile_4;
    } else if (name === "Build1") {
        return build_pile_1;
    } else if (name === "Build2") {
        return build_pile_2;
    } else if (name === "Build3") {
        return build_pile_3;
    } else if (name === "Build4") {
        return build_pile_4;
    } else if (name === "StockCard") {
        return playerData[socket].stock_pile;
    } else if (name === "Hand1") {
        return playerData[socket].hand[0];
    } else if (name === "Hand2") {
        return playerData[socket].hand[1];
    } else if (name === "Hand3") {
        return playerData[socket].hand[2];
    } else if (name === "Hand4") {
        return playerData[socket].hand[3];
    } else if (name === "Hand5") {
        return playerData[socket].hand[4];
    }
}

function popHandCard(name, socket) {
    if (name === "Hand1") {
        return popCard(playerData[sockets].hand[0]);
    } else if (name === "Hand2") {
        return popCard(playerData[sockets].hand[1]);
    } else if (name === "Hand3") {
        return popCard(playerData[sockets].hand[2]);
    } else if (name === "Hand4") {
        return popCard(playerData[sockets].hand[3]);
    } else if (name === "Hand5") {
        return popCard(playerData[sockets].hand[4]);
    }
}

function CheckCardPlacement(deck, card) {
    if (card === "SB") return true;
    let top_card = getTopCard(deck);
    switch (top_card) {
        case null || undefined:
            if (card === "1") return true;
        case "1":
            if (card === "2") return true;
        case "2":
            if (card === "3") return true;
        case "3":
            if (card === "4") return true;
        case "4":
            if (card === "5") return true;
        case "5":
            if (card === "6") return true;
        case "6":
            if (card === "7") return true;
        case "7":
            if (card === "8") return true;
        case "8":
            if (card === "9") return true;
        case "9":
            if (card === "10") return true;
        case "10":
            if (card === "11") return true;
        case "11":
            if (card === "12") return true;
    }
    return false;
}