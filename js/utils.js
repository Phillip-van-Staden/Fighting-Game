function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  );
}

function determinWinner({ player, enemy, timerId }) {
  clearTimeout(timerId);

  const retryMenu = document.querySelector("#retryMenu");
  const winnerText = document.querySelector("#winnerText");
  const displayText = document.querySelector("#displayText");

  // Show immediate on-screen result (centered text)
  displayText.style.display = "flex";
  if (player.health === enemy.health) {
    displayText.innerHTML = "Tie";
    winnerText.innerHTML = "Tie";
  } else if (player.health > enemy.health) {
    displayText.innerHTML = "Player 1 Wins!";
    winnerText.innerHTML = "Player 1 Wins!";
  } else {
    displayText.innerHTML = "Player 2 Wins!";
    winnerText.innerHTML = "Player 2 Wins!";
  }

  // mark game over (useful to disable input/AI)
  window.gameOver = true;

  // After 3 seconds, hide the big center text and show retry menu
  setTimeout(() => {
    displayText.style.display = "none";
    retryMenu.style.display = "flex";
  }, 3000);
}

let timer = 45; //45
let timerId;
function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  }
  if (timer === 0) {
    determinWinner({ player, enemy, timerId });
  }
}
