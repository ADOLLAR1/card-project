const WSURL = "ws://127.0.0.1:15000";
let socket;
let key;

let playerData = {};

function preload() {}

function setup() {
    key = makeid(127);
    createCanvas(800,800);
    createWSConnection();
    playerData.Discard = "Cannot Discard";
}

function draw() {
    background(127);
    textSize(18);
    drawCard(playerData.StockCard, createVector(700,600),100, "Stock Pile");

    drawCard(playerData.Discard1Card, createVector(200,600),100, "Discard Pile");
    drawCard(playerData.Discard2Card, createVector(300,600),100, "Discard Pile");
    drawCard(playerData.Discard3Card, createVector(400,600),100, "Discard Pile");
    drawCard(playerData.Discard4Card, createVector(500,600),100, "Discard Pile");

    drawCard(playerData.Build1Card, createVector(200,0),100, "Build Pile");
    drawCard(playerData.Build2Card, createVector(300,0),100, "Build Pile");
    drawCard(playerData.Build3Card, createVector(400,0),100, "Build Pile");
    drawCard(playerData.Build4Card, createVector(500,0),100, "Build Pile");

    drawCard(playerData.Hand1Card, createVector(150,300),100, "Hand");
    drawCard(playerData.Hand2Card, createVector(250,300),100, "Hand");
    drawCard(playerData.Hand3Card, createVector(350,300),100, "Hand");
    drawCard(playerData.Hand4Card, createVector(450,300),100, "Hand");
    drawCard(playerData.Hand5Card, createVector(550,300),100, "Hand");

    drawCard(playerData.Discard, createVector(0,600), 100, "You should not see this!")
}

function mouseClicked() { 
    if (checkPoint(700,600,100)) {
        setValue("Selected", "StockCard");
    }

    if (checkPoint(200,600,100)) {
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
    if (checkPoint(300,600,100)) {
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
    if (checkPoint(400,600,100)) {
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
    if (checkPoint(500,600,100)) {
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

    if (checkPoint(150,300,100)) {
        setValue("Selected", "Hand1Card");
    }
    if (checkPoint(250,300,100)) {
        setValue("Selected", "Hand2Card");
    }
    if (checkPoint(350,300,100)) {
        setValue("Selected", "Hand3Card");
    }
    if (checkPoint(450,300,100)) {
        setValue("Selected", "Hand4Card");
    }
    if (checkPoint(550,300,100)) {
        setValue("Selected", "Hand5Card");
    }

    if (checkPoint(200,0,100)) {
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
    if (checkPoint(300,0,100)) {
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
    if (checkPoint(400,0,100)) {
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
    if (checkPoint(500,0,100)) {
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

    if (checkPoint(0,600,100)) {
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
        cardText = cardText.replace(/~SB~/g, "");
        textAlign(CENTER, CENTER);
        fill(255);
        stroke(0);
        rect(pos.x,pos.y,size,size*2, 5, 5, 5, 5);
        if (cardText === "1" || cardText === "2" || cardText === "3" || cardText === "4") {
            fill(0,0,255);
        } else if (cardText === "5" || cardText === "6" || cardText === "7" || cardText === "8") {
            fill(0,255,0);
        } else if (cardText === "9" || cardText === "10" || cardText === "11" || cardText === "12") {
            fill(255,127,0);
        } else {
            fill(255,0,0);
        }
        if (cardText === "Cannot Discard") {
            fill(255,127,127);
        } else if (cardText === "Can Discard") {
            fill(127,255,127);
        }
        text("* " + cardText + " *",pos.x,pos.y,size,size*2);
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
        });
        data.type = type;
        data.clientKey = key;
        if (type != null) socket.send(JSON.stringify(data));
    }
}

function infoMessage(info) {
    alert(info);
    return null;
}

function infoPrompt(info) {
    let value = prompt(info);
    while (value == null) value = prompt(info);
    return value
}

function setValue(key, value) {
    console.log("Setting: '" + key + "' to: '" + value + "'!");
    playerData[key] = value;
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
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }