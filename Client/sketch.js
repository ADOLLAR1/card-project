const WSURL = "ws://localhost:15000";
let socket;

let playerData = {};

function preload() {}

function setup() {
    createCanvas(800,800);
    createWSConnection();
}

function draw() {
    background(127);
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
}

function drawCard(cardText, pos, size, tooltip) {
    if (cardText != null && cardText != undefined) {
        textAlign(CENTER, CENTER);
        fill(255);
        stroke(0);
        rect(pos.x,pos.y,size,size*2);
        fill(0)
        text("* " + cardText + " *",pos.x,pos.y,size,size*2);
        stroke(0,0,0,0);
        textAlign(LEFT, TOP);
    } else {
        fill(0,0,0,0);
        stroke(0);
        rect(pos.x, pos.y, size,size*2);
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
    if (type != null) socket.send(JSON.stringify(data));;
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
    console.log("Setting " + key + " To " + value);
    playerData[key] = value;
    return value;
}