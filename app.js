//Global variables
let houseChar,
  playerTurn,
  difficulty,
  isFirstMove = true,
  reverseCounter = 0,
  stratArr = null,
  retainSelectedChar;
const userPickArr = [], housePickArr = [];


//Game Default Settings/General Setting/EventListeners
const audio = document.getElementById("audio")
document.getElementById("X").addEventListener("click", userChar);
document.getElementById("O").addEventListener("click", userChar);
document.getElementById("difficulty").addEventListener("click", setDifficulty);
document.getElementById("stats").addEventListener("click", displayStats);
document.getElementById("others").addEventListener("click", displayOthers);
document.querySelector(".fa").addEventListener("click", audioControl)


if (localStorage.getItem("stats") === null) localStorage.setItem("stats", JSON.stringify([0, 0, 0]))

if (localStorage.getItem("difficulty") !== null) {
  difficulty = JSON.parse(localStorage.getItem("difficulty"))
} else {
  localStorage.setItem("difficulty", 5);
  difficulty = 5
}
document.getElementById("difficulty").value = difficulty;

if (JSON.parse(localStorage.getItem("audioState")) === "muted") {
  audio.muted = true
  document.querySelector(".fa").classList.remove("fa-volume-up");
  document.querySelector(".fa").classList.add("fa-volume-off")
}

if (localStorage.getItem("retainSelectedChar") === null) {
  retainSelectedChar = [null, null, false];
  localStorage.setItem("retainSelectedChar", JSON.stringify(retainSelectedChar))
} else {
  retainSelectedChar = JSON.parse(localStorage.getItem("retainSelectedChar"))
  if (retainSelectedChar) {
    document.getElementById(`${retainSelectedChar[0]}`).style.background = "rgba(51, 51, 51, 0.322)";
    document.getElementById("difficulty").disabled = true
    initialTurnSelector(retainSelectedChar[0], retainSelectedChar[1])
  }
}



//HouseLogic handler
class HouseLogicUnit {
  constructor() {
    this.gridBoxes = {};
    this.winPermutationsArr = [];
    this.Ra = [];
    this.Rb = [];
    this.Rc = [];
    this.Ca = [];
    this.Cb = [];
    this.Cc = [];
    this.Da = [];
    this.Db = [];
  }
  //This is where the logical response of the house is evaluated

  //This will return the evaluated value which is sent by houseLogicProccessor method to be outputed in the browser 
  logicalPick() {
    let pickedBox, isPickedBy;
    document.querySelectorAll(".grid-box").forEach(each => {
      if (each.classList.contains("user-pick")) isPickedBy = "U"
      else if (each.classList.contains("house-pick")) isPickedBy = "H"
      else isPickedBy = null
      this.gridBoxes[each.id] = isPickedBy
    })
    if (isFirstMove) {
      isFirstMove = false;
      let ID = this.strategyCheck(this.gridBoxes);
      pickedBox = document.getElementById(ID[0])
    } else {

      this.Ra.push({ value: this.gridBoxes.Ra1, grid: "Ra1" }, { value: this.gridBoxes.Ra2, grid: "Ra2" }, { value: this.gridBoxes.Ra3, grid: "Ra3" });
      this.Rb.push({ value: this.gridBoxes.Rb1, grid: "Rb1" }, { value: this.gridBoxes.Rb2, grid: "Rb2" }, { value: this.gridBoxes.Rb3, grid: "Rb3" });
      this.Rc.push({ value: this.gridBoxes.Rc1, grid: "Rc1" }, { value: this.gridBoxes.Rc2, grid: "Rc2" }, { value: this.gridBoxes.Rc3, grid: "Rc3" });
      this.Ca.push({ value: this.gridBoxes.Ra1, grid: "Ra1" }, { value: this.gridBoxes.Rb1, grid: "Rb1" }, { value: this.gridBoxes.Rc1, grid: "Rc1" });
      this.Cb.push({ value: this.gridBoxes.Ra2, grid: "Ra2" }, { value: this.gridBoxes.Rb2, grid: "Rb2" }, { value: this.gridBoxes.Rc2, grid: "Rc2" });
      this.Cc.push({ value: this.gridBoxes.Ra3, grid: "Ra3" }, { value: this.gridBoxes.Rb3, grid: "Rb3" }, { value: this.gridBoxes.Rc3, grid: "Rc3" });
      this.Da.push({ value: this.gridBoxes.Ra1, grid: "Ra1" }, { value: this.gridBoxes.Rb2, grid: "Rb2" }, { value: this.gridBoxes.Rc3, grid: "Rc3" });
      this.Db.push({ value: this.gridBoxes.Ra3, grid: "Ra3" }, { value: this.gridBoxes.Rb2, grid: "Rb2" }, { value: this.gridBoxes.Rc1, grid: "Rc1" });

      this.winPermutationsArr.push(this.Ra, this.Rb, this.Rc, this.Ca, this.Cb, this.Cc, this.Da, this.Db)
      // Thee reverse counter reverses the winPermutationsArr every two house plays to give some variety to the choice made by the House.
      if (reverseCounter > 0) {
        this.winPermutationsArr.reverse();
        reverseCounter = 0
      }
      reverseCounter++;

      let checker;
      for (let i = 0; i < this.winPermutationsArr.length; i++) {
        checker = this.offensiveCheck(this.winPermutationsArr[i], "H")
        if (checker[1]) {
          pickedBox = document.getElementById(`${checker[0]}`)
          break
        }
      }
      if (!checker[1]) {
        for (let i = 0; i < this.winPermutationsArr.length; i++) {
          checker = this.offensiveCheck(this.winPermutationsArr[i], "U");
          if (checker[1]) {
            pickedBox = document.getElementById(`${checker[0]}`)
            break
          }
        }
      }
      if (!checker[1]) {
        checker = this.strategyCheck(this.gridBoxes);
        if (checker[1]) {
          pickedBox = document.getElementById(`${checker[0]}`)
        }
      }
      if (!checker[1]) {
        for (let i = 0; i < this.winPermutationsArr.length; i++) {
          checker = this.passiveCheck(this.winPermutationsArr[i]);
          if (checker[1]) {
            pickedBox = document.getElementById(`${checker[0]}`)
            break
          }
        }
      }
      if (!checker[1]) {
        console.log("Went random")
        pickedBox = this.illogicalPick();
      }
    }
    return pickedBox
  }


  offensiveCheck(winPermutationArr, player) {
    let playerPicks = winPermutationArr.filter(pick => pick.value === player);
    let nullPicks = winPermutationArr.filter(pick => pick.value === null);
    if (playerPicks.length === 2 && nullPicks.length === 1) return [nullPicks[0].grid, true]
    else return [null, false]
  }

  passiveCheck(winPermutationArr) {
    let housePicks = winPermutationArr.filter(pick => pick.value === "H");
    let nullPicks = winPermutationArr.filter(pick => pick.value === null);
    let i = getRandomNum(2);
    if (nullPicks.length === 2 && housePicks.length === 1) return [nullPicks[i - 1].grid, true]
    else return [null, false]
  }

  strategyCheck(gridBoxes) {
    if (stratArr === null) {
      const strategies = [
        ["Rc1", "Ra2", "Ra1"],
        ["Ra2", "Rc1", "Ra1"],
        ["Rc3", "Ra2", "Ra3"],
        ["Ra2", "Rc3", "Ra3"],
        ["Rb2", "Ra1", "Rc1"],
        ["Rb2", "Ra3", "Rc3"],
        ["Rb2", "Rc3", "Rc1"],
        ["Rb2", "Ra3", "Ra1"],
        ["Ra1", "Ra2", "Rb2"],
        ["Ra2", "Rb2", "Ra3"],
        ["Rc1", "Rc2", "Rb2"],
        ["Rc3", "Rb2", "Rc2"]]

      let strategiesObjKeysArr = [];
      for (let k = 0; k < strategies.length; k++) { strategiesObjKeysArr.push(k) }
      strategiesObjKeysArr = strategiesObjKeysArr.sort(function () { return Math.random() - 0.5 })
      let i = 0, j = 0;
      while (strategiesObjKeysArr.length > 0) {
        for (i; i < strategiesObjKeysArr.length; i++) {
          let pickedStrat = strategies[strategiesObjKeysArr[i]];
          pickedStrat.forEach(id => { if (gridBoxes[id] !== "U") j++ })
          if (j >= 3) {
            stratArr = pickedStrat;
            strategiesObjKeysArr = []
          } else {
            strategiesObjKeysArr.splice(i, 1);
            strategiesObjKeysArr = strategiesObjKeysArr.length > 0 ? strategiesObjKeysArr.sort(function () { return Math.random() - 0.5 }) : [];
          }
        }
      }
      //Remember to account for strategies that involve the center gridbox
      if (stratArr === null) {
        return [null, false]
      } else {
        let stratIndex = stratArr.findIndex(id => gridBoxes[id] === null)
        return [stratArr[stratIndex], true]
      }

    } else {
      if (stratArr.filter(id => gridBoxes[id] !== "U").length < 3) return [null, false]
      else {
        let stratIndex = stratArr.findIndex(id => gridBoxes[id] === null)
        return stratIndex === -1 ? [null, false] : [stratArr[stratIndex], true]
      }
    }
  }

  //This pick is illogical and purely by random
  illogicalPick() {
    const unpickedArr = [];
    document.querySelectorAll(".grid-box").forEach(gridBox => {
      if (!gridBox.classList.contains("picked")) unpickedArr.push(gridBox)
    })

    let max = unpickedArr.length, min = 1;
    const random = getRandomNum(max);
    const pickedBox = unpickedArr[random - 1];
    return pickedBox
  }

}



//Game Functions
//Sets the character(either X or O) of the user and the house.
function userChar(e) {
  if (!retainSelectedChar[2]) {
    if (hasChosenChar(houseChar) === false) {
      const userChar = e.target.innerText;
      if (userChar === "X") houseChar = "O"
      else houseChar = "X";
      e.target.style.background = "rgba(51, 51, 51, 0.322)";

      initialTurnSelector(userChar, houseChar)
      retainSelectedChar = [userChar, houseChar, true]
      localStorage.setItem("retainSelectedChar", JSON.stringify(retainSelectedChar))
    }
  }
}


// This will check for if the user has chosen a character or not
function hasChosenChar(houseChar) {
  if (houseChar === undefined) return false
  else return true
}


function initialTurnSelector(userChar, houseChar) {

  if (localStorage.getItem("playerTurn") === null) {
    localStorage.setItem("playerTurn", true)
    playerTurn = true
  } else {
    playerTurn = !JSON.parse(localStorage.getItem("playerTurn"))
    localStorage.setItem("playerTurn", playerTurn)
  }
  if (playerTurn) {
    if(!document.getElementById("difficulty").disabled) document.getElementById("difficulty").disabled = true
    displayMsg(`You're To Play, difficulty: ${difficulty}`, "limegreen")
    userTurn(userChar, houseChar)
    setTimeout(() => { document.getElementById("status").remove() }, 2000)
  } else {
    if(!document.getElementById("difficulty").disabled) document.getElementById("difficulty").disabled = true
    displayMsg(`House To Play, difficulty: ${difficulty}`, "red")
    setTimeout(() => {
      houseTurn(houseChar)
      userTurn(userChar, houseChar)
      document.getElementById("status").remove()
    }, 2000)
  }
}

//This will run when the user picks a character
function userTurn(userChar, houseChar) {
  function clickEvent(e) {
    if (playerTurn === true && !e.target.classList.contains("picked")) {
      if (!document.getElementById("difficulty").disabled) {
        document.getElementById("difficulty").disabled = true
      }
      if (e.target.classList.contains("grid-box")) {
        e.target.style.color = "rgb(82, 241, 82)"
        e.target.innerText = userChar;
        e.target.classList.add("picked");
        e.target.classList.add("user-pick")
        userPickArr.push(e.target.id);
        if (hasWon(userPickArr) === true) {
          incrementStats(0)
          displayMsg("You Won!!!", "limegreen", true)
          playerTurn = false;
        } else if (hasWon(userPickArr) === false) {
          playerTurn = false;
          setTimeout(() => {
            houseTurn(houseChar)
          }, 2000)
        } else {
          incrementStats(2)
          displayMsg("A Tie!!!", "yellow", true)
          playerTurn = false;
        }
      }
    }
  }

  document.addEventListener("click", clickEvent)

}


//This will run when the user is to pick a character
function houseTurn(houseChar) {
  let pickedBox;
  const random = getRandomNum(10),
    houseLogic = new HouseLogicUnit();

  if (random <= difficulty) {
    pickedBox = houseLogic.logicalPick();
  } else {
    pickedBox = houseLogic.illogicalPick();
  }
  pickedBox.style.color = "rgb(202, 25, 25)"
  pickedBox.innerText = houseChar;
  pickedBox.classList.add("picked");
  pickedBox.classList.add("house-pick");
  housePickArr.push(pickedBox.id);
  if (hasWon(housePickArr) === true) {
    incrementStats(1)
    displayMsg("You Lose!!!", "red", true)
  } else if (hasWon(housePickArr) === false) {
    playerTurn = true
  } else {
    incrementStats(2)
    displayMsg("A Tie!!!", "yellow", true)
    playerTurn = false;
  }
}

//This will check for if the user has won, lost or the game is a draw
function hasWon(pickedArr) {
  const frequencyObj = {},
    pickedBoxes = document.querySelectorAll(".picked");
  pickedArr.forEach(each => { frequencyObj[each] = frequencyObj[each] + 1 || 1 })
  if (frequencyObj.Ra1 && frequencyObj.Ra2 && frequencyObj.Ra3 || frequencyObj.Rb1 && frequencyObj.Rb2 && frequencyObj.Rb3 || frequencyObj.Rc1 && frequencyObj.Rc2 && frequencyObj.Rc3 || frequencyObj.Ra1 && frequencyObj.Rb1 && frequencyObj.Rc1 || frequencyObj.Ra2 && frequencyObj.Rb2 && frequencyObj.Rc2 || frequencyObj.Ra3 && frequencyObj.Rb3 && frequencyObj.Rc3 || frequencyObj.Ra1 && frequencyObj.Rb2 && frequencyObj.Rc3 || frequencyObj.Ra3 && frequencyObj.Rb2 && frequencyObj.Rc1) {
    return true
  } else if (pickedBoxes.length === 9) return null
  else return false
}



//This will return a random number wherever it is called 
function getRandomNum(maxNum) {
  let max = maxNum, min = 1;
  const random = Math.floor((Math.random() * max) + min);

  return random
}

//This will handle the difficulty setting of the game
function setDifficulty(e) {
  difficulty = Number(e.target.value);
  displayMsg(`${difficulty}`, "limegreen")
  localStorage.setItem("difficulty", difficulty);
}

//This will display the msg which tells the user wether they won, lost or tied
function displayMsg(msg, color, button) {
  const status = document.createElement("div");
  status.id = "status";
  status.style.color = color;
  status.innerText = msg;
  if (button) {
    const button = document.createElement("button");
    button.id = "reload";
    button.innerText = "Play Again";
    status.append(button);
    button.addEventListener("click", function () { window.location.reload() });
  }
  document.querySelector(".player-notif").append(status)
}

function incrementStats(index) {
  let stats = JSON.parse(localStorage.getItem("stats"))
  stats[index] += 1;
  localStorage.setItem("stats", JSON.stringify(stats))
}

function displayStats() {
  const backDrop = document.createElement("div"),
    card = document.createElement("div"),
    pageContainer = document.querySelector(".page-container"),
    popMenu = document.querySelector(".pop-menu");
   let stats = JSON.parse(localStorage.getItem("stats"));

  backDrop.id = "backdrop";
  card.className = "card";
  card.innerHTML =
    `  <div class="card-title">
         <h2>STATS</h2>
       <div id="close-display">X</div>
       </div>
       <ul class="stats-list">
       <li>WINS: <span id="wins-stat">${stats[0]}</span></li>
       <li>LOSSES: <span id="losses-stat">${stats[1]}</span></li>
       <li>STALE-MATCHES: <span id="stalemates-stat">${stats[2]}</span></li>
       </ul>
       <button id="stats-reset" class="reset-btn">Reset Stats</button>
       `

  pageContainer.insertBefore(backDrop, popMenu);
  pageContainer.insertBefore(card, backDrop);

  setTimeout(() => {
    let winStat = document.getElementById("wins-stat"),
      lossesStat = document.getElementById("losses-stat"),
      stalemateStat = document.getElementById("stalemates-stat");

    card.style.transform = "scale(1)"
    document.getElementById("stats-reset").addEventListener("click", function () {
      localStorage.setItem("stats", JSON.stringify([0, 0, 0]))
      winStat.innerText = 0;
      lossesStat.innerText = 0;
      stalemateStat.innerText = 0;
    })
    document.getElementById("close-display").addEventListener("click", removePopMenu)
    backDrop.addEventListener("click", removePopMenu)
  }, 300)
}


function displayOthers(){
  const backDrop = document.createElement("div"),
  card = document.createElement("div"),
  pageContainer = document.querySelector(".page-container"),
  popMenu = document.querySelector(".pop-menu");
 let stats = JSON.parse(localStorage.getItem("stats"));

backDrop.id = "backdrop"
card.className = "card";
card.innerHTML =
  `  <div class="card-title">
       <div></div>
     <div id="close-display">X</div>
     </div>
      <div class="tutorial">
      <h2>How To Play</h2>
        <p>The goal of the game is simple, you are to try to fill up any row, collumn or diagonal of the grid with your character(X or O). However while try to do this
        you should keep your eye on your opponent(the AI in this case) as if they fill up any of the aforementioned parts of the grid before you, they win the game, if you do this
        first, you win the game and lastly there is the possibility of a tie or stalemate if neither of you are able to fill up a row, collumn or diagonal with your character before marking off all the
        available boxes in the grid of nine boxes. Keep your eyes peeled for potential strategies and mistakes made by the opponent that you could use to your advantage. Now...go show that AI who's the boss.</p>  
      </div>
     <button id="game-reset" class="reset-btn">Restore Game Defaults</button>
     `

pageContainer.insertBefore(backDrop, popMenu);
pageContainer.insertBefore(card, backDrop);


setTimeout(() => {
  card.style.transform = "scale(1)";
  document.getElementById("game-reset").addEventListener("click", () =>{
    localStorage.removeItem("playerTurn");
    localStorage.removeItem("retainSelectedChar");
    localStorage.removeItem("difficulty");
    localStorage.removeItem("audioState");
    window.location.reload()
  })
  document.getElementById("close-display").addEventListener("click", removePopMenu);
  backDrop.addEventListener("click", removePopMenu)
}, 300)
}

function removePopMenu(){
  const backDrop = document.getElementById("backdrop"),
        card = document.querySelector(".card");
  card.style.transform = "scale(0)";
  backDrop.remove();
  setTimeout(() => {
    card.remove()
  }, 500)
}



function audioControl(e) {
  if (e.target.classList.contains("fa-volume-up")) {
    audio.muted = true;
    e.target.classList.remove("fa-volume-up");
    e.target.classList.add("fa-volume-off")
    localStorage.setItem("audioState", JSON.stringify("muted"))
  } else {
    audio.muted = false;
    e.target.classList.remove("fa-volume-off")
    e.target.classList.add("fa-volume-up");
    localStorage.setItem("audioState", JSON.stringify("unmuted"))
  }
}

