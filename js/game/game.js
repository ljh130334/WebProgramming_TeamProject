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
  currentStage: 1,

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

// 단계별 요리 시스템
const STAGE_RECIPES = {
  1: {
    Easy: {
      name: "햄버거",
      emoji: "🍔",
      ingredients: ["🍞", "🥩", "🧀", "🥬", "🍅"],
      time: 90,
      description: "간단하고 맛있는 햄버거 만들기",
    },
    Normal: {
      name: "피자",
      emoji: "🍕",
      ingredients: ["🫓", "🧀", "🍅", "🫒", "🌶️", "🧅"],
      time: 75,
      description: "정통 이탈리안 피자 만들기",
    },
    Hard: {
      name: "비빔밥",
      emoji: "🍚",
      ingredients: ["🍚", "🥕", "🥬", "🥩", "🥒", "🍄", "🥚"],
      time: 60,
      description: "한국 전통 비빔밥 만들기",
    },
  },
  2: {
    Easy: {
      name: "스파게티",
      emoji: "🍝",
      ingredients: ["🍝", "🍅", "🧄", "🧅", "🧀", "🌿"],
      time: 85,
      description: "이탈리아 전통 스파게티",
    },
    Normal: {
      name: "스테이크",
      emoji: "🥩",
      ingredients: ["🥩", "🧈", "🧄", "🌿", "🧂", "🍄", "🥔"],
      time: 70,
      description: "완벽한 스테이크 요리",
    },
    Hard: {
      name: "초밥",
      emoji: "🍣",
      ingredients: ["🍚", "🐟", "🦐", "🥒", "🥑", "🍋", "🌊", "🍃"],
      time: 55,
      description: "정교한 일본 초밥 만들기",
    },
  },
  3: {
    Easy: {
      name: "타코",
      emoji: "🌮",
      ingredients: ["🌮", "🥩", "🧀", "🥬", "🍅", "🌶️", "🧅"],
      time: 80,
      description: "멕시코 전통 타코",
    },
    Normal: {
      name: "라멘",
      emoji: "🍜",
      ingredients: ["🍜", "🥩", "🥚", "🧅", "🌿", "🌶️", "🧄", "🍄"],
      time: 65,
      description: "진짜 일본 라멘",
    },
    Hard: {
      name: "프렌치 코스",
      emoji: "🥘",
      ingredients: ["🦆", "🧈", "🍷", "🌿", "🧄", "🍄", "🥕", "🧅", "🍋"],
      time: 50,
      description: "고급 프렌치 코스 요리",
    },
  },
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
  game.currentStage = parseInt(sessionStorage.getItem("currentStage") || "1");

  console.log("현재 단계:", game.currentStage);

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
  // 현재 단계와 난이도의 요리 정보 가져오기
  const currentRecipe =
    STAGE_RECIPES[game.currentStage]?.[game.selectedDifficulty];

  if (!currentRecipe) {
    console.error(
      "유효하지 않은 단계/난이도:",
      game.currentStage,
      game.selectedDifficulty
    );
    return;
  }

  // 단계 정보 저장
  sessionStorage.setItem("currentStage", game.currentStage.toString());
  sessionStorage.setItem("completedRecipe", currentRecipe.name);
  sessionStorage.setItem("recipeEmoji", currentRecipe.emoji);

  // 시간 설정 (단계가 높아질수록 더 어려워짐)
  const stageTimeReduction = (game.currentStage - 1) * 5;
  game.timeLeft = Math.max(currentRecipe.time - stageTimeReduction, 30);

  // 재료 설정
  game.requiredIngredients = [...currentRecipe.ingredients];
  game.collectedIngredients = [];
  game.michelinStars = 0;
  game.score = 0;

  // 패들 위치 초기화 (선택된 도구에 따라 크기 조정)
  const toolSizes = {
    Wok: { width: 100, height: 15 },
    Knife: { width: 80, height: 12 },
    "Gold Pan": { width: 120, height: 18 },
    "Gold Turner": { width: 90, height: 15 },
  };

  const toolSize = toolSizes[game.selectedTool] || toolSizes["Wok"];
  game.paddle.width = toolSize.width;
  game.paddle.height = toolSize.height;
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
  updateRecipeDisplay();
}

function updateRecipeDisplay() {
  const currentRecipe =
    STAGE_RECIPES[game.currentStage]?.[game.selectedDifficulty];

  if (!currentRecipe) return;

  // 난이도 표시 텍스트
  const difficultyText = {
    Easy: "쉬움",
    Normal: "보통",
    Hard: "어려움",
  };

  // 레벨 표시 업데이트 (단계 정보 포함)
  $(".level-display").html(
    `${game.currentStage}단계 - ${currentRecipe.emoji} ${currentRecipe.name} (${
      difficultyText[game.selectedDifficulty]
    })`
  );

  // 사이드바 헤더 업데이트
  $("#ingredients-required")
    .parent()
    .find("h3")
    .first()
    .html(`🎯 ${game.currentStage}단계 ${currentRecipe.name} 재료`);
}

// ===========================================
// 블록 생성
// ===========================================

function generateBlocks() {
  game.blocks = [];
  const currentRecipe =
    STAGE_RECIPES[game.currentStage]?.[game.selectedDifficulty];

  if (!currentRecipe) return;

  // 단계별 추가 재료
  const extraIngredientSets = {
    1: ["🥓", "🥖", "🌮", "🥙", "🌭", "🍖"],
    2: ["🦐", "🐟", "🦀", "🍷", "🍺", "🥜"],
    3: ["🦆", "🦌", "🍾", "🧈", "🧂", "🌿", "🍯", "🫐"],
  };

  const extraIngredients =
    extraIngredientSets[game.currentStage] || extraIngredientSets[1];
  const allIngredients = [...currentRecipe.ingredients, ...extraIngredients];

  // 단계가 높을수록 더 많은 블록 생성
  const rowCount = Math.min(3 + Math.floor(game.currentStage / 2), 5);
  const colCount = 8;

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const x = col * 75 + 10;
      const y = row * 30 + 50;

      const rand = Math.random();
      let type,
        content = "";

      // 단계가 높을수록 미슐랭 스타와 폭탄이 더 자주 등장
      const stageMultiplier = game.currentStage * 0.1;

      if (rand < 0.5) {
        // 재료 블록 (필요한 재료가 더 자주 나오도록)
        type = "INGREDIENT";
        if (Math.random() < 0.7) {
          // 70% 확률로 필요한 재료
          content =
            currentRecipe.ingredients[
              Math.floor(Math.random() * currentRecipe.ingredients.length)
            ];
        } else {
          // 30% 확률로 다른 재료
          content =
            allIngredients[Math.floor(Math.random() * allIngredients.length)];
        }
      } else if (rand < 0.7 + stageMultiplier) {
        type = "NORMAL";
      } else if (rand < 0.85 + stageMultiplier) {
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
  const currentRecipe =
    STAGE_RECIPES[game.currentStage]?.[game.selectedDifficulty];
  if (!currentRecipe) return;

  const extraIngredientSets = {
    1: ["🥓", "🥖", "🌮", "🥙", "🌭", "🍖"],
    2: ["🦐", "🐟", "🦀", "🍷", "🍺", "🥜"],
    3: ["🦆", "🦌", "🍾", "🧈", "🧂", "🌿", "🍯", "🫐"],
  };

  const extraIngredients =
    extraIngredientSets[game.currentStage] || extraIngredientSets[1];
  const allIngredients = [...currentRecipe.ingredients, ...extraIngredients];

  for (let col = 0; col < 8; col++) {
    if (Math.random() < 0.6) {
      const x = col * 75 + 10;
      const rand = Math.random();
      let type,
        content = "";

      const stageMultiplier = game.currentStage * 0.1;

      if (rand < 0.6) {
        type = "INGREDIENT";
        if (Math.random() < 0.8) {
          // 필요한 재료가 더 자주 나오도록
          content =
            currentRecipe.ingredients[
              Math.floor(Math.random() * currentRecipe.ingredients.length)
            ];
        } else {
          content =
            allIngredients[Math.floor(Math.random() * allIngredients.length)];
        }
      } else if (rand < 0.8 + stageMultiplier) {
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

      // 선택된 도구에 따른 특수 효과
      if (game.selectedTool === "Gold Turner") {
        // 황금 뒤집개: 공 속도 증가
        ball.dx *= 1.2;
        ball.dy *= 1.1;
      }
    }

    // 아래로 떨어짐
    if (ball.y > game.canvas.height + ball.radius) {
      if (game.selectedSide === "black") {
        // 흑 선택: 공이 사라지면 게임 오버
        game.balls.splice(index, 1);
        if (game.balls.length === 0) {
          endGame(false);
        }
      } else {
        // 백 선택: 공이 떨어져도 게임 오버
        endGame(false);
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
  let basePoints = BLOCKS[block.type]?.points || 5;

  // 단계별 점수 보너스
  const stageBonus = game.currentStage * 5;

  // 선택된 도구에 따른 점수 보너스
  let toolBonus = 1;
  if (game.selectedTool === "Gold Pan") {
    toolBonus = 1.5; // 황금 팬: 1.5배 점수
  } else if (game.selectedTool === "Gold Turner") {
    toolBonus = 2; // 황금 뒤집개: 2배 점수
  }

  game.score += Math.floor((basePoints + stageBonus) * toolBonus);

  switch (block.type) {
    case "INGREDIENT":
      if (game.requiredIngredients.includes(block.content)) {
        const index = game.requiredIngredients.indexOf(block.content);
        game.requiredIngredients.splice(index, 1);
        game.collectedIngredients.push(block.content);
        updateIngredientsDisplay();

        // 황금 뒤집개 특수 능력: 자동 콤보
        if (game.selectedTool === "Gold Turner") {
          createComboEffect();
        }
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
      // 주변 블록 파괴 (단계가 높을수록 더 넓은 범위)
      const explosionRange = 80 + game.currentStage * 20;
      game.blocks.forEach((otherBlock) => {
        const distance = Math.sqrt(
          Math.pow(block.x - otherBlock.x, 2) +
            Math.pow(block.y - otherBlock.y, 2)
        );
        if (distance < explosionRange && !otherBlock.destroyed) {
          otherBlock.destroyed = true;
          // 폭탄으로 파괴된 블록도 점수 획득
          game.score += Math.floor(5 * toolBonus);
        }
      });
      break;
  }

  updateGameInfo();
}

// 콤보 효과 표시
function createComboEffect() {
  const $combo = $('<div class="combo-effect">COMBO!</div>');
  $("#game-canvas").parent().append($combo);

  setTimeout(() => {
    $combo.remove();
  }, 2000);
}

// ===========================================
// 렌더링
// ===========================================

function drawGame() {
  const ctx = game.ctx;

  // 배경 그라디언트 (단계별 색상 변화)
  const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
  const stageColors = {
    1: { start: "#1a1a2e", end: "#16213e" },
    2: { start: "#2e1a1a", end: "#3e1621" },
    3: { start: "#1a2e1a", end: "#162138" },
  };

  const colors = stageColors[game.currentStage] || stageColors[1];
  gradient.addColorStop(0, colors.start);
  gradient.addColorStop(1, colors.end);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  // 요리 표시 (캔버스 상단)
  const currentRecipe =
    STAGE_RECIPES[game.currentStage]?.[game.selectedDifficulty];
  if (currentRecipe) {
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      `${game.currentStage}단계: ${currentRecipe.emoji} ${currentRecipe.name} 만들기`,
      game.canvas.width / 2,
      10
    );

    // 재료 개수 표시
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(
      `남은 재료: ${game.requiredIngredients.length}/${currentRecipe.ingredients.length}`,
      game.canvas.width / 2,
      35
    );
  }

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

    // 공 메인 (도구별 색상)
    const ballGradient = ctx.createRadialGradient(
      ball.x - ball.radius / 3,
      ball.y - ball.radius / 3,
      0,
      ball.x,
      ball.y,
      ball.radius
    );

    // 선택된 도구에 따른 공 색상
    const toolColors = {
      Wok: { start: "#ff8c5a", end: "#ff6b35" },
      Knife: { start: "#c0c0c0", end: "#a0a0a0" },
      "Gold Pan": { start: "#ffd700", end: "#ffb300" },
      "Gold Turner": { start: "#ffd700", end: "#ff8c00" },
    };

    const colors = toolColors[game.selectedTool] || toolColors["Wok"];
    ballGradient.addColorStop(0, colors.start);
    ballGradient.addColorStop(1, colors.end);

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

  // 패들 메인 (선택된 도구에 따른 색상)
  const paddleGradient = ctx.createLinearGradient(
    0,
    paddle.y,
    0,
    paddle.y + paddle.height
  );

  const paddleColors = {
    Wok: { start: "#FF9800", end: "#E65100" },
    Knife: { start: "#CFD8DC", end: "#90A4AE" },
    "Gold Pan": { start: "#FFD700", end: "#FFA000" },
    "Gold Turner": { start: "#FFD700", end: "#FF8F00" },
  };

  const pColors = paddleColors[game.selectedTool] || paddleColors["Wok"];
  paddleGradient.addColorStop(0, pColors.start);
  paddleGradient.addColorStop(1, pColors.end);

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
  updateRecipeDisplay();
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

  // 결과 정보 저장
  const currentRecipe =
    STAGE_RECIPES[game.currentStage]?.[game.selectedDifficulty];
  if (currentRecipe) {
    sessionStorage.setItem("completedRecipe", currentRecipe.name);
    sessionStorage.setItem("recipeEmoji", currentRecipe.emoji);
  }
  sessionStorage.setItem("gameDifficulty", game.selectedDifficulty);
  sessionStorage.setItem("currentStage", game.currentStage.toString());

  if (success) {
    sessionStorage.setItem("gameResult", "success");
    if (typeof switchToScreen === "function") {
      switchToScreen("success", 500);
    }
  } else {
    sessionStorage.setItem("gameResult", "failure");
    if (typeof switchToScreen === "function") {
      switchToScreen("failure", 500);
    }
  }
}
