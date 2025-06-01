// 메인 화면 애니메이션 효과들 - 설정 시스템 연동
$(document).ready(function () {
  // 페이지 로드 시 애니메이션 시작
  initMainAnimations();
});

function initMainAnimations() {
  // 타이핑 효과 시작
  startTypingEffect();

  // 떨어지는 요리 재료 생성
  createFallingIngredients();

  // 강화된 불꽃 파티클 생성
  createEnhancedFireParticles();

  // 셰프 모자 생성
  createChefHats();

  // 버튼 호버 효과 추가
  addButtonEffects();

  // 마우스 효과 추가
  addMouseEffects();
}

// 1. 타이핑 효과 - 한글자씩 + 삭제 + 다른 제목
function startTypingEffect() {
  const titles = [
    '"셰프의 대결"',
    '"미식왕 전설"',
    '"요리의 마법사"',
    '"맛의 정복자"',
    '"부엌의 황제"',
  ];

  let currentTitleIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  const typeSpeed = 150;
  const deleteSpeed = 100;
  const pauseTime = 2000;

  function typeTitle() {
    const currentTitle = titles[currentTitleIndex];
    const $titleElement = $(".main-title");

    if (!isDeleting) {
      // 타이핑 중
      if (currentCharIndex < currentTitle.length) {
        const displayText = currentTitle.substring(0, currentCharIndex + 1);
        $titleElement.html(
          displayText + '<span class="typing-cursor">|</span>'
        );
        currentCharIndex++;
        setTimeout(typeTitle, typeSpeed);
      } else {
        // 타이핑 완료, 잠시 대기 후 삭제 시작
        setTimeout(() => {
          isDeleting = true;
          typeTitle();
        }, pauseTime);
      }
    } else {
      // 삭제 중
      if (currentCharIndex > 0) {
        const displayText = currentTitle.substring(0, currentCharIndex - 1);
        $titleElement.html(
          displayText + '<span class="typing-cursor">|</span>'
        );
        currentCharIndex--;
        setTimeout(typeTitle, deleteSpeed);
      } else {
        // 삭제 완료, 다음 제목으로
        isDeleting = false;
        currentTitleIndex = (currentTitleIndex + 1) % titles.length;
        setTimeout(typeTitle, 500);
      }
    }
  }

  // 시작
  setTimeout(typeTitle, 1000);
}

// 2. 강화된 불꽃 파티클 생성 (설정 연동)
function createEnhancedFireParticles() {
  const particleTypes = ["small", "medium", "large"];

  // 지속적인 작은 불꽃들
  setInterval(() => {
    if ($("#main").is(":visible") && !window.particlesDisabled) {
      for (let i = 0; i < 5; i++) {
        const type =
          particleTypes[Math.floor(Math.random() * particleTypes.length)];
        const $particle = $(`<div class="fire-particle ${type}"></div>`);

        $particle.css({
          left: Math.random() * 100 + "%",
          bottom: "0px",
          animationDelay: Math.random() * 1 + "s",
          animationDuration: Math.random() * 2 + 2 + "s",
        });

        $("#main").append($particle);

        setTimeout(() => {
          $particle.remove();
        }, 4000);
      }
    }
  }, 300);

  // 큰 불꽃 폭발 효과
  setInterval(() => {
    if ($("#main").is(":visible") && !window.particlesDisabled) {
      const $explosion = $('<div class="fire-explosion"></div>');
      $explosion.css({
        left: Math.random() * 100 + "%",
        bottom: "20px",
      });

      $("#main").append($explosion);

      // 폭발과 함께 작은 파티클들 생성
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const $miniParticle = $('<div class="fire-particle small"></div>');
          $miniParticle.css({
            left: $explosion.css("left"),
            bottom: "20px",
            animationDuration: "1s",
          });
          $("#main").append($miniParticle);

          setTimeout(() => {
            $miniParticle.remove();
          }, 1000);
        }, i * 50);
      }

      setTimeout(() => {
        $explosion.remove();
      }, 1500);
    }
  }, 3000);
}

// 3. 마우스 효과 추가 (설정 연동)
function addMouseEffects() {
  let mouseX = 0;
  let mouseY = 0;

  // 마우스 위치 추적
  $("#main").mousemove(function (e) {
    mouseX = e.pageX;
    mouseY = e.pageY;

    // 파티클이 활성화된 경우에만 효과 생성
    if (!window.particlesDisabled) {
      // 마우스 트레일 생성
      createMouseTrail(mouseX, mouseY);

      // 마우스 파티클 생성 (확률적으로)
      if (Math.random() < 0.3) {
        createMouseParticle(mouseX, mouseY);
      }
    }
  });

  // 마우스 클릭 시 특별한 효과
  $("#main").click(function (e) {
    if (!window.particlesDisabled) {
      createMouseClickEffect(e.pageX, e.pageY);
    }
  });
}

function createMouseTrail(x, y) {
  const $trail = $('<div class="mouse-trail"></div>');
  $trail.css({
    left: x - 10 + "px",
    top: y - 10 + "px",
  });

  $("body").append($trail);

  setTimeout(() => {
    $trail.remove();
  }, 1000);
}

function createMouseParticle(x, y) {
  const $particle = $('<div class="mouse-particle"></div>');
  $particle.css({
    left: x + (Math.random() - 0.5) * 20 + "px",
    top: y + (Math.random() - 0.5) * 20 + "px",
  });

  $("body").append($particle);

  setTimeout(() => {
    $particle.remove();
  }, 2000);
}

function createMouseClickEffect(x, y) {
  // 클릭 시 큰 불꽃 효과
  const $clickFire = $('<div class="fire-explosion"></div>');
  $clickFire.css({
    left: x - 15 + "px",
    top: y - 15 + "px",
  });

  $("body").append($clickFire);

  // 주변에 작은 파티클들 생성
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const particleX = x + Math.cos(angle) * distance;
    const particleY = y + Math.sin(angle) * distance;

    const $particle = $('<div class="mouse-particle"></div>');
    $particle.css({
      left: particleX + "px",
      top: particleY + "px",
      background: ["#ff4500", "#ff6b35", "#ffa500", "#ffff00"][
        Math.floor(Math.random() * 4)
      ],
    });

    $("body").append($particle);

    setTimeout(() => {
      $particle.remove();
    }, 2000);
  }

  setTimeout(() => {
    $clickFire.remove();
  }, 1500);
}

// 떨어지는 요리 재료 생성 (설정 연동)
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
    if ($("#main").is(":visible") && !window.particlesDisabled) {
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

      setTimeout(() => {
        $fallingItem.remove();
      }, 8000);
    }
  }, 1500);
}

// 셰프 모자 생성 (설정 연동)
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
  $("#start-game-btn").hover(
    function () {
      $(this).html("🔥 게임시작 🔥");
    },
    function () {
      $(this).html("게임시작");
    }
  );

  $("#options-btn").hover(
    function () {
      $(this).html("⚙️ 옵션 ⚙️");
    },
    function () {
      $(this).html("옵션");
    }
  );

  $(".main-btn").click(function (e) {
    createClickParticles(e);
  });
}

// 클릭 시 파티클 생성 (설정 연동)
function createClickParticles(event) {
  if (window.particlesDisabled) return; // 파티클이 비활성화된 경우 실행하지 않음

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
