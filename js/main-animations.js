// 메인 화면 애니메이션 효과들
$(document).ready(function () {
  // 페이지 로드 시 애니메이션 시작
  initMainAnimations();
});

function initMainAnimations() {
  // 떨어지는 요리 재료 생성
  createFallingIngredients();

  // 불꽃 파티클 생성
  createFireParticles();

  // 셰프 모자 생성
  createChefHats();

  // 버튼 호버 효과 추가
  addButtonEffects();
}

// 떨어지는 요리 재료 생성
function createFallingIngredients() {
  const ingredients = [
    "🥕",
    "🧅",
    "🥩",
    "🍅",
    "🥔",
    "🌽",
    "🥒",
    "🍆",
    "🥬",
    "🧄",
  ];

  setInterval(() => {
    if ($("#main").is(":visible")) {
      const ingredient =
        ingredients[Math.floor(Math.random() * ingredients.length)];
      const $fallingItem = $('<div class="falling-ingredients"></div>');
      $fallingItem.text(ingredient);
      $fallingItem.css({
        left: Math.random() * 100 + "%",
        animationDuration: Math.random() * 3 + 4 + "s",
        animationDelay: Math.random() * 2 + "s",
      });

      $("#main").append($fallingItem);

      // 애니메이션 완료 후 제거
      setTimeout(() => {
        $fallingItem.remove();
      }, 8000);
    }
  }, 1500);
}

// 불꽃 파티클 생성
function createFireParticles() {
  setInterval(() => {
    if ($("#main").is(":visible")) {
      for (let i = 0; i < 3; i++) {
        const $particle = $('<div class="fire-particle"></div>');
        $particle.css({
          left: Math.random() * 100 + "%",
          bottom: "20px",
          animationDelay: Math.random() * 2 + "s",
          animationDuration: Math.random() * 2 + 2 + "s",
        });

        $("#main").append($particle);

        setTimeout(() => {
          $particle.remove();
        }, 4000);
      }
    }
  }, 800);
}

// 셰프 모자 생성
function createChefHats() {
  const hats = ["👨‍🍳", "👩‍🍳", "🧑‍🍳"];

  for (let i = 0; i < 2; i++) {
    const $hat = $('<div class="chef-hat"></div>');
    $hat.text(hats[i % hats.length]);
    $hat.css({
      top: Math.random() * 30 + 10 + "%",
      left: Math.random() * 80 + 10 + "%",
      animationDelay: Math.random() * 4 + "s",
    });

    $("#main").append($hat);
  }
}

// 버튼 효과 추가
function addButtonEffects() {
  // 게임시작 버튼에 특별한 효과
  $("#start-game-btn").hover(
    function () {
      $(this).html("🔥 게임시작 🔥");
    },
    function () {
      $(this).html("게임시작");
    }
  );

  // 옵션 버튼에 특별한 효과
  $("#options-btn").hover(
    function () {
      $(this).html("⚙️ 옵션 ⚙️");
    },
    function () {
      $(this).html("옵션");
    }
  );

  // 클릭 시 파티클 효과
  $(".main-btn").click(function (e) {
    createClickParticles(e);
  });
}

// 클릭 시 파티클 생성
function createClickParticles(event) {
  const colors = ["#ff6b35", "#f7931e", "#ffaa4d", "#ff8c42"];

  for (let i = 0; i < 8; i++) {
    const $particle = $("<div></div>");
    $particle.css({
      position: "absolute",
      width: "6px",
      height: "6px",
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      borderRadius: "50%",
      left: event.pageX + "px",
      top: event.pageY + "px",
      pointerEvents: "none",
      zIndex: 1000,
    });

    $("body").append($particle);

    // 파티클 애니메이션
    $particle.animate(
      {
        left: event.pageX + (Math.random() - 0.5) * 100 + "px",
        top: event.pageY + (Math.random() - 0.5) * 100 + "px",
        opacity: 0,
      },
      1000,
      function () {
        $(this).remove();
      }
    );
  }
}

// 타이틀 변경 함수
function updateTitle() {
  const titles = [
    { main: '"셰프의 대결"', sub: "미식왕을 향한 도전" },
    { main: '"요리왕 전설"', sub: "최고의 셰프가 되어라" },
    { main: '"맛의 마법사"', sub: "요리로 승부하라" },
  ];

  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  $(".main-title").text(randomTitle.main);
  $(".main-subtitle").text(randomTitle.sub);
}

// 배경 음악과 함께 시작되는 환영 효과
function welcomeEffect() {
  // 화면 전체에 반짝이는 효과
  const $welcome = $("<div></div>");
  $welcome.css({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
    zIndex: 10,
    pointerEvents: "none",
    animation: "pulse 2s ease-in-out",
  });

  $("body").append($welcome);

  setTimeout(() => {
    $welcome.remove();
  }, 2000);
}
