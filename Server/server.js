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

const extended_cards = ["13","13","13","13","13","13","13","13","13","13","13","13",
                        "14","14","14","14","14","14","14","14","14","14","14","14",
                        "15","15","15","15","15","15","15","15","15","15","15","15",
                        "16","16","16","16","16","16","16","16","16","16","16","16",
                        "17","17","17","17","17","17","17","17","17","17","17","17",
                        "18","18","18","18","18","18","18","18","18","18","18","18",
                        "19","19","19","19","19","19","19","19","19","19","19","19",
                        "20","20","20","20","20","20","20","20","20","20","20","20",
                        "21","21","21","21","21","21","21","21","21","21","21","21",
                        "22","22","22","22","22","22","22","22","22","22","22","22",
                        "23","23","23","23","23","23","23","23","23","23","23","23",
                        "24","24","24","24","24","24","24","24","24","24","24","24"]

const remove_cards = [  "RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC","RC"  ]

let draw_pile = [], build_pile_1 = [], build_pile_2 = [], build_pile_3 = [], build_pile_4 = [], build_piles = [];

let turn_index = 0;

let topCard = "12";

const password = "LetUsPlay";
const hostpassword = "GimmieHost"

/*
    JSON Messages
*/

const CheckJSON = {
    return_type: "CHECK",
    run: []
}

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
let keys = [];
let playerData = {};
let authData = {};

/*
    Server Handling
*/

server.on('connection', function(socket) {
    sockets.push(socket);
    console.log("Connection recived!");
    
    
    socket.send(JSON.stringify(CheckJSON));

    // When you receive a message, do stuff
    socket.on('message', function(msg) {
        let object = JSON.parse(msg) //create Object
        if (object.type === "CHECK") {
            if (keys.includes(object.clientKey)) {
                authData[object.clientKey].socket = socket;
            } else {
                socket.send(JSON.stringify(LoginJSON));
            }
        }

        if (object.type === "LOGIN") { //Login
            console.log("Recived Login message!");
            authData[object.clientKey] = {socket: socket};
            if (object.return.password === password) {
                authData[object.clientKey].Auth = true;
            }
            if (object.return.hostpassword === hostpassword) {
                authData[object.clientKey].Host = true;
            }
            if (authData[object.clientKey].Auth) {
                keys.push(object.clientKey);
                socket.send(JSON.stringify(NameJSON))
            } else {
                socket.send(JSON.stringify(AuthFailedJSON))
            }
        }

        if (object.type === "NAME") { //Set Name
            console.log("Recived Name Message!")
            if (authData[object.clientKey].Auth) {
                let found = false;
                keys.forEach(s => {
                    if (playerData[s] != null && playerData[s] != undefined) {
                        if (playerData[s].name === object.return.name) {found = true;}
                    }
                });
                if (found) {
                    socket.send(JSON.stringify(NameTakenJSON));
                } else {
                    playerData[object.clientKey] = createPlayerData(object.return.name, authData[object.clientKey].Host);
                    socket.send(JSON.stringify({
                        return_type: null,
                        clientKey: object.clientKey,
                        run: [
                            {
                                name: "Host",
                                type: "SET",
                                value: authData[object.clientKey].Host
                            },
                            {
                                name: "Name",
                                type: "SET",
                                value: playerData[object.clientKey].name
                            }
                        ]
                    }));
                }
            }
        }

        if (object.type === "START") {
            console.log("Recived Start Message!");
            if (authData[object.clientKey].Host) {
                if (sockets.length >= 2) {
                    if (sockets.length <= 6) {
                        build_pile_1 = [], build_pile_2 = [], build_pile_3 = [], build_pile_4 = [], turn_index = 0;
                        draw_pile = [...cards];
                        if (object.return.extended) {
                            topCard = "24"
                            for (let i=0;i<extended_cards.length;i++) {
                                draw_pile.push(extended_cards[i])
                            }
                        } else {
                            topCard = "12"
                        }
                        if (object.return.remove) {
                            for (let i=0;i<remove_cards.length;i++) {
                                draw_pile.push(remove_cards[i])
                            }
                        }
                        shuffle(draw_pile);
                        if (sockets.length <= 4) {
                            keys.forEach(s => {
                                playerData[s].stock_pile = popMultCard(draw_pile, 30);
                                authData[s].socket.send(JSON.stringify({
                                    return_type: null,
                                    clientKey: s,
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
                            keys.forEach(s => {
                                playerData[s].stock_pile = popMultCard(draw_pile, 20);
                                authData[s].socket.send(JSON.stringify({
                                    return_type: null,
                                    clientKey: s,
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
                        keys.forEach(s => {
                            playerData[s].hand = popMultCard(draw_pile, 5);
                            authData[s].socket.send(JSON.stringify({
                                return_type: null,
                                clientKey: s,
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
                                    },
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
                                    },
                                    {
                                        name: "Discard1Card",
                                        type: "SET",
                                        value: getTopCard(playerData[s].discard_pile_1)
                                    },
                                    {
                                        name: "Discard2Card",
                                        type: "SET",
                                        value: getTopCard(playerData[s].discard_pile_2)
                                    },
                                    {
                                        name: "Discard3Card",
                                        type: "SET",
                                        value: getTopCard(playerData[s].discard_pile_3)
                                    },
                                    {
                                        name: "Discard4Card",
                                        type: "SET",
                                        value: getTopCard(playerData[s].discard_pile_4)
                                    },
                                    {
                                        name: "StockCard",
                                        type: "SET",
                                        value: getTopCard(playerData[s].stock_pile)
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
            console.log("Recived Place Message!");
            if (object.clientKey == keys[turn_index]) {
                let pop = object.return.pop;
                let push = object.return.push;
                if (pop == null || pop == undefined) return;
                if (!((push === "Discard1Card" || push === "Discard2Card" || push === "Discard3Card" || push === "Discard4Card") && (pop === "Discard1Card" || pop === "Discard2Card" || pop === "Discard3Card" || pop === "Discard4Card"))) {
                    if (!((push === "Discard1Card" || push === "Discard2Card" || push === "Discard3Card" || push === "Discard4Card") && pop === "StockCard")) {
                        if (push === "Discard1Card" || push === "Discard2Card" || push === "Discard3Card" || push === "Discard4Card") {
                            pushCard(translateDeckName(push, object.clientKey), popHandCard(pop, object.clientKey));
                            turn_index++;
                            if (turn_index == keys.length) turn_index = 0;
                            for (let i=0;i<5;i++) {
                                if (playerData[keys[turn_index]].hand[i] == null || playerData[keys[turn_index]].hand[i] == undefined) {
                                    playerData[keys[turn_index]].hand[i] = popCard(draw_pile);
                                    while (typeof(playerData[keys[turn_index]].hand[i]) !== "string") {
                                        console.log("FIXING ERROR CARD! Client Key: " + [keys[turn_index]]);
                                        console.log("Old Value: " + playerData[keys[turn_index]].hand[i]);
                                        playerData[keys[turn_index]].hand[i] = popCard(draw_pile);
                                        console.log("New Value: " + playerData[keys[turn_index]].hand[i]);
                                    }
                                }
                            }
                            keys.forEach(s => {
                                authData[s].socket.send(JSON.stringify({
                                    return_type: null,
                                    clientKey: keys[turn_index],
                                    run: [
                                        {
                                            name: "TurnAlert",
                                            type: "MESSAGE",
                                            info: "It is now your turn!"
                                        },
                                        {
                                            name: "Hand1Card",
                                            type: "SET",
                                            value: playerData[keys[turn_index]].hand[0]
                                        },
                                        {
                                            name: "Hand2Card",
                                            type: "SET",
                                            value: playerData[keys[turn_index]].hand[1]
                                        },
                                        {
                                            name: "Hand3Card",
                                            type: "SET",
                                            value: playerData[keys[turn_index]].hand[2]
                                        },
                                        {
                                            name: "Hand4Card",
                                            type: "SET",
                                            value: playerData[keys[turn_index]].hand[3]
                                        },
                                        {
                                            name: "Hand5Card",
                                            type: "SET",
                                            value: playerData[keys[turn_index]].hand[4]
                                        }
                                    ]
                                }));
                            });
                            countCards();
                        } else if (pop === "StockCard" || pop === "Discard1Card" || pop === "Discard2Card" || pop === "Discard3Card" || pop === "Discard4Card") {
                            if (getTopCard(translateDeckName(pop, object.clientKey)) === "SB") {
                                let old = popCard(translateDeckName(pop, object.clientKey));
                                let top_card = getTopCard(translateDeckName(push, object.clientKey));
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~SB~/g, "");
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~RC~/g, "");
                                if (top_card == null || top_card == undefined || top_card == Number.NaN) top_card = "0";
                                pushCard(translateDeckName(pop, object.clientKey),"~SB~".concat(parseInt(top_card) + 1));
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~SB~/g, "");
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~RC~/g, "");
                                if ((top_card == null || top_card == undefined || top_card == Number.NaN || top_card === "0") && old === "RC") return;
                                pushCard(translateDeckName(pop, object.clientKey),"~RC~".concat(parseInt(top_card) + -1));
                            }
                            if (CheckCardPlacement(translateDeckName(push, object.clientKey), getTopCard(translateDeckName(pop, object.clientKey)))) {
                                pushCard(translateDeckName(push, object.clientKey), popCard(translateDeckName(pop, object.clientKey)));
                            }
                            if (pop === "StockCard" && playerData[object.clientKey].stock_pile.length <= 0) {
                                keys.forEach(s => {
                                    authData[s].socket.send(JSON.stringify({
                                        return_type: null,
                                        clicntKey: null,
                                        run: [
                                            {
                                                name: "WinMessage",
                                                type: "MESSAGE",
                                                info: playerData[object.clientKey].name + " has won the game!"
                                            },
                                            {
                                                name: "WinMessage_02",
                                                type: "MESSAGE",
                                                info: "Please wait for the host to start a new game!"
                                            }
                                        ]
                                    }));
                                });
                            } 
                        } else if (pop === "Hand1Card" || pop === "Hand2Card" || pop === "Hand3Card" || pop === "Hand4Card" || pop === "Hand5Card") {
                            if (translateDeckName(pop, object.clientKey) === "SB") {
                                let top_card = getTopCard(translateDeckName(push, object.clientKey));
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~SB~/g, "");
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~RC~/g, "");
                                if (top_card == null || top_card == undefined || top_card == Number.NaN) top_card = "0";
                                let deck = translateDeckName(pop, object.clientKey);
                                setHandCard(pop, object.clientKey, "~SB~".concat(parseInt(top_card) + 1));
                            }
                            if (translateDeckName(pop, object.clientKey) === "RC") {
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~SB~/g, "");
                                if (top_card != undefined && top_card != null) top_card = top_card.replace(/~RC~/g, "");
                                if ((top_card == null || top_card == undefined || top_card == Number.NaN || top_card === "0") && translateDeckName(pop, object.clientKey) === "RC") return;
                                setHandCard(pop, object.clientKey, "~RC~".concat(parseInt(top_card) + -1));
                            }

                            if (CheckCardPlacement(translateDeckName(push, object.clientKey), translateDeckName(pop, object.clientKey))) {
                                pushCard(translateDeckName(push, object.clientKey), popHandCard(pop, object.clientKey));
                                let count = 0;
                                for (let i=0;i<5;i++) {
                                    if (playerData[object.clientKey].hand[i] == null || playerData[object.clientKey].hand[i] == undefined) count++;
                                }
                                if (count >= 5) {
                                    playerData[object.clientKey].hand = popMultCard(draw_pile, 5);
                                    authData[object.clientKey].socket.send(JSON.stringify({
                                        return_type: null,
                                        clientKey: object.clientKey,
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
                                }
                            }
                        }

                        let card = getTopCard(build_pile_1);
                        if (card != undefined && card != null) card = card.replace(/~SB~/g, "");
                        if (card != undefined && card != null) card = card.replace(/~RC~/g, "");
                        if (card === topCard) {
                            for (let i=0;i<build_pile_1.length;i++) {
                                if (build_pile_1[i].includes("~SB~")) {
                                    build_pile_1[i] = "SB";
                                }
                                if (build_pile_1[i].includes("~RC~")) {
                                    build_pile_1[i] = "RC";
                                }
                                draw_pile.push(build_pile_1[i])
                            }
                            shuffle(draw_pile);
                            build_pile_1 = [];
                        }
                        card = getTopCard(build_pile_2);
                        if (card != undefined && card != null) card = card.replace(/~SB~/g, "");
                        if (card != undefined && card != null) card = card.replace(/~RC~/g, "");
                        if (card === topCard) {
                            for (let i=0;i<build_pile_2.length;i++) {
                                if (build_pile_2[i].includes("~SB~")) {
                                    build_pile_2[i] = "SB";
                                }
                                if (build_pile_2[i].includes("~RC~")) {
                                    build_pile_2[i] = "RC";
                                }
                                draw_pile.push(build_pile_2[i])
                            }
                            shuffle(draw_pile);
                            build_pile_2 = [];
                        }
                        card = getTopCard(build_pile_3);
                        if (card != undefined && card != null) card = card.replace(/~SB~/g, "");
                        if (card != undefined && card != null) card = card.replace(/~RC~/g, "");
                        if (card === topCard) {
                            for (let i=0;i<build_pile_3.length;i++) {
                                if (build_pile_3[i].includes("~SB~")) {
                                    build_pile_3[i] = "SB";
                                }
                                if (build_pile_3[i].includes("~RC~")) {
                                    build_pile_3[i] = "RC";
                                }
                                draw_pile.push(build_pile_3[i])
                            }
                            shuffle(draw_pile);
                            build_pile_3 = [];
                        }
                        card = getTopCard(build_pile_4);
                        if (card != undefined && card != null) card = card.replace(/~SB~/g, "");
                        if (card != undefined && card != null) card = card.replace(/~RC~/g, "");
                        if (card === topCard) {
                            for (let i=0;i<build_pile_4.length;i++) {
                                if (build_pile_4[i].includes("~SB~")) {
                                    build_pile_4[i] = "SB";
                                }
                                if (build_pile_4[i].includes("~RC~")) {
                                    build_pile_4[i] = "RC";
                                }
                                draw_pile.push(build_pile_4[i])
                            }
                            shuffle(draw_pile);
                            build_pile_4 = [];
                        }

                        socket.send(JSON.stringify({
                            return_type: null,
                            clientkey: object.clientKey,
                            run: [
                                {
                                    name: "Hand1Card",
                                    type: "SET",
                                    value: playerData[object.clientKey].hand[0]
                                },
                                {
                                    name: "Hand2Card",
                                    type: "SET",
                                    value: playerData[object.clientKey].hand[1]
                                },
                                {
                                    name: "Hand3Card",
                                    type: "SET",
                                    value: playerData[object.clientKey].hand[2]
                                },
                                {
                                    name: "Hand4Card",
                                    type: "SET",
                                    value: playerData[object.clientKey].hand[3]
                                },
                                {
                                    name: "Hand5Card",
                                    type: "SET",
                                    value: playerData[object.clientKey].hand[4]
                                },
                                {
                                    name: "Discard1Card",
                                    type: "SET",
                                    value: getTopCard(playerData[object.clientKey].discard_pile_1)
                                },
                                {
                                    name: "Discard2Card",
                                    type: "SET",
                                    value: getTopCard(playerData[object.clientKey].discard_pile_2)
                                },
                                {
                                    name: "Discard3Card",
                                    type: "SET",
                                    value: getTopCard(playerData[object.clientKey].discard_pile_3)
                                },
                                {
                                    name: "Discard4Card",
                                    type: "SET",
                                    value: getTopCard(playerData[object.clientKey].discard_pile_4)
                                },
                                {
                                    name: "StockCard",
                                    type: "SET",
                                    value: getTopCard(playerData[object.clientKey].stock_pile)
                                }
                            ]
                        }));
                        keys.forEach(s => {
                            authData[s].socket.send(JSON.stringify({
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
    } else if (name === "Hand1Card") {
        return playerData[socket].hand[0];
    } else if (name === "Hand2Card") {
        return playerData[socket].hand[1];
    } else if (name === "Hand3Card") {
        return playerData[socket].hand[2];
    } else if (name === "Hand4Card") {
        return playerData[socket].hand[3];
    } else if (name === "Hand5Card") {
        return playerData[socket].hand[4];
    }
}

function popHandCard(name, socket) {
    if (name === "Hand1Card") {
        let card = playerData[socket].hand[0];
        playerData[socket].hand[0] = undefined;
        return card;
    } else if (name === "Hand2Card") {
        let card = playerData[socket].hand[1];
        playerData[socket].hand[1] = undefined;
        return card;
    } else if (name === "Hand3Card") {
        let card = playerData[socket].hand[2];
        playerData[socket].hand[2] = undefined;
        return card;
    } else if (name === "Hand4Card") {
        let card = playerData[socket].hand[3];
        playerData[socket].hand[3] = undefined;
        return card;
    } else if (name === "Hand5Card") {
        let card = playerData[socket].hand[4];
        playerData[socket].hand[4] = undefined;
        return card;
    }
}

function setHandCard(name, socket, value) {
    if (name === "Hand1Card") {
        playerData[socket].hand[0] = value;
    } else if (name === "Hand2Card") {
        playerData[socket].hand[1] = value;
    } else if (name === "Hand3Card") {
        playerData[socket].hand[2] = value;
    } else if (name === "Hand4Card") {
        playerData[socket].hand[3] = value;
    } else if (name === "Hand5Card") {
        playerData[socket].hand[4] = value;
    }
}

function CheckCardPlacement(deck, card) {
    let top_card = getTopCard(deck);
    if (card != undefined && card != null && card.includes("~RC~")) return true;
    if (top_card != undefined && top_card != null) top_card = top_card.replace(/~SB~/g, "");
    if (card != undefined && card != null) card = card.replace(/~SB~/g, "");
    if (top_card == null || top_card == undefined || top_card == Number.NaN) top_card = "0";
    top_card = parseInt(top_card);
    card = parseInt(card);
    if (card == top_card + 1) {
        return true;
    }
    return false;
}

function countCards() {
    let count = 0;
    count = count + draw_pile.length;
    count = count + build_pile_1.length;
    count = count + build_pile_2.length;
    count = count + build_pile_3.length;
    count = count + build_pile_4.length;
    for (let i=0; i<keys.length; i++) {
        count = count + playerData[keys[i]].discard_pile_1.length;
        count = count + playerData[keys[i]].discard_pile_2.length;
        count = count + playerData[keys[i]].discard_pile_3.length;
        count = count + playerData[keys[i]].discard_pile_4.length;
        count = count + playerData[keys[i]].stock_pile.length;
        for (let j=0; j<5;j++) {
            if (playerData[keys[i]].hand[j] != null && playerData[keys[i]].hand[j] != undefined) {
                count++;
            }
        }
    }
    console.log("Card Amount: " + count);
    if (count != 162) console.log("CARD ERROR");
    console.log(draw_pile);
}