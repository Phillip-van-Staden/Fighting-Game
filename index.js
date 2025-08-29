const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024; //innerWidth;
canvas.height = 576; //innerHeight;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});
const shop = new Sprite({
  position: {
    x: 600,
    y: 128,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 215,
    y: 157,
  },
  imageSrc: "./img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    attack2: {
      imageSrc: "./img/samuraiMack/Attack2.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 215,
    y: 167,
  },
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      framesMax: 4,
    },
    attack2: {
      imageSrc: "./img/kenji/Attack2.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: 170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

// start enemy facing left so it initially looks toward player on the right
enemy.facing = "left";

console.log(player);
const keys = {
  a: { pressed: false },
  d: { pressed: false },
  w: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowUp: { pressed: false },
};

// Pause game until start pressed
let gameRunning = false;

// small guard for game end
window.gameOver = false;

const startBtn = document.querySelector("#startBtn");
const retryBtn = document.querySelector("#retryBtn");

startBtn.addEventListener("click", () => {
  document.querySelector("#startMenu").style.display = "none";
  gameRunning = true;
  // reset timer display and start countdown
  timer = 45;
  document.querySelector("#timer").innerHTML = timer;
  decreaseTimer();
});

retryBtn.addEventListener("click", () => {
  window.location.reload(); // restart entire game
});

function animate() {
  window.requestAnimationFrame(animate);
  if (!gameRunning) return;
  if (window.gameOver) return; // freeze animation loop if game is over

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgba(255, 255, 255, 0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement
  if (player.lastkey === "a" && keys.a.pressed) {
    player.velocity.x = -3;
    player.switchSprite("run");
    player.facing = "left";
  } else if (player.lastkey === "d" && keys.d.pressed) {
    player.velocity.x = 3;
    player.switchSprite("run");
    player.facing = "right";
  } else {
    player.switchSprite("idle");
  }
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  //enemy movement & AI
  if (!enemy.dead) {
    if (!enemy.aiState) enemy.aiState = "idle";
    if (!enemy.stateTimer) enemy.stateTimer = 0;
    if (!enemy.lastDecision) enemy.lastDecision = Date.now();
    if (!enemy.lastDamageTaken) enemy.lastDamageTaken = 0;

    const distanceX = player.position.x - enemy.position.x;
    const distanceY = player.position.y - enemy.position.y;
    const absDistanceX = Math.abs(distanceX);
    const now = Date.now();

    // Always face the player
    enemy.facingRight = distanceX >= 0;

    // Decision making every 500ms
    if (now - enemy.lastDecision > 500) {
      enemy.lastDecision = now;

      if (enemy.lastDamageTaken > 0 && now - enemy.lastDamageTaken > 4000) {
        enemy.aiState = "retreat";
        enemy.stateTimer = 500;
      } else if (player.health < 25 && absDistanceX < 300) {
        enemy.aiState = "charge";
        enemy.stateTimer = 2000;
      } else if (
        Math.abs(player.health - enemy.health) < 20 &&
        absDistanceX < 150
      ) {
        const r = Math.random();
        if (r < 0.15) enemy.aiState = "retreat";
        else if (r < 0.3) enemy.aiState = "jump";
        else enemy.aiState = "attack";
        enemy.stateTimer = 1500;
      } else if (absDistanceX < 100) {
        if (absDistanceX < 50) enemy.aiState = "space";
        else enemy.aiState = "attack";
        enemy.stateTimer = 1500;
      } else if (absDistanceX < 400) {
        enemy.aiState = "chase";
        enemy.stateTimer = 1500;
      } else {
        enemy.aiState = "patrol";
        enemy.stateTimer = 2000;
      }
    }

    switch (enemy.aiState) {
      case "attack":
      case "attack":
        enemy.velocity.x = 0;
        enemy.switchSprite("idle");
        if (Math.random() < 0.05) enemy.attack();
        break;
      case "patrol":
        if (!enemy.patrolDir || Math.random() < 0.01)
          enemy.patrolDir = Math.random() > 0.5 ? 1 : -1;
        enemy.velocity.x = 1.5 * enemy.patrolDir;
        enemy.switchSprite("run");
        break;

      case "chase":
        // Stop at minimum spacing (~50px)
        if (absDistanceX > 50) enemy.velocity.x = distanceX > 0 ? 2.5 : -2.5;
        else enemy.velocity.x = 0;
        enemy.switchSprite(enemy.velocity.x !== 0 ? "run" : "idle");

        // Jump if player is above
        if (distanceY < -60 && Math.random() < 0.05) enemy.velocity.y = -16;
        break;

      case "space":
        // Move to maintain ~50px distance
        if (absDistanceX < 50) enemy.velocity.x = distanceX > 0 ? -2 : 2;
        else if (absDistanceX > 60) enemy.velocity.x = distanceX > 0 ? 2 : -2;
        else enemy.velocity.x = 0;
        enemy.switchSprite(enemy.velocity.x !== 0 ? "run" : "idle");
        break;

      case "retreat":
        enemy.velocity.x = distanceX > 0 ? -3.5 : 3.5;
        enemy.switchSprite("run");
        break;

      case "charge":
        enemy.velocity.x = distanceX > 0 ? 4 : -4;
        enemy.switchSprite("run");
        if (absDistanceX < 100 && Math.random() < 0.15) enemy.attack();
        break;

      case "jump":
        if (enemy.velocity.y === 0) enemy.velocity.y = -16; // jump once
        enemy.velocity.x = distanceX > 0 ? 1.5 : -1.5; // slight movement while jumping
        enemy.switchSprite("jump");
        break;
    }
    // if enemy is on right side of player it should face left else if on left it should face right
    if (enemy.position.x > player.position.x) {
      enemy.facing = "left";
    } else {
      enemy.facing = "right";
    }
    // set facing based on velocity
    if (enemy.velocity.x > 0) enemy.facing = "right";
    else if (enemy.velocity.x < 0) enemy.facing = "left";
    // Vertical animation
    if (enemy.velocity.y < 0) enemy.switchSprite("jump");
    else if (enemy.velocity.y > 0) enemy.switchSprite("fall");
  }

  // Collision detection & enemy gets hit
  function isHitFrame(fighter) {
    if (!fighter.isAttacking) return false;
    let hitFrame;
    if (fighter === enemy) {
      hitFrame = 2;
    } else {
      hitFrame = 4;
    }
    return fighter.frameCurrent === hitFrame;
  }

  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    isHitFrame(player)
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to("#enemyHealth", { width: enemy.health + "%" });
  }

  if (player.isAttacking && isHitFrame(player)) {
    player.isAttacking = false;
  }

  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    isHitFrame(enemy)
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to("#playerHealth", { width: player.health + "%" });
  }

  if (enemy.isAttacking && isHitFrame(enemy)) {
    enemy.isAttacking = false;
  }

  //end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determinWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (window.gameOver) return; // ignore keys after match end

  if (!player.dead) {
    switch (event.key) {
      case "w":
        player.velocity.y = -20;
        break;
      case "d":
        keys.d.pressed = true;
        player.lastkey = "d";
        player.facing = "right";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastkey = "a";
        player.facing = "left";
        break;
      case " ":
        player.attack();
        break;
    }
  }
  if (!enemy.dead) {
    switch (event.key) {
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastkey = "ArrowRight";
        enemy.facing = "right";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastkey = "ArrowLeft";
        enemy.facing = "left";
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }
});
window.addEventListener("keyup", (event) => {
  if (window.gameOver) return;

  switch (event.key) {
    case "w":
      player.velocity.y = 0;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }
  switch (event.key) {
    case "ArrowUp":
      enemy.velocity.y = 0;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
  }
});

/*   MOBILE TOUCH CONTROLS*/

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let dragging = false;
let touchMoved = false;
let attackBtnPressed = false;

// utility to get touch coords relative to canvas
function getTouchPosOnCanvas(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

canvas.addEventListener(
  "touchstart",
  (e) => {
    if (!gameRunning || window.gameOver) return;
    if (player.dead) return;

    // use first touch only
    const touch = e.changedTouches[0];
    const pos = getTouchPosOnCanvas(touch);
    touchStartX = pos.x;
    touchStartY = pos.y;
    touchEndX = touchStartX;
    touchEndY = touchStartY;
    dragging = false;
    touchMoved = false;

    // prevent scrolling while interacting
    e.preventDefault();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    if (!gameRunning || window.gameOver) return;
    if (player.dead) return;

    const touch = e.changedTouches[0];
    const pos = getTouchPosOnCanvas(touch);
    touchEndX = pos.x;
    touchEndY = pos.y;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // treat as moved if over a small threshold
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) touchMoved = true;

    // horizontal drag -> move left/right
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) {
        // drag right
        keys.d.pressed = true;
        keys.a.pressed = false;
        player.lastkey = "d";
        player.facing = "right";
      } else if (dx < -30) {
        // drag left
        keys.a.pressed = true;
        keys.d.pressed = false;
        player.lastkey = "a";
        player.facing = "left";
      }
      dragging = true;
    } else {
      // vertical drag -> jump (drag up)
      if (dy < -40) {
        // move up on canvas (drag up) -> negative dy
        player.velocity.y = -20;
        dragging = true;
      }
    }

    // prevent page scroll
    e.preventDefault();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  (e) => {
    if (!gameRunning || window.gameOver) return;
    if (player.dead) return;

    const touch = e.changedTouches[0];
    // touchEndX / Y already updated in touchmove; if no touchmove occurred, compute now:
    if (!touchMoved) {
      const pos = getTouchPosOnCanvas(touch);
      touchEndX = pos.x;
      touchEndY = pos.y;
    }

    // compute movement
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // If attack button pressed, ignore canvas tap handling
    if (!attackBtnPressed) {
      // tap (small movement) => attack
      if (!dragging && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        player.attack();
      }
    }

    // reset movement keys
    keys.a.pressed = false;
    keys.d.pressed = false;
    dragging = false;
    touchMoved = false;

    // small safety reset for attackBtnPressed
    setTimeout(() => {
      attackBtnPressed = false;
    }, 50);

    // prevent page scroll
    e.preventDefault();
  },
  { passive: false }
);
