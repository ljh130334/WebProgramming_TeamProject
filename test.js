const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const wrapper = document.getElementById("wrapper");
const gameResult = document.getElementById("gameResult");
const nextLevel = document.getElementById("nextLevel");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const homeButton = document.getElementById("homeButton");
const resultMessage = document.getElementById("resultMessage");
const dishSelect = document.getElementById("dishSelect");
const difficultySelect = document.getElementById("difficultySelect");
const targetList = document.getElementById("targetList");
const remainingList = document.getElementById("remainingList");
const timerDisplay = document.getElementById("timer");
const countdownDisplay = document.getElementById("countdown");
const gameButton = document.getElementById("gameButton");

const dishes = {
  hamburger: ["빵", "패티", "토마토", "치즈", "양상추", "양파", "피클", "베이컨"],
  pizza: ["도우", "치즈", "올리브", "소시지", "페퍼로니", "양파", "버섯", "피망"]
};

const successConditions = {
  hamburger: {
    easy: ["빵", "패티", "치즈", "양상추", "빵"],
    normal: ["빵", "패티", "치즈", "양상추", "피클", "양파", "빵"],
    hard: ["빵", "패티", "토마토", "치즈", "양상추", "양파", "피클", "베이컨", "빵"]
  },
  pizza: {
    easy: ["도우", "치즈", "올리브", "페퍼로니"],
    normal: ["도우", "치즈", "올리브", "소시지", "페퍼로니", "양파"],
    hard: ["도우", "치즈", "올리브", "소시지", "페퍼로니", "양파", "버섯", "피망"]
  }
};

const difficultySettings = {
  easy: { time: 60, speed: 2 },
  normal: { time: 45, speed: 3 },
  hard: { time: 30, speed: 4 }
};

const difficulties = ["easy", "normal", "hard"];

let gameInterval, countdownInterval;
let paddle, ball, bricks, remaining, targetItems;
let timeLeft = 0;
let currentDish, currentDifficulty;

startButton.onclick = () => {
  const dish = dishSelect.value;
  const difficulty = difficultySelect.value;
  initGame(dish, difficulty);
};

restartButton.onclick = () => {

  clearInterval(gameInterval);
  clearInterval(countdownInterval);

  initGame(currentDish, currentDifficulty);
};

homeButton.onclick = () => {
  location.reload();
};

function initGame(dish, difficulty) {
  currentDish = dish;
  currentDifficulty = difficulty;

  startScreen.style.display = "none";
  gameScreen.style.display = "flex";
  wrapper.style.display = "none";
  gameResult.style.display = "none";
  gameButton.style.display = "none";
  nextLevel.style.display = "none";
  canvas.focus();

  timeLeft = difficultySettings[difficulty].time;
  timerDisplay.textContent = `시간: ${timeLeft}s`;

  const speed = difficultySettings[difficulty].speed;
  targetItems = [...successConditions[dish][difficulty]];
  remaining = [...targetItems];
  updateLists();

  paddle = { x: canvas.width / 2 - 40, width: 80, height: 10 };
  ball = { x: canvas.width / 2, y: canvas.height - 30, dx: speed, dy: -speed, radius: 8 };

  bricks = generateBricks(dish, difficulty);

  gameInterval = setInterval(() => {
    updateGame();
    drawGame();
  }, 16);

  countdownInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `시간: ${timeLeft}s`;
    if (timeLeft <= 0) endGame(false);
  }, 1000);
}

function generateBricks(dish, difficulty) {
  const result = [];
  const successItems = successConditions[dish][difficulty];

  const totalBricks = 15;

  let bricksNames = [...successItems];

  const leftoverItems = successItems.filter(item => !bricksNames.includes(item));

  const remainingCount = totalBricks - bricksNames.length;

  for (let i = 0; i < remainingCount; i++) {
    const randomIndex = Math.floor(Math.random() * successItems.length);
    bricksNames.push(successItems[randomIndex]);
  }

  for (let i = 0; i < totalBricks; i++) {
    const x = 30 + (i % 5) * 110;
    const y = 40 + Math.floor(i / 5) * 35;
    result.push({ x, y, width: 100, height: 30, name: bricksNames[i], hit: false });
  }

  return result;
}


function updateLists() {
  targetList.innerHTML = "";
  remainingList.innerHTML = "";
  [...new Set(targetItems)].forEach(item => {
    const li = document.createElement("li");
    const count = targetItems.filter(i => i === item).length;
    li.textContent = `${item} (${count})`;
    targetList.appendChild(li);
  });
  [...new Set(remaining)].forEach(item => {
    const li = document.createElement("li");
    const count = remaining.filter(i => i === item).length;
    li.textContent = `${item} (${count})`;
    remainingList.appendChild(li);
  });
}

function updateGame() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) ball.dx *= -1;
  if (ball.y < ball.radius) ball.dy *= -1;
  if (ball.y > canvas.height) endGame(false);

  if (
    ball.y + ball.radius >= canvas.height - paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.dy > 0
  ) {
    const paddleCenter = paddle.x + paddle.width / 2;
    const distFromCenter = (ball.x - paddleCenter) / (paddle.width / 2);

    const speed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
    const maxBounceAngle = Math.PI / 3;
    const bounceAngle = distFromCenter * maxBounceAngle;

    ball.dx = speed * Math.sin(bounceAngle);
    ball.dy = -Math.abs(speed * Math.cos(bounceAngle));
  }

  bricks.forEach(brick => {
    if (!brick.hit &&
      ball.x > brick.x && ball.x < brick.x + brick.width &&
      ball.y > brick.y && ball.y < brick.y + brick.height) {
      brick.hit = true;
      ball.dy *= -1;
      const idx = remaining.indexOf(brick.name);
      if (idx !== -1) remaining.splice(idx, 1);
      updateLists();
      if (remaining.length === 0) endGame(true);
    }
  });
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "blue";
  ctx.fillRect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);

  bricks.forEach(brick => {
    if (!brick.hit) {
      ctx.fillStyle = "orange";
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(brick.name, brick.x + 10, brick.y + 15);
    }
  });
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, x - paddle.width / 2));
});

function endGame(success) {
  clearInterval(gameInterval);
  clearInterval(countdownInterval);
  gameScreen.style.display = "none";

  if (success) {
    const difficulties = ["easy", "normal", "hard"];
    const currentIndex = difficulties.indexOf(currentDifficulty);
    const nextIndex = currentIndex + 1;

    if (nextIndex < difficulties.length) {
      wrapper.style.display = "block";
      gameResult.style.display = "block";
      resultMessage.textContent = "요리 완성!";
      gameButton.style.display = "block";
      nextLevel.style.display = "block";

      let count = 5;
      countdownDisplay.textContent = count;

      const countdown = setInterval(() => {
        count--;
        countdownDisplay.textContent = count;
        if (count <= 0) {
          clearInterval(countdown);
          nextLevel.style.display = "none";
          currentDifficulty = difficulties[nextIndex];
          initGame(currentDish, currentDifficulty);
        }
      }, 1000);
    } else {
      wrapper.style.display = "block";
      gameResult.style.display = "block";
      gameButton.style.display = "none";
      nextLevel.style.display = "none";
      resultMessage.textContent = "모든 레벨을 클리어했습니다!";

      setTimeout(() => {
        wrapper.style.display = "none";
        gameResult.style.display = "none";
        startScreen.style.display = "block";
      }, 1000);
    }
  } else {
    wrapper.style.display = "block";
    gameResult.style.display = "block";
    resultMessage.textContent = "요리 실패...";
    gameButton.style.display = "block";
    nextLevel.style.display = "none";
  }
}