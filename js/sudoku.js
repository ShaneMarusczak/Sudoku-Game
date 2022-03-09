"use strict";
(() => {
  let runningTimer;
  const board = [];
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  let difficulty;
  let solved = false;
  let gameStarted = false;
  let gameOver = false;

  const rows = 9;
  const cols = 9;
  const boardUI = document.getElementById("sudoku");
  const timerContainer = document.getElementById("timerContainer");
  const checkBox = document.getElementById("hideTimer");
  const timer = document.getElementById("timer");
  const copiedBoard = [];
  const answerBoard = [];
  const difficultySettings = {
    easy: 1,
    hard: 3,
    insane: 5,
    medium: 2,
  };

  const timerTick = () => {
    seconds++;
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
      if (minutes >= 60) {
        minutes = 0;
        hours++;
      }
    }
    timer.textContent =
      (hours ? (hours > 9 ? hours : "0" + hours) : "00") +
      ":" +
      (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") +
      ":" +
      (seconds > 9 ? seconds : "0" + seconds);
    timerStart();
  };

  const timerStart = () => {
    runningTimer = setTimeout(timerTick, 1000);
  };

  const selectedRadioBtnForForm = (formName) =>
    Array.from(document.getElementsByName(formName)).find(
      (input) => input.type === "radio" && input.checked
    );

  const start = () => {
    if (gameStarted) {
      return;
    }

    if (
      !Array.from(document.getElementsByName("difficulty")).some(
        (elem) => elem.checked
      )
    ) {
      modal("Select a difficulty", 1600);
      return;
    }

    difficulty = selectedRadioBtnForForm("difficulty");

    generateRandomBoard();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        document.getElementById("s" + y + x).readOnly = false;
        if (
          randomIntFromInterval(
            0,
            difficultySettings[difficulty.value]
          ) === 0
        ) {
          document.getElementById("s" + y + x).value = copiedBoard[y][x];
          document.getElementById("s" + y + x).readOnly = true;
        } else {
          document.getElementById("no" + y + x).classList.remove("hide");
        }
      }
    }
    gameStarted = true;
    displayControl();
  };

  const displayControl = () => {
    document.getElementById("usedNums").classList.remove("hide");
    document.getElementById("difficultySelect").classList.add("hide");
    document.getElementById("introText").classList.add("hide");
    timer.classList.remove("hide");
    timerContainer.classList.remove("hide");
    timerStart();
  };

  const checkAnswer = () => {
    if (!gameStarted || gameOver) {
      return;
    }
    if (!validate()) {
      modal("Sorry, incorrect!", 1500);
      return;
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        answerBoard[y][x] = document.getElementById("s" + y + x).value;
      }
    }
    const errors = validBoard(answerBoard);
    if (errors.length !== 0) {
      modal("Sorry, incorrect!", 1500);
      errors.forEach((e) => {
        const [x, y] = e;
        document.getElementById("s" + y + x).style.background = "red";
      });
      return;
    }
    clearTimeout(runningTimer);
    modal("Correct!", 2000);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        document.getElementById("s" + y + x).readOnly = true;
      }
    }
    if (!checkBox.checked) {
      sleep(2000)
        .then(() => closableModal("Completed in " + timer.textContent));
    }

    boardtoGreen();
    gameOver = true;
  };

  const boardtoGreen = () => {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        document.getElementById("s" + y + x).style.background = "darkseagreen";
      }
    }
  };

  const validate = () => {
    const validValues = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!validValues.includes(document.getElementById("s" + y + x).value)) {
          return false;
        }
      }
    }
    return true;
  };

  const validBoard = (board) => {
    const errors = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!possible(y, x, board[y][x], board, true)) {
          errors.push([x, y]);
        }
      }
    }
    return errors;
  };

  const solve = (copyTo) => {
    if (solved) {
      return;
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (board[y][x] === "") {
          for (let n = 1; n < 10; n++) {
            if (solved) {
              return;
            }
            if (possible(y, x, n, board, false)) {
              board[y][x] = n;
              solve(copyTo);
              board[y][x] = "";
            }
          }
          return;
        }
      }
    }
    solved = true;
    copyBoard(board, copyTo);
  };

  const copyBoard = (boardFrom, boardTo) => {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        boardTo[y][x] = boardFrom[y][x];
      }
    }
  };

  const possible = (y, x, n, boardArg, checkingMode) => {
    for (let i = 0; i < 9; i++) {
      if (boardArg[y][i] === n) {
        if (i === x && checkingMode) {
          continue;
        }
        return false;
      }
    }
    for (let i = 0; i < 9; i++) {
      if (boardArg[i][x] === n) {
        if (i === y && checkingMode) {
          continue;
        }
        return false;
      }
    }
    const x0 = Math.floor(x / 3) * 3;
    const y0 = Math.floor(y / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (boardArg[y0 + i][x0 + j] === n) {
          if (y0 + i === y && x0 + j === x && checkingMode) {
            continue;
          }
          return false;
        }
      }
    }
    return true;
  };

  const generateRandomBoard = () => {
    board[0][0] = randomIntFromInterval(1, 9);
    board[1][7] = randomIntFromInterval(1, 9);
    board[2][4] = randomIntFromInterval(1, 9);
    board[3][3] = randomIntFromInterval(1, 9);
    board[4][1] = randomIntFromInterval(1, 9);
    board[5][8] = randomIntFromInterval(1, 9);
    board[6][6] = randomIntFromInterval(1, 9);
    board[7][2] = randomIntFromInterval(1, 9);
    board[8][5] = randomIntFromInterval(1, 9);
    solve(copiedBoard);
  };

  const noteDisplayHandler = (e) => {
    const noteElem = document.getElementById("n" + e.target.id.substring(2));
    if (
      noteElem.classList.contains("hide") &&
      gameStarted &&
      document.getElementById("s" + e.target.id.substring(2)).readOnly !== true
    ) {
      noteElem.classList.remove("hide");
      noteElem.focus();
      document.getElementById("no" + e.target.id.substring(2)).innerHTML = "«";
    } else {
      noteElem.classList.add("hide");
      document.getElementById("no" + e.target.id.substring(2)).innerHTML = "»";
    }
  };

  const noteOpenButtonShow = (e) => {
    if (
      gameStarted &&
      e.target.tagName !== "SPAN" &&
      e.target.tagName !== "DIV" &&
      document.getElementById("s" + e.target.id.substring(1)).readOnly !== true
    ) {
      document
        .getElementById("no" + e.target.id.substring(1))
        .classList.add("opaque");
    }
  };

  const noteOpenButtonHide = (e) => {
    document
      .getElementById("no" + e.target.id.substring(2))
      .classList.remove("opaque");
  };

  const numsUsed = () => {
    const numsDict = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
    };
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        numsDict[document.getElementById("s" + y + x).value]++;
      }
    }
    for (let i = 1; i < 10; i++) {
      if (numsDict[i.toString()] >= 9) {
        document.getElementById("used" + i).classList.remove("hide");
      } else {
        document.getElementById("used" + i).classList.add("hide");
      }
    }
  };

  const toggleSize = () => {
    if (getCookie("largeBoard") === "false") {
      makeBoardBig();
      setCookie("largeBoard", "true", 10);
    } else {
      makeBoardSmall();
      setCookie("largeBoard", "false", 10);
    }
  };

  const makeBoardSmall = () => {
    document
      .querySelectorAll("input[type=number]")
      .forEach((elem) => elem.classList.add("textInputToggle"));
    document
      .querySelectorAll(".oddRight")
      .forEach((elem) => elem.classList.add("oddRightToggle"));
    document
      .querySelectorAll(".strangeRight")
      .forEach((elem) => elem.classList.add("strangeRightToggle"));
    document
      .querySelectorAll("textarea")
      .forEach((elem) => elem.classList.add("textareaToggle"));
    document
      .querySelectorAll(".noteOpenDiv")
      .forEach((elem) => elem.classList.add("noteOpenDivToggle"));
  };

  const makeBoardBig = () => {
    document
      .querySelectorAll("input[type=number]")
      .forEach((elem) => elem.classList.remove("textInputToggle"));
    document
      .querySelectorAll(".oddRight")
      .forEach((elem) => elem.classList.remove("oddRightToggle"));
    document
      .querySelectorAll(".strangeRight")
      .forEach((elem) => elem.classList.remove("strangeRightToggle"));
    document
      .querySelectorAll("textarea")
      .forEach((elem) => elem.classList.remove("textareaToggle"));
    document
      .querySelectorAll(".noteOpenDiv")
      .forEach((elem) => elem.classList.remove("noteOpenDivToggle"));
  };

  const toggleTimer = () => {
    if (checkBox.checked) {
      timer.classList.add("invsible");
      setCookie("hideSudokuTimer", "Y", 30);
    } else {
      timer.classList.remove("invsible");
      setCookie("hideSudokuTimer", "N", 30);
    }
  };

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie =
        cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Lax";
  }

  function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function modal(message, duration) {
    const modalBox = document.createElement("div");
    modalBox.id = "modal-box";
    const innerModalBox = document.createElement("div");
    innerModalBox.id = "inner-modal-box";
    const modalMessage = document.createElement("span");
    modalMessage.id = "modal-message";
    innerModalBox.appendChild(modalMessage);
    modalBox.appendChild(innerModalBox);
    modalMessage.innerText = message;
    document.getElementsByTagName("html")[0].appendChild(modalBox);
    sleep(duration).then(() => modalBox.remove());
  }

  function closableModal(message) {
    const modalBox = document.createElement("div");
    modalBox.id = "modal-box";
    const innerModalBox = document.createElement("div");
    innerModalBox.id = "inner-modal-box";
    const modalMessage = document.createElement("span");
    modalMessage.id = "modal-message";
    const closeButton = document.createElement("span");
    closeButton.id = "close-button";
    closeButton.innerHTML = "&times;";
    innerModalBox.appendChild(modalMessage);
    innerModalBox.appendChild(closeButton);
    modalBox.appendChild(innerModalBox);
    modalMessage.innerText = message;
    document.getElementsByTagName("html")[0].appendChild(modalBox);
    closeButton.addEventListener("click", () => {
      modalBox.remove();
    });
  }

  function handleKeyboardInput(e) {
      const elemWithFocus = document.activeElement;

      if (!elemWithFocus.classList.contains("arrow-nav")) {
        return;
      }

      const row = Number(elemWithFocus.getAttribute("row"));
      const col = Number(elemWithFocus.getAttribute("col"));


    switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (row - 1 < 0) {
            return;
        }
          document.getElementById("s" + (row - 1) + col).focus();
          break;
      case "ArrowDown":
        e.preventDefault();
        if (row + 1 >= rows) {
          return;
        }
        document.getElementById("s" + (row + 1) + col).focus();
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (col - 1 < 0) {
          return;
        }
        document.getElementById("s" + row + (col - 1)).focus();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (col + 1 >= cols) {
          return;
        }
        document.getElementById("s" + row + (col + 1)).focus();
        break;
      }
  }

  (() => {
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("hideTimer").addEventListener("click", toggleTimer);
    document
      .getElementById("checkAnswer")
      .addEventListener("click", checkAnswer);
    document.getElementById("toggleSize").addEventListener("click", toggleSize);

    document.addEventListener("keydown", handleKeyboardInput);

    for (let i = 0; i < rows; i++) {
      board.push([]);
      copiedBoard.push([]);
      answerBoard.push([]);
      const entryRow = document.createElement("div");
      entryRow.classList.add("entryRow");
      boardUI.appendChild(entryRow);
      for (let j = 0; j < cols; j++) {
        answerBoard[i][j] = "";
        board[i][j] = "";
        copiedBoard[i][j] = "";
        const entryDiv = document.createElement("div");
        const entry = document.createElement("input");
        const note = document.createElement("textarea");
        const noteOpen = document.createElement("span");
        const noteOpenDiv = document.createElement("div");
        noteOpen.innerHTML = "»";
        noteOpen.classList.add("hide");
        note.classList.add("hide");
        entryDiv.id = "ed" + i + j;
        note.id = "n" + i + j;
        entry.id = "s" + i + j;
        noteOpen.id = "no" + i + j;
        entry.readOnly = true;
        entry.type = "number";
        entry.maxLength = 1;
        entry.classList.add("arrow-nav")
        entry.addEventListener("input", numsUsed);
        entry.setAttribute("row", i.toString());
        entry.setAttribute("col", j.toString());
        entryDiv.classList.add("entryDiv");
        noteOpenDiv.classList.add("noteOpenDiv");
        entryDiv.addEventListener("mouseover", noteOpenButtonShow);
        entryDiv.addEventListener("mouseleave", noteOpenButtonHide);
        entryDiv.appendChild(entry);
        entryDiv.appendChild(note);
        noteOpenDiv.appendChild(noteOpen);
        entryDiv.appendChild(noteOpenDiv);
        noteOpen.addEventListener("click", noteDisplayHandler);
        entryRow.appendChild(entryDiv);
        if (j === 2 || j === 5) {
          entry.classList.add("rightBorder");
          entryDiv.classList.add("strangeRight");
        } else {
          entryDiv.classList.add("oddRight");
        }
        if (i === 2 || i === 5) {
          entry.classList.add("bottomBorder");
        }
      }
    }
    if (getCookie("largeBoard") === "false") {
      makeBoardSmall();
    }
    checkBox.checked = getCookie("hideSudokuTimer") === "Y";
    toggleTimer();
  })();
})();
