const WSURL = "ws://127.0.0.1:15000";
let socket;
let key;
let remove;
let extended;
let button;
let removeActive = false;
let extendedActive = false;
let card;
let backg;
let font;
let theme;
let path = "Assets/";
let playerListElement;
let playerList = [];

let playerData = {};

let themedata = {
    '0': [0,0,255],
    '1': [0,0,255],
    '2': [0,0,255],
    '3': [0,0,255],
    '4': [0,0,255],
    '5': [0,255,0],
    '6': [0,255,0],
    '7': [0,255,0],
    '8': [0,255,0],
    '9': [255,127,0],
    '10': [255,127,0],
    '11': [255,127,0],
    '12': [255,127,0],
    '13': [0,255,255],
    '14': [0,255,255],
    '15': [0,255,255],
    '16': [0,255,255],
    '17': [127,0,255],
    '18': [127,0,255],
    '19': [127,0,255],
    '20': [127,0,255],
    '21': [0,0,0],
    '22': [0,0,0],
    '23': [0,0,0],
    '24': [0,0,0],
    'SB': [255,0,0],
    'RC': [0,127,127],
    'Cannot Discard': [255,127,127],
    'Can Discard': [127,255,127]
};

function preload() {
    theme = prompt("Please enter a theme name: (Valid theme names are: 'Default' 'Thanksgiving' 'Winter' 'Christmas')");
    while (theme == null || theme == undefined || theme === "") {
        theme = prompt("Please enter a theme name: (Valid theme names are: 'Default' 'Thanksgiving' 'Winter' 'Christmas')");
    }
    path = path + theme + "/";
    card = loadImage(path + "card.png");
    backg = loadImage(path + "background.png");
    font = loadFont(path + "font.ttf");
    if (Math.floor(Math.random()*10) == 0) font = loadFont("Assets/font2.ttf");
}

function setup() {
    angleMode(DEGREES);
    key = prompt("Do you have a client key? (Only use if you got disconnected)");
    if (key === "" || key == undefined || key == null) {
        key = makeid(127);
    }
    alert("If you ever get disconnected please use the following client key in the previous message box to reconnect to the game. (Failure to do this will result in server bugs which requires a game restart!)");
    alert("Client Key: " + key);
    let scale = prompt("If you use a small screen please enter a scale value here. Default size is 800px by 800px. All size values will be diveded by this number. leave blank for 1");
    if (scale == null || scale == undefined || scale === "") {
        scaleFactor = 1;
    } else {
        scaleFactor = parseFloat(scale);
    }
    playerListElement = createElement("aside");
    extended = createButton("Extended Cards (false)");
    remove = createButton("Remove Cards (false)");
    button = createButton("Start");

    extended.hide();
    remove.hide();
    button.hide();

    readTextFile(path + "themedata.json", function(text) {
        themedata = JSON.parse(text);
    });

    createCanvas(800/scaleFactor,800/scaleFactor);
    createWSConnection();
    playerData.Discard = "Cannot Discard";

    remove.mousePressed(function() {
        if (removeActive) {
            removeActive = false;
            remove.html("Remove Cards (false)");
        } else {
            removeActive = true;
            remove.html("Remove Cards (true)");
        }
    });

    extended.mousePressed(function() {
        if (extendedActive) {
            extendedActive = false;
            extended.html("Extended Cards (false)");
        } else {
            extendedActive = true;
            extended.html("Extended Cards (true)");
        }
    });

    button.mousePressed(function() {
        socket.send(JSON.stringify({type:"START", clientKey: key, return: {extended: extendedActive, remove: removeActive}}));
    });
}

function draw() {
    background(127);
    image(backg,0,0,800/scaleFactor,800/scaleFactor);
    textFont(font);
    textSize(24);
    drawCard(playerData.StockCard, createVector(700/scaleFactor,600/scaleFactor),100/scaleFactor, "Stock Pile");

    drawCard(playerData.Discard1Card, createVector(200/scaleFactor,600/scaleFactor),100/scaleFactor, "Discard Pile");
    drawCard(playerData.Discard2Card, createVector(300/scaleFactor,600/scaleFactor),100/scaleFactor, "Discard Pile");
    drawCard(playerData.Discard3Card, createVector(400/scaleFactor,600/scaleFactor),100/scaleFactor, "Discard Pile");
    drawCard(playerData.Discard4Card, createVector(500/scaleFactor,600/scaleFactor),100/scaleFactor, "Discard Pile");

    drawCard(playerData.Build1Card, createVector(200/scaleFactor,0/scaleFactor),100/scaleFactor, "Build Pile");
    drawCard(playerData.Build2Card, createVector(300/scaleFactor,0/scaleFactor),100/scaleFactor, "Build Pile");
    drawCard(playerData.Build3Card, createVector(400/scaleFactor,0/scaleFactor),100/scaleFactor, "Build Pile");
    drawCard(playerData.Build4Card, createVector(500/scaleFactor,0/scaleFactor),100/scaleFactor, "Build Pile");

    drawCard(playerData.Hand1Card, createVector(150/scaleFactor,300/scaleFactor),100/scaleFactor, "Hand");
    drawCard(playerData.Hand2Card, createVector(250/scaleFactor,300/scaleFactor),100/scaleFactor, "Hand");
    drawCard(playerData.Hand3Card, createVector(350/scaleFactor,300/scaleFactor),100/scaleFactor, "Hand");
    drawCard(playerData.Hand4Card, createVector(450/scaleFactor,300/scaleFactor),100/scaleFactor, "Hand");
    drawCard(playerData.Hand5Card, createVector(550/scaleFactor,300/scaleFactor),100/scaleFactor, "Hand");

    drawCard(playerData.Discard, createVector(0/scaleFactor,600/scaleFactor), 100/scaleFactor, "You should not see this!");
}

function mouseClicked() { 
    if (checkPoint(700/scaleFactor,600/scaleFactor,100/scaleFactor)) {
        setValue("Selected", "StockCard");
    }

    if (checkPoint(200/scaleFactor,600/scaleFactor,100/scaleFactor)) {
        if (getValue("Discard") === "Cannot Discard") {
            setValue("Selected", "Discard1Card");
        } else {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Discard1Card"
                }
            }));
            setValue("Selected", undefined);
        }
    }
    if (checkPoint(300/scaleFactor,600/scaleFactor,100/scaleFactor)) {
        if (getValue("Discard") === "Cannot Discard") {
            setValue("Selected", "Discard2Card");
        } else {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Discard2Card"
                }
            }));
            setValue("Selected", undefined);
        }
    }
    if (checkPoint(400/scaleFactor,600/scaleFactor,100/scaleFactor)) {
        if (getValue("Discard") === "Cannot Discard") {
            setValue("Selected", "Discard3Card");
        } else {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Discard3Card"
                }
            }));
            setValue("Selected", undefined);
        }
    }
    if (checkPoint(500/scaleFactor,600/scaleFactor,100/scaleFactor)) {
        if (getValue("Discard") === "Cannot Discard") {
            setValue("Selected", "Discard4Card");
        } else {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Discard4Card"
                }
            }));
            setValue("Selected", undefined);
        }
    }

    if (checkPoint(150/scaleFactor,300/scaleFactor,100/scaleFactor)) {
        setValue("Selected", "Hand1Card");
    }
    if (checkPoint(250/scaleFactor,300/scaleFactor,100/scaleFactor)) {
        setValue("Selected", "Hand2Card");
    }
    if (checkPoint(350/scaleFactor,300/scaleFactor,100/scaleFactor)) {
        setValue("Selected", "Hand3Card");
    }
    if (checkPoint(450/scaleFactor,300/scaleFactor,100/scaleFactor)) {
        setValue("Selected", "Hand4Card");
    }
    if (checkPoint(550/scaleFactor,300/scaleFactor,100/scaleFactor)) {
        setValue("Selected", "Hand5Card");
    }

    if (checkPoint(200/scaleFactor,0/scaleFactor,100/scaleFactor)) {
        if (getValue("Selected") != null && getValue("Selected") != undefined) {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Build1"
                }
            }));
            setValue("Selected", undefined);
        }
    }
    if (checkPoint(300/scaleFactor,0/scaleFactor,100/scaleFactor)) {
        if (getValue("Selected") != null && getValue("Selected") != undefined) {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Build2"
                }
            }));
            setValue("Selected", undefined);
        }
    }
    if (checkPoint(400/scaleFactor,0/scaleFactor,100/scaleFactor)) {
        if (getValue("Selected") != null && getValue("Selected") != undefined) {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Build3"
                }
            }));
            setValue("Selected", undefined);
        }
    }
    if (checkPoint(500/scaleFactor,0/scaleFactor,100/scaleFactor)) {
        if (getValue("Selected") != null && getValue("Selected") != undefined) {
            socket.send(JSON.stringify({
                type: "PLACE",
                clientKey: key,
                return: {
                    pop: getValue("Selected"),
                    push: "Build4"
                }
            }));
            setValue("Selected", undefined);
        }
    }

    if (checkPoint(0/scaleFactor,600/scaleFactor,100/scaleFactor)) {
        if(getValue("Discard") === "Cannot Discard") {
            setValue("Discard", "Can Discard");
        } else {
            setValue("Discard", "Cannot Discard");
        }
    }

}

function drawCard(cardText, pos, size, tooltip) {
    if (cardText != null && cardText != undefined && cardText != "") {
        if (typeof(cardText) !== "string") cardText = "ERROR";
        let sb = false;
        let rc = false
        if (cardText.includes("~SB~")) {
            sb = true
            cardText = cardText.replace(/~SB~/g, "");
        }
        if (cardText.includes("~RC~")) {
            rc = true
            cardText = cardText.replace(/~RC~/g, "");
        }
        textAlign(CENTER, CENTER);
        fill(0,0,0,0);
        stroke(0);
        image(card,pos.x,pos.y,size,size*2)
        rect(pos.x,pos.y,size,size*2, 5, 5, 5, 5);
        if (themedata[cardText] != null && themedata[cardText] != undefined) {
            fill(themedata[cardText]);
        } else {
            fill([255,0,0]);
        }
        push();
        translate(pos.x, pos.y);
        text("" + cardText + "",0,0,size,size*2);
        pop();
        if (sb) {
            fill(themedata["SB"]);
            textSize(16);
            push();
            translate(pos.x,pos.y);
            textAlign(RIGHT, TOP);
            text("SB", 0, 0, size, size*2);
            pop();
            textSize(24);
        }
        if (rc) {
            fill(themedata["RC"]);
            textSize(16);
            push();
            translate(pos.x,pos.y);
            textAlign(RIGHT, TOP);
            text("RC", 0, 0, size, size*2);
            pop();
            textSize(24);
        }
        fill(0);
        stroke(0,0,0,0);
        textAlign(LEFT, TOP);
    } else {
        fill(0,0,0,0);
        stroke(0);
        rect(pos.x, pos.y, size,size*2, 5, 5, 5, 5);
        fill(0);
        textAlign(CENTER, CENTER);
        text(tooltip,pos.x,pos.y,size,size*2);
        stroke(0,0,0,0);
    }
}

function createWSConnection() {
    socket = new WebSocket(WSURL);
    socket.addEventListener('open', socketOpen);
    socket.addEventListener('close', socketClose);
    socket.addEventListener('error', socketError);
    socket.addEventListener('message', socketMessage);
}

function socketOpen(event) {
    /*let data = {
        type: "OPEN"
    }
    socket.send(JSON.stringify(data));*/
}

function socketClose(event) {
    createWSConnection();
}

function socketError(event) {

}

function socketMessage(event) {
    let object = JSON.parse(event.data);
    if (object.clientKey != null && object.clientKey != undefined && object.clientKey != key) {
        object = {};
        return;
    } else {
        let type = object.return_type;
        let data = {return: {}};
        object.run.forEach(command => {
            if (command.type === "MESSAGE") {
                data.return[command.name] = infoMessage(command.info);
            }
            if (command.type === "PROMPT") {
                data.return[command.name] = infoPrompt(command.info);
            }
            if (command.type === "SET") {
                data.return[command.name] = setValue(command.name, command.value);
            }
            if (command.type === "ADD") {
                addPlayer(command.value);
                data.return[command.name] = "OK";
            }
        });
        data.type = type;
        data.clientKey = key;
        if (type != null && type != undefined) socket.send(JSON.stringify(data));
    }
}

function infoMessage(info) {
    alert(info);
    return null;
}

function infoPrompt(info) {
    let value;  
    while (value == null || value == undefined) {
        value = prompt(info);
    }
    return value
}

function setValue(key, value) {
    console.log("Setting: '" + key + "' to: '" + value + "'!");
    playerData[key] = value;

    if (key === "Host") {
        if (value) {
            button.show();
            remove.show();
            extended.show();
        } else {
            button.hide();
            remove.hide();
            extended.hide();
        }
    }
    if (key === "playerList" || key === "selectedPlayer" || key === "otherCards") {
        let str = "";
        let tmp = "";
        let tmp2 = ""
        playerData.playerList.forEach(p => {
            if (playerData.selectedPlayer != null && playerData.selectedPlayer != undefined) {
                if (p === playerData.selectedPlayer) {
                    tmp = "<span style='color:#FF7F00;'>" +  "=> " + "</span>";
                } else {
                    tmp = "";
                }
            }

            if (playerData.otherCards == null || playerData.otherCards == undefined) {
                playerData.otherCards = {};
            }

            if(playerData.otherCards[p] == null || playerData.otherCards[p] == undefined) {
                playerData.otherCards[p] = {
                    "StockCard": " ",
                    "StockAmount": 0
                };
            }
            if (playerData.otherCards[p].StockAmount <= 5) {
                tmp2 = "<span style='color:red; font-family: " + (theme + "-theme") + ";'>" + playerData.otherCards[p]["StockCard"] + "</span>";
            } else if (playerData.otherCards[p].StockAmount <= 5) {
                tmp2 = "<span style='color:blue; font-family: " + (theme + "-theme") + ";'>" + playerData.otherCards[p]["StockCard"] + "</span>";
            } else {
                tmp2 = "<span style='font-family: " + (theme + "-theme") + ";'>" + playerData.otherCards[p]["StockCard"] + "</span>";
            }

            str = str + "<span>" + tmp + p + " [" + tmp2 + "]" +  "</span><hr/>"
        });
        playerListElement.html(str);
    }

    return value;
}

function getValue(key) {
    return playerData[key];
}

function checkPoint(x1,y1,x2) {
    let y2 = x2*2;
    if (mouseX >= x1 && mouseY >= y1 && mouseX <= x1+x2 && mouseY <= y1+y2) {
        return true;
    }
    return false;
}

function makeid(length) {
    var result           = '';
    var characters       = 'BCDFGHJKLMNPQRSTVWXZbcdfghjklmnpqrstvwxz0123456789';  //Removed some letters to make sure no words can be made!
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
