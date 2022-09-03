//Global variables
let houseChar, playerTurn = true, difficulty;
const userPickArr = [], housePickArr = [];

//Game Event listeners
document.querySelector(".X").addEventListener("click", userChar);
document.querySelector(".O").addEventListener("click", userChar);
document.getElementById("difficulty").addEventListener("click", setDifficulty);

//HouseLogic handler
class HouseLogicUnit{
  constructor() {
    this.firstRow = document.querySelectorAll(".Ra");
    this.secondRow = document.querySelectorAll(".Rb");
    this.thirdRow = document.querySelectorAll(".Rc");
    this.firstcollumn = document.querySelectorAll(".Ca");
    this.secondcollumn = document.querySelectorAll(".Cb");
    this.thirdcollumn = document.querySelectorAll(".Cc");
    this.firstdiagonal = document.querySelectorAll(".Da");
    this.secondiagonal = document.querySelectorAll(".Db");
  }
  //This is where the logical response of the house is evaluated
  houseLogicProccessor(gridBoxes) {
    const userPicked = [],
      housePicked = [],
      unpicked = [],
      ignoreArr = [],
      generalArr = [];
    gridBoxes.forEach(each => {
      generalArr.push(each);
      if (each.classList.contains("ignore")) ignoreArr.push(each)
      if (each.classList.contains("house-pick")) housePicked.push(each)
      if (each.classList.contains("user-pick")) userPicked.push(each)
      else if (!each.classList.contains("picked")) unpicked.push(each)
      else unpicked.push(each)
    })
     
    if (ignoreArr.length === 3) {
      return [ignoreArr, null]
    }else if (userPicked.length === 2 || housePicked.length === 2) {
      generalArr.forEach(each => { each.classList.add("ignore") })
      return [unpicked[0], true]
    }
    else  return [unpicked[0], false]
  }
  //This will return the evaluated value which is sent by houseLogicProccessor method to be outputed in the browser 
  logicalPick() {
    let resolveArr = this.houseLogicProccessor(this.firstRow);
    if (resolveArr[1] === false || resolveArr[1] === null) resolveArr = this.houseLogicProccessor(this.firstdiagonal);
    if (resolveArr[1] === false || resolveArr[1] === null) resolveArr = this.houseLogicProccessor(this.firstcollumn);
    if (resolveArr[1] === false || resolveArr[1] === null) resolveArr = this.houseLogicProccessor(this.secondRow);
    if (resolveArr[1] === false || resolveArr[1] === null) resolveArr = this.houseLogicProccessor(this.secondiagonal);
    if (resolveArr[1] === false || resolveArr[1] === null) resolveArr = this.houseLogicProccessor(this.secondcollumn);
    if (resolveArr[1] === false || resolveArr[1] === null) resolveArr = this.houseLogicProccessor(this.thirdRow);
    if (resolveArr[1] === false || resolveArr[1] === null) resolveArr = this.houseLogicProccessor(this.thirdcollumn);
    

    if (resolveArr[1] === false || resolveArr[1] === null || resolveArr[0].classList.contains("picked")) return this.illogicalPick()
    else return resolveArr[0]
  }

   //This pick is illogical and purely by random
   illogicalPick() {
    const unpickedArr = [];
    document.querySelectorAll(".grid-box").forEach(gridBox => {
      if (!gridBox.classList.contains("picked")) unpickedArr.push(gridBox)
    })
  
    let max = unpickedArr.length, min = 1;
    const random = Math.floor((Math.random() * max) + min);
    const pickedBox = unpickedArr[random - 1];
  
    return pickedBox
  }

}



//Game Functions
//Sets the character(either X or O) of the user and the house.
function userChar(e) {
  if ( hasChosenChar(houseChar) === false) {
    const userChar = e.target.innerText;
  if (userChar === "X") houseChar = "O"
  else houseChar = "X";
  
    e.target.style.background = "rgba(51, 51, 51, 0.322)";
    userTurn(userChar,houseChar)

}
}


// This will check for if the user has chosen a character or not
function hasChosenChar(houseChar) {
  if (houseChar === undefined) return false
  else return true
}

//This will run when the user picks a character
function userTurn(userChar, houseChar) {
  function clickEvent(e) {
    if (playerTurn === true && !e.target.classList.contains("picked")) { 
      if (e.target.classList.contains("grid-box")) {
      e.target.style.color = "rgb(82, 241, 82)"
      e.target.innerText = userChar;
      e.target.classList.add("picked");
      e.target.classList.add("user-pick")
      userPickArr.push(e.target.id);
      if (hasWon(userPickArr) === true) {
        displayMsg("You Won!!!", "limegreen")
        playerTurn = false;
      } else if (hasWon(userPickArr) === false) {
        playerTurn = false;
        setTimeout(() => {
          houseTurn(houseChar)
        },2000)
      } else {
        displayMsg("A Draw!!!", "yellow")
        playerTurn = false;
      }
    }
  }
}

    document.addEventListener("click", clickEvent)

}


//This will run when the user is to pick a character
function houseTurn(houseChar) {
  let pickedBox, logicRange;
  const random = getRandomNum(10),
    houseLogic = new HouseLogicUnit();
  
  if (difficulty !== undefined) logicRange = difficulty
  else logicRange = 5;
  if (random <= logicRange) {
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
    displayMsg("You Lose!!!", "red")
  } else if (hasWon(housePickArr) === false) {
    playerTurn = true
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

//This will handl the difficulty setting of the game
function setDifficulty(e) {
 difficulty = Number(e.target.value);
}

//This will display the msg which tells the user wether they won or lost
function displayMsg(msg, color) {
  const status = document.getElementById("status"),
    button = document.createElement("button");
  status.style.color = color;
  status.innerText = msg;
  button.id = "reload";
  button.innerText = "Play Again";
  status.append(button);
  document.getElementById("reload").addEventListener("click", function(){window.location.reload()});
}


