"use strict";
(() => {
  // ============================================
  // EVENT EMITTER
  // ============================================
  const EventEmitter = {
    events: {},
    on(event, callback) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(callback);
    },
    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach((callback) => callback(data));
      }
    },
    off(event, callback) {
      if (this.events[event]) {
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
      }
    },
  };

  // ============================================
  // CONSTANTS
  // ============================================
  const GRID_SIZE = 9;
  const BOX_SIZE = 3;
  const VALID_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const DIFFICULTY_SETTINGS = {
    easy: 1,
    medium: 2,
    hard: 3,
    insane: 5,
  };

  // ============================================
  // STATE
  // ============================================
  const State = {
    board: [],
    solvedBoard: [],
    answerBoard: [],
    cells: {},
    gameStarted: false,
    gameOver: false,
    solved: false,
    difficulty: null,
    timer: {
      seconds: 0,
      minutes: 0,
      hours: 0,
      intervalId: null,
    },
    selectedCell: null,
    isGenerating: false,

    reset() {
      this.board = [];
      this.solvedBoard = [];
      this.answerBoard = [];
      this.gameStarted = false;
      this.gameOver = false;
      this.solved = false;
      this.difficulty = null;
      this.selectedCell = null;
      this.isGenerating = false;
      this.timer = { seconds: 0, minutes: 0, hours: 0, intervalId: null };
    },
  };

  // ============================================
  // DOM REFERENCES
  // ============================================
  const DOM = {
    boardUI: null,
    timerContainer: null,
    timerCheckbox: null,
    timerDisplay: null,
    loadingOverlay: null,

    init() {
      this.boardUI = document.getElementById("sudoku");
      this.timerContainer = document.getElementById("timerContainer");
      this.timerCheckbox = document.getElementById("hideTimer");
      this.timerDisplay = document.getElementById("timer");
    },
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const Utils = {
    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    padZero(num) {
      return num > 9 ? num.toString() : "0" + num;
    },
  };

  // ============================================
  // STORAGE (Cookies)
  // ============================================
  const Storage = {
    validValues: {
      largeBoard: ["true", "false"],
      hideSudokuTimer: ["Y", "N"],
    },

    set(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = "expires=" + d.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    },

    get(name) {
      const cookieName = name + "=";
      let decodedCookie;
      try {
        decodedCookie = decodeURIComponent(document.cookie);
      } catch (e) {
        return "";
      }
      const cookies = decodedCookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(cookieName) === 0) {
          const value = cookie.substring(cookieName.length);
          return this.validate(name, value);
        }
      }
      return "";
    },

    validate(name, value) {
      if (this.validValues[name] && !this.validValues[name].includes(value)) {
        return "";
      }
      return value;
    },
  };

  // ============================================
  // SOLVER / GENERATOR
  // ============================================
  const Generator = {
    possible(row, col, num, board, checkSelf = false) {
      // Check row
      for (let i = 0; i < GRID_SIZE; i++) {
        if (board[row][i] == num) {
          if (i === col && checkSelf) continue;
          return false;
        }
      }
      // Check column
      for (let i = 0; i < GRID_SIZE; i++) {
        if (board[i][col] == num) {
          if (i === row && checkSelf) continue;
          return false;
        }
      }
      // Check box
      const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
      for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
          if (board[boxRow + i][boxCol + j] == num) {
            if (boxRow + i === row && boxCol + j === col && checkSelf) continue;
            return false;
          }
        }
      }
      return true;
    },

    solve(board, solvedBoard) {
      if (State.solved) return;

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (board[row][col] === "") {
            for (let num = 1; num <= 9; num++) {
              if (State.solved) return;
              if (this.possible(row, col, num, board, false)) {
                board[row][col] = num;
                this.solve(board, solvedBoard);
                board[row][col] = "";
              }
            }
            return;
          }
        }
      }
      State.solved = true;
      this.copyBoard(board, solvedBoard);
    },

    copyBoard(from, to) {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          to[row][col] = from[row][col];
        }
      }
    },

    generate() {
      State.solved = false;
      // Seed with 9 random numbers in different boxes
      const seeds = [
        [0, 0], [1, 7], [2, 4],
        [3, 3], [4, 1], [5, 8],
        [6, 6], [7, 2], [8, 5],
      ];
      seeds.forEach(([row, col]) => {
        State.board[row][col] = Utils.randomInt(1, 9);
      });
      this.solve(State.board, State.solvedBoard);
    },

    getConflicts(row, col, value, board) {
      const conflicts = [];
      if (!value || !VALID_NUMBERS.includes(value)) return conflicts;

      // Check row
      for (let i = 0; i < GRID_SIZE; i++) {
        if (i !== col && board[row][i] == value) {
          conflicts.push([row, i]);
        }
      }
      // Check column
      for (let i = 0; i < GRID_SIZE; i++) {
        if (i !== row && board[i][col] == value) {
          conflicts.push([i, col]);
        }
      }
      // Check box
      const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
      for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
          const r = boxRow + i;
          const c = boxCol + j;
          if ((r !== row || c !== col) && board[r][c] == value) {
            conflicts.push([r, c]);
          }
        }
      }
      return conflicts;
    },
  };

  // ============================================
  // TIMER
  // ============================================
  const Timer = {
    start() {
      if (State.timer.intervalId) return;
      State.timer.intervalId = setInterval(() => this.tick(), 1000);
    },

    stop() {
      if (State.timer.intervalId) {
        clearInterval(State.timer.intervalId);
        State.timer.intervalId = null;
      }
    },

    tick() {
      State.timer.seconds++;
      if (State.timer.seconds >= 60) {
        State.timer.seconds = 0;
        State.timer.minutes++;
        if (State.timer.minutes >= 60) {
          State.timer.minutes = 0;
          State.timer.hours++;
        }
      }
      this.updateDisplay();
    },

    updateDisplay() {
      const { hours, minutes, seconds } = State.timer;
      DOM.timerDisplay.textContent =
        Utils.padZero(hours) + ":" + Utils.padZero(minutes) + ":" + Utils.padZero(seconds);
    },

    getTimeString() {
      return DOM.timerDisplay.textContent;
    },
  };

  // ============================================
  // UI COMPONENTS
  // ============================================
  const UI = {
    getCell(row, col) {
      return State.cells[`${row},${col}`];
    },

    getNote(row, col) {
      return State.cells[`n${row},${col}`];
    },

    getNoteOpen(row, col) {
      return State.cells[`no${row},${col}`];
    },

    createLoadingOverlay() {
      const overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Generating puzzle...</p>
      `;
      document.body.appendChild(overlay);
      DOM.loadingOverlay = overlay;
    },

    showLoading() {
      if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.add("visible");
      }
    },

    hideLoading() {
      if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.remove("visible");
      }
    },

    modal(message, duration) {
      const modalBox = document.createElement("div");
      modalBox.id = "modal-box";
      const innerModalBox = document.createElement("div");
      innerModalBox.id = "inner-modal-box";
      const modalMessage = document.createElement("span");
      modalMessage.id = "modal-message";
      innerModalBox.appendChild(modalMessage);
      modalBox.appendChild(innerModalBox);
      modalMessage.innerText = message;
      document.body.appendChild(modalBox);
      Utils.sleep(duration).then(() => modalBox.remove());
    },

    closableModal(message) {
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
      document.body.appendChild(modalBox);
      closeButton.addEventListener("click", () => modalBox.remove());
    },

    highlightRelatedCells(row, col) {
      this.clearHighlights();
      if (row === null || col === null) return;

      const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const cell = this.getCell(i, j);
          const isInRow = i === row;
          const isInCol = j === col;
          const isInBox = i >= boxRow && i < boxRow + BOX_SIZE &&
                          j >= boxCol && j < boxCol + BOX_SIZE;
          const isSelected = i === row && j === col;

          if (isSelected) {
            cell.classList.add("selected");
          } else if (isInRow || isInCol || isInBox) {
            cell.classList.add("related");
          }
        }
      }
    },

    clearHighlights() {
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const cell = this.getCell(i, j);
          cell.classList.remove("selected", "related", "conflict");
        }
      }
    },

    highlightConflicts() {
      // Clear previous conflicts
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          this.getCell(i, j).classList.remove("conflict");
        }
      }

      // Build current board state
      const currentBoard = [];
      for (let i = 0; i < GRID_SIZE; i++) {
        currentBoard[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
          currentBoard[i][j] = this.getCell(i, j).value;
        }
      }

      // Find and highlight all conflicts
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const value = currentBoard[i][j];
          if (value && VALID_NUMBERS.includes(value)) {
            const conflicts = Generator.getConflicts(i, j, value, currentBoard);
            if (conflicts.length > 0) {
              this.getCell(i, j).classList.add("conflict");
              conflicts.forEach(([r, c]) => {
                this.getCell(r, c).classList.add("conflict");
              });
            }
          }
        }
      }
    },

    updateUsedNumbers() {
      const counts = {};
      VALID_NUMBERS.forEach((n) => (counts[n] = 0));

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const value = this.getCell(i, j).value;
          if (counts[value] !== undefined) counts[value]++;
        }
      }

      for (let i = 1; i <= 9; i++) {
        const elem = document.getElementById("used" + i);
        if (counts[i.toString()] >= 9) {
          elem.classList.remove("hide");
        } else {
          elem.classList.add("hide");
        }
      }
    },

    setBoardSize(small) {
      const action = small ? "add" : "remove";
      document.querySelectorAll("input[type=number]")
        .forEach((elem) => elem.classList[action]("textInputToggle"));
      document.querySelectorAll(".oddRight")
        .forEach((elem) => elem.classList[action]("oddRightToggle"));
      document.querySelectorAll(".strangeRight")
        .forEach((elem) => elem.classList[action]("strangeRightToggle"));
      document.querySelectorAll("textarea")
        .forEach((elem) => elem.classList[action]("textareaToggle"));
      document.querySelectorAll(".noteOpenDiv")
        .forEach((elem) => elem.classList[action]("noteOpenDivToggle"));
    },

    setBoardToGreen() {
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          this.getCell(i, j).style.background = "darkseagreen";
        }
      }
    },

    markCellsReadOnly(readonly) {
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          this.getCell(i, j).readOnly = readonly;
        }
      }
    },
  };

  // ============================================
  // GAME LOGIC
  // ============================================
  const Game = {
    async start() {
      if (State.gameStarted) return;

      const difficultyInput = Array.from(document.getElementsByName("difficulty"))
        .find((input) => input.checked);

      if (!difficultyInput) {
        UI.modal("Select a difficulty", 1600);
        return;
      }

      State.difficulty = difficultyInput.value;
      State.isGenerating = true;
      UI.showLoading();

      // Allow UI to update before heavy computation
      await Utils.sleep(50);

      Generator.generate();

      // Populate the board based on difficulty
      const difficultyValue = DIFFICULTY_SETTINGS[State.difficulty];
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const cell = UI.getCell(row, col);
          cell.readOnly = false;
          cell.style.background = "";

          if (Utils.randomInt(0, difficultyValue) === 0) {
            cell.value = State.solvedBoard[row][col];
            cell.readOnly = true;
            cell.classList.add("prefilled");
          } else {
            cell.value = "";
            UI.getNoteOpen(row, col).classList.remove("hide");
          }
        }
      }

      State.gameStarted = true;
      State.isGenerating = false;
      UI.hideLoading();

      this.showGameUI();
      Timer.start();
      UI.updateUsedNumbers();
      EventEmitter.emit("gameStarted");
    },

    showGameUI() {
      document.getElementById("usedNums").classList.remove("hide");
      document.getElementById("difficultySelect").classList.add("hide");
      document.getElementById("introText").classList.add("hide");
      DOM.timerDisplay.classList.remove("hide");
      DOM.timerContainer.classList.remove("hide");
    },

    checkAnswer() {
      if (!State.gameStarted || State.gameOver) return;

      // Check if all cells are filled
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const value = UI.getCell(row, col).value;
          if (!VALID_NUMBERS.includes(value)) {
            UI.modal("Sorry, incorrect!", 1500);
            return;
          }
        }
      }

      // Build answer board and find errors
      const errors = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        State.answerBoard[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
          const value = UI.getCell(row, col).value;
          State.answerBoard[row][col] = value;
        }
      }

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (!Generator.possible(row, col, State.answerBoard[row][col], State.answerBoard, true)) {
            errors.push([row, col]);
          }
        }
      }

      if (errors.length > 0) {
        UI.modal("Sorry, incorrect!", 1500);
        errors.forEach(([row, col]) => {
          UI.getCell(row, col).style.background = "red";
        });
        return;
      }

      // Success!
      Timer.stop();
      UI.modal("Correct!", 2000);
      UI.markCellsReadOnly(true);

      if (!DOM.timerCheckbox.checked) {
        Utils.sleep(2000).then(() => {
          UI.closableModal("Completed in " + Timer.getTimeString());
        });
      }

      UI.setBoardToGreen();
      State.gameOver = true;
      EventEmitter.emit("gameWon");
    },

    reset() {
      Timer.stop();
      location.reload();
    },

    toggleSize() {
      const isSmall = Storage.get("largeBoard") === "false";
      UI.setBoardSize(!isSmall);
      Storage.set("largeBoard", isSmall ? "true" : "false", 10);
    },

    toggleTimer() {
      if (DOM.timerCheckbox.checked) {
        DOM.timerDisplay.classList.add("invisible");
        Storage.set("hideSudokuTimer", "Y", 30);
      } else {
        DOM.timerDisplay.classList.remove("invisible");
        Storage.set("hideSudokuTimer", "N", 30);
      }
    },
  };

  // ============================================
  // INPUT HANDLERS
  // ============================================
  const InputHandler = {
    parseCoords(id, prefixLen) {
      const coords = id.substring(prefixLen);
      return [parseInt(coords[0]), parseInt(coords[1])];
    },

    handleCellFocus(e) {
      const row = parseInt(e.target.getAttribute("row"));
      const col = parseInt(e.target.getAttribute("col"));
      State.selectedCell = { row, col };
      UI.highlightRelatedCells(row, col);
      EventEmitter.emit("cellSelected", { row, col });
    },

    handleCellBlur() {
      // Don't clear immediately - let click handler work first
      setTimeout(() => {
        if (!document.activeElement.classList.contains("arrow-nav")) {
          State.selectedCell = null;
          UI.clearHighlights();
        }
      }, 100);
    },

    handleCellInput() {
      UI.updateUsedNumbers();
      UI.highlightConflicts();
      EventEmitter.emit("cellChanged");
    },

    handleKeyboard(e) {
      const activeElement = document.activeElement;

      // Handle number input when a cell is focused
      if (activeElement.classList.contains("arrow-nav") && !activeElement.readOnly) {
        // Number keys 1-9
        if (e.key >= "1" && e.key <= "9") {
          e.preventDefault();
          activeElement.value = e.key;
          this.handleCellInput();
          return;
        }

        // Delete or Backspace to clear
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          activeElement.value = "";
          this.handleCellInput();
          return;
        }

        // Prevent other character input
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          return;
        }
      }

      // Arrow key navigation
      if (!activeElement.classList.contains("arrow-nav")) return;

      const row = parseInt(activeElement.getAttribute("row"));
      const col = parseInt(activeElement.getAttribute("col"));

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (row > 0) UI.getCell(row - 1, col).focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (row < GRID_SIZE - 1) UI.getCell(row + 1, col).focus();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (col > 0) UI.getCell(row, col - 1).focus();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (col < GRID_SIZE - 1) UI.getCell(row, col + 1).focus();
          break;
      }
    },

    handleNoteToggle(e) {
      const [row, col] = this.parseCoords(e.target.id, 2);
      const noteElem = UI.getNote(row, col);
      const noteOpenElem = UI.getNoteOpen(row, col);
      const cell = UI.getCell(row, col);

      if (noteElem.classList.contains("hide") && State.gameStarted && !cell.readOnly) {
        noteElem.classList.remove("hide");
        noteElem.focus();
        noteOpenElem.innerHTML = "«";
      } else {
        noteElem.classList.add("hide");
        noteOpenElem.innerHTML = "»";
      }
    },

    handleNoteButtonShow(e) {
      if (!State.gameStarted) return;
      if (e.target.tagName === "SPAN" || e.target.tagName === "DIV") return;

      const [row, col] = this.parseCoords(e.target.id, 1);
      if (!UI.getCell(row, col).readOnly) {
        UI.getNoteOpen(row, col).classList.add("opaque");
      }
    },

    handleNoteButtonHide(e) {
      const [row, col] = this.parseCoords(e.target.id, 2);
      UI.getNoteOpen(row, col).classList.remove("opaque");
    },
  };

  // ============================================
  // BOARD BUILDER
  // ============================================
  const BoardBuilder = {
    build() {
      for (let i = 0; i < GRID_SIZE; i++) {
        State.board.push([]);
        State.solvedBoard.push([]);
        State.answerBoard.push([]);

        const entryRow = document.createElement("div");
        entryRow.classList.add("entryRow");
        entryRow.setAttribute("role", "row");
        DOM.boardUI.appendChild(entryRow);

        for (let j = 0; j < GRID_SIZE; j++) {
          State.answerBoard[i][j] = "";
          State.board[i][j] = "";
          State.solvedBoard[i][j] = "";

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

          State.cells[`${i},${j}`] = entry;
          State.cells[`n${i},${j}`] = note;
          State.cells[`no${i},${j}`] = noteOpen;

          entry.readOnly = true;
          entry.type = "number";
          entry.inputMode = "numeric";
          entry.classList.add("arrow-nav");

          entry.addEventListener("input", () => InputHandler.handleCellInput());
          entry.addEventListener("focus", (e) => InputHandler.handleCellFocus(e));
          entry.addEventListener("blur", () => InputHandler.handleCellBlur());

          entry.setAttribute("row", i.toString());
          entry.setAttribute("col", j.toString());
          entry.setAttribute("aria-label", `Row ${i + 1}, Column ${j + 1}`);
          entry.setAttribute("min", "1");
          entry.setAttribute("max", "9");

          entryDiv.classList.add("entryDiv");
          entryDiv.setAttribute("role", "gridcell");
          noteOpenDiv.classList.add("noteOpenDiv");

          entryDiv.addEventListener("mouseover", (e) => InputHandler.handleNoteButtonShow(e));
          entryDiv.addEventListener("mouseleave", (e) => InputHandler.handleNoteButtonHide(e));

          entryDiv.appendChild(entry);
          entryDiv.appendChild(note);
          noteOpenDiv.appendChild(noteOpen);
          entryDiv.appendChild(noteOpenDiv);

          noteOpen.addEventListener("click", (e) => InputHandler.handleNoteToggle(e));
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
    },
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  const init = () => {
    DOM.init();
    UI.createLoadingOverlay();
    BoardBuilder.build();

    // Event listeners for buttons
    document.getElementById("start").addEventListener("click", () => Game.start());
    document.getElementById("checkAnswer").addEventListener("click", () => Game.checkAnswer());
    document.getElementById("startover").addEventListener("click", () => Game.reset());
    document.getElementById("toggleSize").addEventListener("click", () => Game.toggleSize());
    document.getElementById("hideTimer").addEventListener("click", () => Game.toggleTimer());

    // Keyboard handler
    document.addEventListener("keydown", (e) => InputHandler.handleKeyboard(e));

    // Load preferences
    if (Storage.get("largeBoard") === "false") {
      UI.setBoardSize(true);
    }
    DOM.timerCheckbox.checked = Storage.get("hideSudokuTimer") === "Y";
    Game.toggleTimer();
  };

  // Start the application
  init();
})();
