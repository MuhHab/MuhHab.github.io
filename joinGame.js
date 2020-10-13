// god this code is so bad
// the server's code is MUCH better

let gameCodeInput = document.getElementById("gameCode");
let joinGameBtn = document.getElementById("joinGame");
let hostGameBtn = document.getElementById("createGame");
let nameInput = document.getElementById("name");

/**
 * The number of letters the game code is
 * @type {number}
 */
const CODE_LENGTH = 4;

/**
 * This function checks if the criteria is met for the join button to be enabled.
 * Criteria: Something is typed in name that only contains letters and spaces.
 *           CODE_LENGTH capital letters are typed into code field
 */
function checkJoinBtn() {
    if (gameCodeInput.value.length === CODE_LENGTH && /^[A-Z]+$/.test(gameCodeInput.value)
            && nameInput.value.length > 0 && /^[A-Za-z ]+$/.test(nameInput.value)) {
        joinGameBtn.removeAttribute("disabled");
    }
    else {joinGameBtn.setAttribute("disabled", "");}
}

// ensure that the game codes must be 4 digits long
gameCodeInput.addEventListener("input", () => {
    checkJoinBtn();
});

nameInput.addEventListener("input", () => {
    checkJoinBtn();
    if (nameInput.value.length > 0 && /^[A-Za-z ]+$/.test(nameInput.value)) {
        hostGameBtn.removeAttribute("disabled");
    } else {
        hostGameBtn.setAttribute("disabled", "");
    }
});

// websocket logic
document.getElementById("retry").addEventListener("click", () => window.location.reload());

let webSocket = new WebSocket("ws://localhost/api/v1/eq/join/join");
webSocket.binaryType = "arraybuffer";

function showLoading() {
    document.getElementById("joinMenu").style.display = "none";
    document.getElementById("loading").style.display = "block";
}

function stopLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("joinMenu").style.display = "block";
}

webSocket.onerror = () => {
    document.getElementById("loading").style.display = "none";
    document.getElementById("failed").style.display = "block";
}

webSocket.onopen = () => {
    stopLoading();
}

// fetch the error codes
let errors = null;
fetch("errors.json").then(resp => resp.json()).then(json => errors = json);

let responseWaitingOn = "";

webSocket.onmessage = event => {
    stopLoading(); // stop showing loading icon

    console.log(event.data);
    let dataRaw = event.data;
    let data = new DataView(dataRaw);

    // status code from the server
    let status = data.getUint8(0);
    console.log(responseWaitingOn + " message response received: " + status);

    // errors
    if (status === 0) { // programming error
        showMessage(errors["general"].title, errors["general"].message + data.getUint8(1),
            "error");
        responseWaitingOn = "";
        return;
    } else if (status !== 1) { // general non programming error (1 is success)
        showMessage(errors[responseWaitingOn][status].title,
                errors[responseWaitingOn][status].message, "error");
        responseWaitingOn = "";
        return;
    }

    if (responseWaitingOn === "JOIN") {
        let auth = data.getBigInt64(1);

        // store the auth codes
        sessionStorage.setItem("auth", auth.toString());
        sessionStorage.setItem("code", gameCodeInput.value);

        // redirect to gameplay
        window.location.assign("Game.html");
    } else if (responseWaitingOn === "CREATE") {
        // reconstruct the code
        let code = "";
        for (let i = 1; i < CODE_LENGTH + 1; i++) {
            code += String.fromCharCode(data.getUint8(i));
        }
        // get the auth code
        let auth = data.getBigInt64(1+CODE_LENGTH);

        // store the auth codes
        sessionStorage.setItem("auth", auth.toString());
        sessionStorage.setItem("code", code);

        // redirect to gameplay
        window.location.assign("Game.html");
    }

    responseWaitingOn = ""; // reset the message type
}

hostGameBtn.addEventListener("click", () => {
    let nameStr = nameInput.value;
    // one byte for packet id, one for name length, then name
    let dataStream = new ArrayBuffer(2+nameStr.length);
    let data = new Uint8Array(dataStream);

    // packet id
    data[0] = 3;

    // add the name string
    data[1] = nameStr.length; // the name length prefix
    for (let i = 0; i < nameStr.length; i++) {
        data[i+2] = nameStr.charCodeAt(i);
    }

    // send
    responseWaitingOn = "CREATE";
    webSocket.send(dataStream);
    showLoading();
});

joinGameBtn.addEventListener("click", () => {
    let nameStr = nameInput.value; // the name
    let codeStr = gameCodeInput.value; // the code
    // 1 byte for packet id, CODE_LENGTH bytes for code, 1 byte for name length, nameStr.length bytes for name
    let dataStream = new ArrayBuffer(2+CODE_LENGTH+nameStr.length);
    let data = new Uint8Array(dataStream);

    // packet id
    data[0] = 2; // see protocol.txt server side

    // add the code string
    for (let i = 0; i < codeStr.length; i++) {
        data[i+1] = codeStr.charCodeAt(i);
    }

    // add the name string
    data[1+CODE_LENGTH] = nameStr.length; // the name length prefix
    for (let i = 0; i < nameStr.length; i++) {
        data[2+i+CODE_LENGTH] = nameStr.charCodeAt(i);
    }

    responseWaitingOn = "JOIN";
    webSocket.send(dataStream);
    showLoading();
});