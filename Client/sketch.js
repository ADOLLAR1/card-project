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
    drawCard("1", createVector(0,0),100)
}

function drawCard(cardText, pos, size) {
    textAlign(CENTER, CENTER);
    fill(255);
    stroke(0);
    rect(pos.x,pos.y,size,size*2);
    fill(0)
    text("* " + cardText + " *",pos.x,pos.y,size,size*2);
    stroke(0,0,0,0);
    textAlign(LEFT, TOP);
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
            data.return[command.name] = set(command.name, command.value);
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

function set(key, value) {
    playerData[key] = value;
    return value;
}