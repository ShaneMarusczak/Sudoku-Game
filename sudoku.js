"use strict";

(() => {

	//#region variables
	let numberOfHints = 0;
	var runningTimer;
	const rows = 9;
	const cols = 9;
	const boardUI = document.getElementById("sudoku");
	const startBtn = document.getElementById("start");
	const startOverBtn = document.getElementById("startover");
	const hintBtn = document.getElementById("hint");
	const checkAnswerButton = document.getElementById("checkAnswer");
	const timer = document.getElementById("timer");
	let seconds = 0;
	let minutes = 0;
	let hours = 0;
	var board = [];
	const copiedBoard = [];
	const answerBoard = [];
	let difficulty;
	let solved = false;
	let gameStarted = false;
	const difficultySettings = {
		"easy": 1,
		"hard": 3,
		"insane": 5,
		"medium": 2
	};
	//#endregion

	//#region functions
	const giveHint = () => {
		if (numberOfHints <= 6 - difficultySettings[difficulty.value]) {
			const x = randomIntFromInterval(0, 8);
			const y = randomIntFromInterval(0, 8);
			if (document.getElementById("s" + y + x).value === "") {
				document.getElementById("s" + y + x).value = copiedBoard[y][x];
				numberOfHints++;
			} else {
				giveHint();
			}
		} else {
			alertModalControl("Out of hints!", 1500);
		}
	};

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	const alertModalControl = (message, duration) => {
		document.getElementById("alertshader").style.display = "block";
		document.getElementById("alertmessage").innerText = message;
		sleep(duration).then(() => {
			document.getElementById("alertshader").style.display = "none";
		});
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
		timer.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" +
			(minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" +
			(seconds > 9 ? seconds : "0" + seconds);
		timerStart();
	};

	const timerStart = () => {
		runningTimer = setTimeout(timerTick, 1000);
	};

	//inclusive
	const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

	const start = () => {
		if (gameStarted) {
			return;
		}

		difficulty = Array.from(document.getElementsByName("difficulty")).find(input => input.checked);

		if (typeof difficulty === "undefined") {
			alertModalControl("Please select a difficulty.", 1500);
			return;
		}
		generateRandomBoard();
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				if (randomIntFromInterval(0, difficultySettings[difficulty.value]) === 0) {
					document.getElementById("s" + y + x).value = copiedBoard[y][x];
					document.getElementById("s" + y + x).readOnly = true;
				}
			}
		}
		solved = false;
		gameStarted = true;
		hintBtn.classList.remove("hide");
		timer.classList.remove("hide");
		timerStart();
		disableRadios();
	};

	const checkAnswer = () => {
		if (!validate()) {
			alertModalControl("Not all entries are valid!", 1500);
			return;
		}
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				answerBoard[y][x] = document.getElementById("s" + y + x).value;
			}
		}
		if (!validBoard(answerBoard)) {
			alertModalControl("Sorry, incorrect!", 1500);
			return;
		}
		clearTimeout(runningTimer);
		alertModalControl("Correct!", 1500);
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
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				if (!possible(y, x, board[y][x], board, true)) {
					return false;
				}
			}
		}
		return true;
	};

	const solve = () => {
		if (solved) {
			return;
		}
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				if (board[y][x] == "") {
					for (let n = 1; n < 10; n++) {
						if (solved) {
							return;
						}
						if (possible(y, x, n, board, false)) {
							board[y][x] = n;
							solve();
							board[y][x] = "";
						}
					}
					return;
				}
			}
		}
		solved = true;
		copyBoard(board, copiedBoard);
	};

	const copyBoard = (boardFrom, boardTo) => {
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				boardTo[y][x] = boardFrom[y][x];
			}
		}
	};

	const possible = (y, x, n, boardArg, checkingMode) => {
		if (checkingMode) {
			for (let i = 0; i < 9; i++) {
				if (boardArg[y][i] == n && i != x) {
					return false;
				}
			}
			for (let i = 0; i < 9; i++) {
				if (boardArg[i][x] == n && i != y) {
					return false;
				}
			}
			const x0 = Math.floor(x / 3) * 3;
			const y0 = Math.floor(y / 3) * 3;
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (boardArg[y0 + i][x0 + j] == n && y0 + i != y && x0 + j != x) {
						return false;
					}
				}
			}
			return true;
		} else {
			for (let i = 0; i < 9; i++) {
				if (boardArg[y][i] == n) {
					return false;
				}
			}
			for (let i = 0; i < 9; i++) {
				if (boardArg[i][x] == n) {
					return false;
				}
			}
			const x0 = Math.floor(x / 3) * 3;
			const y0 = Math.floor(y / 3) * 3;
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (boardArg[y0 + i][x0 + j] == n) {
						return false;
					}
				}
			}
			return true;
		}
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
		solve();
	};

	const disableRadios = () => {
		const radios = document.querySelectorAll(".difficultRadio");
		for (const radio of radios) {
			radio.disabled = true;
		}
	};
	//#endregion

	//#region event listeners
	startBtn.addEventListener("click", () => {
		start();
	});

	checkAnswerButton.addEventListener("click", () => {
		checkAnswer();
	});

	hintBtn.addEventListener("click", () => {
		giveHint();
	});

	startOverBtn.addEventListener("click", () => location.reload());
	//#endregion

	//#region page setup
	for (let i = 0; i < rows; i++) {
		board.push([]);
		copiedBoard.push([]);
		answerBoard.push([]);
		const entryRow = document.createElement("div");
		boardUI.appendChild(entryRow);
		for (let j = 0; j < cols; j++) {
			answerBoard[i][j] = "";
			board[i][j] = "";
			copiedBoard[i][j] = "";
			const entry = document.createElement("input");
			entryRow.appendChild(entry);
			entry.id = "s" + i + j;
		}
	}
	//#endregion
})();