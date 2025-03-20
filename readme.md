# Sudoku Game

A browser-based Sudoku game built with HTML, CSS, and JavaScript. It generates a new, randomized Sudoku board each session using recursion and backtracking techniques. The game offers multiple difficulty levels and interactive features, allowing players to challenge themselves and track their progress with an in-game timer.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Installation Instructions](#installation-instructions)
3. [Usage Guide](#usage-guide)
4. [File and Structure Overview](#file-and-structure-overview)
5. [Configuration Details](#configuration-details)
6. [Contribution Guidelines](#contribution-guidelines)
7. [License Information](#license-information)

---

## Project Overview

This Sudoku game provides an engaging experience with the following key features:

- **Randomized Board Generation:** Uses a seed of nine pseudorandom numbers combined with recursion/backtracking to generate board solutions.
- **Difficulty Settings:** Choose from Easy, Medium, Hard, and Insane levels. The selected level influences how many numbers are revealed at the start.
- **Dynamic Gameplay:** Includes an interactive timer, keyboard navigation, and several game control buttons.
- **Responsive UI:** Offers a modern interface that adapts to different screen sizes and user preferences.

---

## Installation Instructions

1. **Clone the Repository**

   If you have Git installed, you can clone the repository by running:

   > git clone https://github.com/ShaneMarusczak/Sudoku-Game.git

2. **Directory Setup**

   The project structure includes separate folders for HTML, CSS, JavaScript, and assets. No additional dependency installation is required.

3. **Open in Browser**

   Simply open the `index.html` file in your preferred web browser. Alternatively, you can serve the project using a local web server for development.

---

## Usage Guide

1. **Starting the Game**

   - Select a difficulty level from the options (Easy, Medium, Hard, Insane).
   - Click the **Start Game** button.
   - The game board will populate, and the timer will start.

2. **Interacting with the Board**

   - Input numbers into the board. Pre-filled cells are locked and cannot be modified.
   - Use arrow keys to navigate between cells.

3. **Game Controls**

   - **Check Answer:** Evaluates the current board against Sudoku rules. Incorrect cells are highlighted in red.
   - **Start Over:** Reloads the game and resets the board.
   - **Toggle Size:** Switch between compact and full-size views of the board.
   - **Hide Timer:** Optionally hide or display the timer based on your preferences.

4. **Additional Features**

   - A modal notification system provides feedback (e.g., "Select a difficulty", "Correct!", "Sorry, incorrect!").
   - Cookie-based settings remember board size and timer visibility.

---

## File and Structure Overview

- **index.html:**  
  The main entry point of the game. Contains the layout, linking to stylesheets and JavaScript files, and sets up the game UI (difficulty selection, board container, timer, buttons, etc.).

- **css/**  
  - **style.css:** A human-readable version of the game’s styling.  
  - **style.min.css:** Minified version for optimized performance.

- **js/**  
  - **sudoku.js:** Contains the core game logic including board generation, timer functions, and event handlers.
  - **sudoku.min.js:** Minified version of the main game logic for production, with similar features to enhance the gameplay experience.

- **images/**  
  Contains UI icons used for navigation (e.g., home icon, GitHub icon).

- **LICENSE.md:**  
  Specifies that this project is released into the public domain (Unlicense).

- **readme.md:**  
  An overview of the project’s objectives and features.

---

## Configuration Details

- **Cookies:**  
  - The game uses cookies to store settings such as board size (`largeBoard`) and timer visibility (`hideSudokuTimer`).  
  - These settings persist for a number of days (e.g., board size preference expires after 10 days).

- **Difficulty Settings:**  
  Defined in the JavaScript files, each difficulty level (easy, medium, hard, insane) determines how many pre-filled numbers appear on the board.

- **Responsive Styling:**  
  Media queries in the CSS adjust the board size and element spacing for smaller screen resolutions.

---

## Contribution Guidelines

Contributions are welcome! To suggest improvements or report issues:

- Fork the repository.
- Create a new branch for your feature or fix.
- Submit a pull request with a clear description of your changes.

If a detailed guide exists, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

---

## License Information

This project is released into the public domain under the Unlicense. For more details, see the [LICENSE.md](LICENSE.md) file.

---

Enjoy playing Sudoku and feel free to contribute your enhancements to make this game even better!
