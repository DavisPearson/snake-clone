//getting context and establishing relationship between script and html file

const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

//global settings

let scl = 70;
let xGrid = Math.floor(canvas.width / scl);
let yGrid = xGrid;
let playerDx = xGrid;
let playerDy = 0;
let gameOver = false;
let playerSquareArr = [];
let appleArr = [];
let key = "";
let playerLength = 6;
let frameIndexNum = 0;
const checkColide = (x1, y1, x2, y2) => {
  if (x1 < x2 + 3 && x1 > x2 - 3 && y1 < y2 + 3 && y1 > y2 - 3) {
    return true;
  }
};

//establishing window resize event

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

//chosing random location for apple and rendering it on the page
//I tried to make it check if a player square occupied the space the apple was attempting to spawn in, but it bugs out and doesnt wirk every now and then, not sure why

const createApple = () => {
  let randX = xGrid * Math.floor(Math.random() * scl);
  let randY =
    yGrid * Math.floor(Math.random() * Math.floor(canvas.height / yGrid));
  for (let i = 0; i < playerSquareArr.length; i++) {
    if (checkColide(randX, randY, playerSquareArr[i].x, playerSquareArr[i].y)) {
      createApple();
      break;
    } else {
      drawSquare(randX, randY, xGrid, yGrid, "red");
      break;
    }
  }
};
class Apple {
  constructor(x, y, width, height, col) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = col;
  }
  draw() {
    c.beginPath();
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, xGrid, yGrid);
  }
  update() {
    this.draw();
  }
}

//player movement controls, a big pain was trying to keep the player from going backwards and running through themself and dying

addEventListener("keydown", function (event) {
  if (event.key === "w" && key !== "s") {
    playerDx = 0;
    playerDy = -yGrid;
    key = "w";
  } else if (event.key === "a" && key !== "d") {
    playerDx = -xGrid;
    playerDy = 0;
    key = "a";
  } else if (event.key === "s" && key !== "w") {
    playerDx = 0;
    playerDy = yGrid;
    key = "s";
  } else if (event.key === "d" && key !== "a") {
    playerDx = xGrid;
    playerDy = 0;
    key = "d";
  }
});

/*drawing the player wasnt as simple as simply moving the palayer from square to square
to save on efficiency and not have to calculate a new location for each square 
i had each square stay where they were origionally rendered, and just identified each square by its age
the square with the lowest age was the head of the snake, if it colides with another square, the game is over.
each frame the next square is drawn in the direction that the player is facing, and depending on the player length
the last square pops off of the playerSquare array, creating the appearence of movement.
*/

class PlayerSquare {
  constructor(x, y, width, height, col) {
    this.x = x;
    this.y = y;
    this.color = col;
    this.width = width;
    this.height = height;
    this.age = 0;
    this.i = "";
  }
  draw() {
    c.beginPath();
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width, this.height);
  }
  update(i) {
    this.i = i;
    this.draw();
    if (this.i == 0) {
      for (let l = 0; l < appleArr.length; l++) {
        if (checkColide(this.x, this.y, appleArr[l].x, appleArr[l].y)) {
          appleArr.pop();
          createApple();
          playerLength += 1;
        }
      }
      for (let j = 1; j < playerSquareArr.length; j++) {
        if (j > 4) {
          if (
            checkColide(
              this.x,
              this.y,
              playerSquareArr[j].x,
              playerSquareArr[j].y
            )
          ) {
            gameOver = true;
          }
        } else if (
          j <= 4 &&
          checkColide(
            this.x,
            this.y,
            playerSquareArr[j].x,
            playerSquareArr[j].y
          )
        ) {
          this.x += xGrid;
          this.y += yGrid;
        }
      }
    }
    if (this.age >= playerLength) {
      playerSquareArr.pop();
    }
    this.age++;
  }
  drawNext(index) {
    if (index == 0) {
      if (this.x + xGrid > canvas.width) {
        drawSquare(0, this.y + playerDy, xGrid, yGrid, this.color);
      } else if (this.x < 0) {
        drawSquare(
          xGrid * Math.floor(canvas.width / xGrid) - xGrid,
          this.y,
          xGrid,
          yGrid,
          this.color
        );
      } else if (this.y + yGrid > canvas.height) {
        drawSquare(this.x + playerDx, 0, xGrid, yGrid, this.color);
      } else if (this.y < 0) {
        drawSquare(
          this.x,
          yGrid * Math.floor(canvas.height / yGrid) - yGrid,
          xGrid,
          yGrid,
          this.color
        );
      } else {
        drawSquare(
          this.x + playerDx,
          this.y + playerDy,
          xGrid,
          yGrid,
          this.color
        );
      }
    }
  }
}

//this function draws a square and seperates the different types of squares into their respective arrays

const drawSquare = (x, y, width, height, col) => {
  if (col === "green") {
    c.beginPath();
    c.fillStyle = col;
    c.fillRect(
      x + xGrid / 50,
      y + yGrid / 50,
      width - xGrid / 10,
      height - yGrid / 10
    );
    playerSquareArr.unshift(
      new PlayerSquare(x, y, width - xGrid / 10, height - yGrid / 10, col)
    );
  } else {
    c.beginPath();
    c.fillStyle = col;
    c.fillRect(
      x + xGrid / 50,
      y + yGrid / 50,
      width - xGrid / 10,
      height - yGrid / 10
    );
    appleArr.push(
      new Apple(x, y, width - xGrid / 10, height - yGrid / 10, col)
    );
  }
};

//creating the new player and initial apple

const initializeGame = () => {
  drawSquare(xGrid * 1, yGrid * 1, xGrid, yGrid, "green");
  createApple();
};

//lowering frame rate by establishing an index and only running the next frame if the index meets certain parameters

const frameIndex = () => {
  frameIndexNum++;
  if (frameIndexNum >= 100) {
    frameIndexNum = 0;
  }
};

//taking frame index and animating the game accordingly

const animate = () => {
  requestAnimationFrame(animate);
  frameIndex();
  if (gameOver == false) {
    if (frameIndexNum % 4 == 0) {
      console.log(appleArr);
      c.clearRect(0, 0, canvas.width, canvas.height);
      for (let k = 0; k < appleArr.length; k++) {
        appleArr[k].update();
      }
      for (let i = 0; i < playerSquareArr.length; i++) {
        playerSquareArr[i].drawNext(i);
        playerSquareArr[i].update(i);
      }
    }
  }
};

//this is the actual game running

initializeGame();
animate();
