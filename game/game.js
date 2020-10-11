// the important elements
let resources = document.getElementById("resources");

// the cubes (fetched later down)
let cubes = null;

// how to roll the dice
function rollDice() {
    // choose 6 random dice from each color
    for (let color = 0; color < cubes.length; color++) {
        for (let dice = 0; dice < 6; dice++) {
            let diceData = cubes[color].symbols[nextInt(cubes[color].symbols.length)];
            let diceElement = document.createElement("div");
            diceElement.classList.add("dice");
            diceElement.classList.add(cubes[color].color);
            // the span that will contain the symbol
            let symbolElement = document.createElement("span");
            symbolElement.className = diceData.class;
            symbolElement.innerText = diceData.symbol;
            diceElement.appendChild(symbolElement); // add the span element to the dice

            resources.appendChild(diceElement); // add the dice to the resources field
        }
    }
}

// the roll dice element
let rollDiceBtn = document.createElement("button");
rollDiceBtn.className = "btn btn-primary";
rollDiceBtn.setAttribute("role", "button");
rollDiceBtn.innerText = "Roll Cubes";
rollDiceBtn.addEventListener("click", () => {
    // should no longer show the gray background or the Roll Button
    resources.classList.remove("resources-unrolled");
    resources.removeChild(rollDiceBtn);

    // roll the dice
    rollDice();
});


// fetch the cube data
fetch("dice.json").then(data => data.json()).then(json => {
    cubes = json;
    // show the roll dice button and remove the loading text
    resources.innerHTML = "";
    resources.appendChild(rollDiceBtn);
});
