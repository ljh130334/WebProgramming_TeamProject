$(document).ready(function () {
  initGameSystem();
});

// ===========================================
// 게임 전역 변수
// ===========================================

let game = {
  canvas: null,
  ctx: null,
  isPlaying: false,
  isPaused: false,

  // 게임 설정
  selectedSide: null,
  selectedTool: null,
  selectedDifficulty: null,

  // 게임 오브젝트
  paddle: { x: 250, y: 470, width: 100, height: 15 },
  balls: [],
  blocks: [],

  // 게임 상태
  score: 0,
  timeLeft: 60,
  requiredIngredients: [],
  collectedIngredients: [],
  michelinStars: 0,

  // 타이머
  gameTimer: null,
  blockTimer: null,
  animationFrame: null,
};

// 블록 타입
const BLOCKS = {
  INGREDIENT: { color: "#4CAF50", points: 10 },
  NORMAL: { color: "#9E9E9E", points: 5 },
  MICHELIN: { color: "#FFD700", points: 50 },
  BOMB: { color: "#F44336", points: 20 },
};

// 난이도별 재료
const RECIPES = {
  Easy: ["🥕", "🧅", "🥩", "🍅"],
  Normal: ["🥕", "🧅", "🥩", "🍅", "🥔", "🌽"],
  Hard: ["🥕", "🧅", "🥩", "🍅", "🥔", "🌽", "🥒", "🍆"],
};

// ===========================================
// 게임 시스템 초기화
// ===========================================

function initGameSystem() {
  $(document).on("screen-changed", function (e, screenId) {
    if (screenId === "game") {
      setTimeout(startGame, 500);
    }
  });

  setupControls();
}

function startGame() {
  console.log("🎮 게임 시작!");

  // 로딩 화면 표시
  $("#game-loading").show();
  $("#game-container").hide();

  // 설정 로드
  game.selectedSide = sessionStorage.getItem("selectedSide") || "black";
  game.selectedTool = sessionStorage.getItem("selectedTool") || "Wok";
  game.selectedDifficulty =
    sessionStorage.getItem("selectedDifficulty") || "Easy";

  // 1초 후 게임 초기화 (로딩 효과)
  setTimeout(() => {
    // 게임 화면 표시
    $("#game-loading").hide();
    $("#game-container").show();

    // 캔버스 초기화
    game.canvas = document.getElementById("game-canvas");
    if (!game.canvas) {
      console.error("캔버스를 찾을 수 없습니다!");
      return;
    }
    game.ctx = game.canvas.getContext("2d");

    // UI 업데이트
    updateGameInfo();

    // 게임 상태 초기화
    resetGame();

    // 게임 시작
    game.isPlaying = true;
    gameLoop();

    // 타이머 시작
    game.gameTimer = setInterval(updateTimer, 1000);
    game.blockTimer = setInterval(moveBlocksDown, 5000);
  }, 1000);
}

function resetGame() {
  // 시간 설정
  const timeSettings = { Easy: 90, Normal: 75, Hard: 60 };
  game.timeLeft = timeSettings[game.selectedDifficulty];

  // 재료 설정
  game.requiredIngredients = [...RECIPES[game.selectedDifficulty]];
  game.collectedIngredients = [];
  game.michelinStars = 0;
  game.score = 0;

  // 패들 위치 초기화
  game.paddle.x = game.canvas.width / 2 - game.paddle.width / 2;
  game.paddle.y = game.canvas.height - 30;

  // 오브젝트 초기화
  game.balls = [
    {
      x: game.canvas.width / 2,
      y: game.canvas.height - 60,
      dx: 3,
      dy: -3,
      radius: 8,
    },
  ];

  generateBlocks();
  updateIngredientsDisplay();
}

// ===========================================
// 블록 생성
// ===========================================

function generateBlocks() {
  game.blocks = [];
  const ingredients = ["🥕", "🧅", "🥩", "🍅", "🥔", "🌽", "🥒", "🍆"];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * 75 + 10;
      const y = row * 30 + 50;

      const rand = Math.random();
      let type,
        content = "";

      if (rand < 0.4) {
        type = "INGREDIENT";
        content = ingredients[Math.floor(Math.random() * ingredients.length)];
      } else if (rand < 0.7) {
        type = "NORMAL";
      } else if (rand < 0.85) {
        type = "MICHELIN";
        content = "⭐";
      } else {
        type = "BOMB";
        content = "💣";
      }

      game.blocks.push({
        x,
        y,
        width: 70,
        height: 25,
        type,
        content,
        destroyed: false,
      });
    }
  }
}

function moveBlocksDown() {
  if (!game.isPlaying || game.isPaused) return;

  // 기존 블록들 아래로 이동
  game.blocks.forEach((block) => (block.y += 30));

  // 바닥에 닿으면 게임 오버
  if (game.blocks.some((block) => block.y + block.height >= game.paddle.y)) {
    endGame(false);
    return;
  }

  // 새 블록 행 추가
  addNewBlocks();
}

function addNewBlocks() {
  const ingredients = ["🥕", "🧅", "🥩", "🍅", "🥔", "🌽", "🥒", "🍆"];

  for (let col = 0; col < 8; col++) {
    if (Math.random() < 0.6) {
      const x = col * 75 + 10;
      const rand = Math.random();
      let type,
        content = "";

      if (rand < 0.5) {
        type = "INGREDIENT";
        content = ingredients[Math.floor(Math.random() * ingredients.length)];
      } else if (rand < 0.8) {
        type = "NORMAL";
      } else {
        type = "MICHELIN";
        content = "⭐";
      }

      game.blocks.push({
        x,
        y: 20,
        width: 70,
        height: 25,
        type,
        content,
        destroyed: false,
      });
    }
  }
}

// ===========================================
// 게임 루프
// ===========================================

function gameLoop() {
  if (!game.isPlaying) return;
  if (!game.isPaused) {
    updateGame();
    drawGame();
  }
  game.animationFrame = requestAnimationFrame(gameLoop);
}

function updateGame() {
  // 공 업데이트
  game.balls.forEach((ball, index) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 벽 충돌
    if (ball.x <= ball.radius || ball.x >= game.canvas.width - ball.radius) {
      ball.dx *= -1;
    }
    if (ball.y <= ball.radius) {
      ball.dy *= -1;
    }

    // 패들 충돌
    if (
      ball.y + ball.radius >= game.paddle.y &&
      ball.x >= game.paddle.x &&
      ball.x <= game.paddle.x + game.paddle.width &&
      ball.dy > 0
    ) {
      ball.dy = -Math.abs(ball.dy);

      // 패들 중앙에서의 거리에 따른 각도 조정
      const paddleCenter = game.paddle.x + game.paddle.width / 2;
      const hitPos = (ball.x - paddleCenter) / (game.paddle.width / 2);
      ball.dx = hitPos * 3;
    }

    // 아래로 떨어짐
    if (ball.y > game.canvas.height + ball.radius) {
      if (game.selectedSide === "black") {
        game.balls.splice(index, 1);
        if (game.balls.length === 0) {
          endGame(false);
        }
      } else {
        // 백 선택시 공 재생성
        ball.x = game.canvas.width / 2;
        ball.y = game.canvas.height - 50;
        ball.dy = -Math.abs(ball.dy);
      }
    }
  });

  // 블록 충돌
  checkBlockCollisions();

  // 승리 조건
  if (game.requiredIngredients.length === 0) {
    endGame(true);
  }
}

function checkBlockCollisions() {
  game.balls.forEach((ball) => {
    game.blocks.forEach((block, blockIndex) => {
      if (block.destroyed) return;

      if (
        ball.x + ball.radius > block.x &&
        ball.x - ball.radius < block.x + block.width &&
        ball.y + ball.radius > block.y &&
        ball.y - ball.radius < block.y + block.height
      ) {
        block.destroyed = true;
        ball.dy *= -1;

        // 블록 타입별 처리
        handleBlockHit(block);

        // 블록 제거
        setTimeout(() => {
          const realIndex = game.blocks.findIndex((b) => b === block);
          if (realIndex > -1) {
            game.blocks.splice(realIndex, 1);
          }
        }, 100);
      }
    });
  });
}

function handleBlockHit(block) {
  game.score += BLOCKS[block.type]?.points || 5;

  switch (block.type) {
    case "INGREDIENT":
      if (game.requiredIngredients.includes(block.content)) {
        const index = game.requiredIngredients.indexOf(block.content);
        game.requiredIngredients.splice(index, 1);
        game.collectedIngredients.push(block.content);
        updateIngredientsDisplay();
      }
      break;

    case "MICHELIN":
      game.michelinStars++;

      if (game.selectedSide === "black") {
        // 흑: 공 크기 증가
        game.balls.forEach((ball) => {
          ball.radius = Math.min(ball.radius + 2, 20);
        });
      } else {
        // 백: 공 개수 증가
        if (game.balls.length < 3) {
          game.balls.push({
            x: game.canvas.width / 2,
            y: game.canvas.height - 100,
            dx: (Math.random() - 0.5) * 4,
            dy: -3,
            radius: 8,
          });
        }
      }
      break;

    case "BOMB":
      // 주변 블록 파괴
      game.blocks.forEach((otherBlock) => {
        const distance = Math.sqrt(
          Math.pow(block.x - otherBlock.x, 2) +
            Math.pow(block.y - otherBlock.y, 2)
        );
        if (distance < 100 && !otherBlock.destroyed) {
          otherBlock.destroyed = true;
        }
      });
      break;
  }

  updateGameInfo();
}

// ===========================================
// 렌더링
// ===========================================

function drawGame() {
  const ctx = game.ctx;

  // 배경 그라디언트 (Canvas API 방식)
  const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  // 블록
  game.blocks.forEach((block) => {
    if (block.destroyed) return;

    // 블록 그림자
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(block.x + 2, block.y + 2, block.width, block.height);

    // 블록 배경
    ctx.fillStyle = BLOCKS[block.type]?.color || "#9E9E9E";
    ctx.fillRect(block.x, block.y, block.width, block.height);

    // 블록 테두리
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(block.x, block.y, block.width, block.height);

    // 블록 내용
    if (block.content) {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        block.content,
        block.x + block.width / 2,
        block.y + block.height / 2
      );
    }
  });

  // 공 (그림자와 하이라이트 추가)
  game.balls.forEach((ball) => {
    // 공 그림자
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // 공 메인
    const ballGradient = ctx.createRadialGradient(
      ball.x - ball.radius / 3,
      ball.y - ball.radius / 3,
      0,
      ball.x,
      ball.y,
      ball.radius
    );
    ballGradient.addColorStop(0, "#ff8c5a");
    ballGradient.addColorStop(1, "#ff6b35");

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // 공 하이라이트
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(
      ball.x - ball.radius / 3,
      ball.y - ball.radius / 3,
      ball.radius / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  // 패들 (그라디언트와 그림자 추가)
  const paddle = game.paddle;

  // 패들 그림자
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(paddle.x + 2, paddle.y + 2, paddle.width, paddle.height);

  // 패들 메인
  const paddleGradient = ctx.createLinearGradient(
    0,
    paddle.y,
    0,
    paddle.y + paddle.height
  );
  paddleGradient.addColorStop(0, "#4CAF50");
  paddleGradient.addColorStop(1, "#2E7D32");

  ctx.fillStyle = paddleGradient;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // 패들 테두리
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // 도구 이름
  ctx.font = "12px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    game.selectedTool,
    paddle.x + paddle.width / 2,
    paddle.y + paddle.height / 2
  );
}

// ===========================================
// UI 업데이트
// ===========================================

function updateGameInfo() {
  $(".level-display").text("LEVEL 1");
  $(".score-display").text(`SCORE: ${game.score}`);
  $("#michelin-count").text(game.michelinStars);
  $("#side-effect").text(
    game.selectedSide === "black" ? "흑 (크기↑)" : "백 (개수↑)"
  );
  $("#selected-tool").text(game.selectedTool);
  $("#selected-difficulty").text(game.selectedDifficulty);
}

function updateTimer() {
  if (game.isPaused || !game.isPlaying) return;

  game.timeLeft--;
  $("#game-timer").text(game.timeLeft);

  if (game.timeLeft <= 0) {
    endGame(false);
  }
}

function updateIngredientsDisplay() {
  const $required = $("#ingredients-required");
  const $collected = $("#ingredients-collected");

  $required.empty();
  $collected.empty();

  game.requiredIngredients.forEach((ingredient) => {
    $required.append(`<span class="ingredient-item">${ingredient}</span>`);
  });

  game.collectedIngredients.forEach((ingredient) => {
    $collected.append(
      `<span class="ingredient-item collected">${ingredient}</span>`
    );
  });
}

// ===========================================
// 컨트롤
// ===========================================

function setupControls() {
  // 마우스 컨트롤
  $(document).on("mousemove", "#game-canvas", function (e) {
    if (!game.isPlaying || game.isPaused) return;

    const rect = game.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const maxX = game.canvas.width - game.paddle.width;
    game.paddle.x = Math.max(0, Math.min(maxX, mouseX - game.paddle.width / 2));
  });

  // 일시정지
  $(document).on("click", "#pause-btn", togglePause);
  $(document).on("click", "#continue-btn", togglePause);

  // 홈으로
  $(document).on("click", "#home-btn", () => endGame(false, true));

  // 다시시작
  $(document).on("click", "#restart-btn", restartGame);

  // ESC 키
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && game.isPlaying) {
      togglePause();
    }
  });
}

function togglePause() {
  game.isPaused = !game.isPaused;

  if (game.isPaused) {
    $("#game-overlay").show();
    $("#pause-btn").text("▶️");
  } else {
    $("#game-overlay").hide();
    $("#pause-btn").text("⏸️");
  }
}

function restartGame() {
  resetGame();
  game.isPaused = false;
  $("#game-overlay").hide();
  $("#pause-btn").text("⏸️");
}

// ===========================================
// 게임 종료
// ===========================================

function endGame(success, goHome = false) {
  game.isPlaying = false;

  // 타이머 정리
  if (game.gameTimer) clearInterval(game.gameTimer);
  if (game.blockTimer) clearInterval(game.blockTimer);
  if (game.animationFrame) cancelAnimationFrame(game.animationFrame);

  if (goHome) {
    if (typeof switchToScreen === "function") {
      switchToScreen("main", 500);
    }
    return;
  }

  // 결과 화면으로
  if (success) {
    if (typeof switchToScreen === "function") {
      switchToScreen("success", 500);
    }
  } else {
    if (typeof switchToScreen === "function") {
      switchToScreen("failure", 500);
    }
  }
}
