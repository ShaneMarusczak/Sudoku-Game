"use strict";

(() => {
	//#region variables
	const rows = 9;
	const cols = 9;
	const boardUI = document.getElementById("sudoku");
	const startBtn = document.getElementById("start");
	const startOverBtn = document.getElementById("startover");
	const finishButton = document.getElementById("finish");
	const timer = document.getElementById("timer");
	let seconds = 0;
	let minutes = 0;
	let hours = 0;
	var board = [];
	const copiedBoard = [];
	let dificulty;
	let solved = false;
	const dificultySettings = {
		"easy": 1,
		"hard": 3,
		"insane": 5,
		"medium": 2
	};
	//#endregion

	//#region functions

	const add = () => {
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
		var t = setTimeout(add, 1000);
	};

	//inclusive
	const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

	const start = () => {
		solved = false;
		dificulty = Array.from(document.getElementsByName("dificulty")).find(input => input.checked);

		if (typeof dificulty === "undefined") {
			alert("Please select a dificulty.");
			return;
		}
		generateRandomBoard();
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				if (randomIntFromInterval(0, dificultySettings[dificulty.value]) === 0) {
					document.getElementById("s" + y + x).value = copiedBoard[y][x];
					document.getElementById("s" + y + x).readOnly = true;
				}
			}
		}
		timerStart();
	};

	const finish = () => {
		if (!validate()) {
			alert("Not all entries are valid!");
			return;
		}
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				if (document.getElementById("s" + y + x).value !== copiedBoard[y][x]) {
					alert("Sorry, incorrect!");
					return;
				}
			}
		}
		clearTimeout(t);
		alert("Correct!");
	};

	const validate = () => {
		var rv = true;
		const validValues = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				document.getElementById("s" + y + x).style.backgroundColor = "aliceblue";
				if (!validValues.includes(document.getElementById("s" + y + x).value)) {
					document.getElementById("s" + y + x).style.backgroundColor = "red";
					rv = false;
				}
			}
		}
		return rv;
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
						if (possible(y, x, n)) {
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
		copyBoard(board);
	};

	const copyBoard = (board) => {
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				copiedBoard[y][x] = board[y][x];
			}
		}
	};

	const possible = (y, x, n) => {
		for (let i = 0; i < 9; i++) {
			if (board[y][i] == n) {
				return false;
			}
		}
		for (let i = 0; i < 9; i++) {
			if (board[i][x] == n) {
				return false;
			}
		}
		const x0 = Math.floor(x / 3) * 3;
		const y0 = Math.floor(y / 3) * 3;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (board[y0 + i][x0 + j] == n) {
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
		solve();
	};
	//#endregion

	//#region event listeners
	startBtn.addEventListener("click", () => {
		start();
	});

	finishButton.addEventListener("click", () => {
		finish();
	});

	startOverBtn.addEventListener("click", () => location.reload());
	//#endregion

	//#region page setup
	for (let i = 0; i < rows; i++) {
		board.push([]);
		copiedBoard.push([]);
		const entryRow = document.createElement("div");
		boardUI.appendChild(entryRow);
		for (let j = 0; j < cols; j++) {
			board[i][j] = "";
			copiedBoard[i][j] = "";
			const entry = document.createElement("input");
			entryRow.appendChild(entry);
			entry.id = "s" + i + j;
		}
	}
	//#endregion
})();
