let gameCodeInput = document.getElementById("gameCode");
let joinGameBtn = document.getElementById("joinGame");
let hostGameBtn = document.getElementById("createGame");

// ensure that the game codes must be 4 digits long
gameCodeInput.addEventListener("input", () => {
    if (gameCodeInput.value.length === 4 && /^[A-Z]+$/.test(gameCodeInput.value)) {
        joinGameBtn.removeAttribute("disabled");
    }
    else {joinGameBtn.setAttribute("disabled", "");}
});

// fetch the error codes
let errors = null;
fetch("errors.json").then(resp => resp.json()).then(json => errors = json);

hostGameBtn.addEventListener("click", () => {
    fetch("/api/v1/eq/createGame").then(result => result.json()).then(json => {
        if (json.error === true) {
            document.getElementById("errorTitle").innerText = "Error Hosting Game";
            document.getElementById("errorText").innerText = errors[json.reason];
            eval('$("#errorModal").modal("show");');
            return;
        }
        // if no error, store the game code and the access code redirect
        localStorage.setItem("code", json.code);
        localStorage.setItem("access", json.access);
        window.location.assign("game/Game.html");
    });
});

joinGameBtn.addEventListener("click", () => {
    fetch("/api/v1/eq/joinGame", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        body: "code=" + gameCodeInput.value
    }).then(result => result.json()).then(json => {
        if (json.error === true) {
            document.getElementById("errorTitle").innerText = "Error Joining Game";
            document.getElementById("errorText").innerText = errors[json.reason];
            eval('$("#errorModal").modal("show");');
            return;
        }
        // if no error, store the game code and the access code redirect
        localStorage.setItem("code", json.code);
        localStorage.setItem("access", json.access);
        window.location.assign("game/Game.html");
    });
})