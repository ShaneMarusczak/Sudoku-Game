#Sudoku

Sudoku boards are generated using a technique that uses both recursion and backtracking ideas to produce complete game boards.

Boards are seeded with 9 pseudorandom numbers to produce a different Sudoku board each game session.

Each difficulty controls how many of the generated values are show to the user.

Boards are not checked against the originally produced board as many sudoku boards have multiple correct solutions. Instead, boards are deemed finished if all numbers on the board match the rules of sudoku. (All columns, rows and 3x3 squares contain the number 1-9).
