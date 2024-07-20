interface PokemonData {
  sprites: {
      front_default: string;
  };
}

interface Level {
  pairs: number;
  countdownDuration: number;
}

const levels: Level[] = [
  { pairs: 6, countdownDuration: 120 }, // Level 1
  { pairs: 9, countdownDuration: 200 }, // Level 2
  { pairs: 15, countdownDuration: 300 }, // Level 3
];

let levelIndex: number = 0;
let startTime: number;
let countdownInterval: NodeJS.Timeout | null = null;
let firstCard: HTMLElement | null = null;
let secondCard: HTMLElement | null = null;
let pairsFound: number = 0;
let score: number = 0;
let globalScore: number = 0;
let isPaused: boolean = false;
let remainingTimeAtPause: number = 0;

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const playerNameInput = document.getElementById("player-name") as HTMLInputElement;
  const errorMessage = document.getElementById("error-message");

  startButton?.addEventListener("click", () => {
      const playerName = playerNameInput.value.trim();
      if (playerName.length >= 6) {
          localStorage.setItem("playerName", playerName);
          window.location.href = 'game.html'; // Chuyển sang trang game
      } else {
          if (errorMessage) {
              errorMessage.style.display = "block";
              errorMessage.textContent = "Tên người chơi phải có ít nhất 6 ký tự.";
          }
      }
  });

  // If on game page, initialize the game
  if (window.location.pathname.endsWith('game.html')) {
      const pauseButton = document.getElementById("pause-button");
      const overlay = document.getElementById("overlay");
      const resetButton = document.getElementById("reset-button");

      if (pauseButton) pauseButton.addEventListener("click", () => {
          if (!isPaused) {
              pauseGame();
          } else {
              resumeGame();
          }
      });

      if (resetButton) resetButton.addEventListener("click", resetGame);

      // Load player name
      const playerNameDisplay = document.getElementById("player-name-display");
      const playerName = localStorage.getItem("playerName");

      if (playerNameDisplay && playerName) {
          playerNameDisplay.textContent = "Player name: " + playerName;
      } else if (playerNameDisplay) {
          playerNameDisplay.textContent = "Player: Unknown";
      }

      // Start the game
      createBoard();
  }
});

function shuffle(array: string[]): string[] {
  for (let i: number = array.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startCountdown(duration: number): void {
  startTime = Date.now();
  updateTimer(duration);
  countdownInterval = setInterval(() => updateTimer(duration), 1000);
}

function updateTimer(duration: number): void {
  const elapsedTime: number = Math.floor((Date.now() - startTime) / 1000);
  const remainingTime: number = duration - elapsedTime;

  if (remainingTime <= 0) {
      clearInterval(countdownInterval!);
      alert("Hết giờ!");
      resetGame();
  } else {
      const minutes: number = Math.floor(remainingTime / 60);
      const seconds: number = remainingTime % 60;
      const timerDisplay: HTMLElement | null =
          document.getElementById("timer-display");

      if (timerDisplay) {
          timerDisplay.textContent = `Time left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      }
  }
}

async function createBoard(): Promise<void> {
  const pairs: number = levels[levelIndex].pairs;
  const images: string[] = Array.from({ length: pairs }, (_, i) => (i + 1).toString());
  const imagePairs: string[] = [...images, ...images];
  const shuffledPairs: string[] = shuffle(imagePairs);
  const tilesContainer: HTMLElement | null = document.getElementById("tiles-container");

  if (!tilesContainer) return;

  tilesContainer.innerHTML = ""; // Clear the game board before creating a new one
  score = 0; // Reset score when creating a new board

  for (let i = 0; i < shuffledPairs.length; i++) {
      const tile: HTMLDivElement = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.index = shuffledPairs[i];

      // Add default image initially
      tile.style.backgroundImage = `url(https://st.quantrimang.com/photos/image/2016/08/11/Pokemon-Go-Fastball.jpg)`;

      // Add click event to tile
      tile.addEventListener("click", handleTileClick);

      tilesContainer.appendChild(tile);
  }

  startCountdown(levels[levelIndex].countdownDuration); // Start countdown with current level time

  // Update current level display
  const levelDisplay: HTMLElement | null = document.getElementById("level-display");
  if (levelDisplay) {
      levelDisplay.textContent = `Level ${levelIndex + 1}`;
  }
}

function handleTileClick(event: Event): void {
  const clickedTile: HTMLElement = event.target as HTMLElement;

  if (!firstCard) {
      firstCard = clickedTile;
      firstCard.classList.add("flipped");
      showImage(firstCard);
  } else if (!secondCard && clickedTile !== firstCard) {
      secondCard = clickedTile;
      secondCard.classList.add("flipped");
      showImage(secondCard);

      // Check for match
      if (firstCard.dataset.index === secondCard.dataset.index) {
          pairsFound++;
          hideMatchedPair();
          firstCard = null;
          secondCard = null;
          globalScore += 10; // Increase global score for a match
          updateScore();

          if (pairsFound === levels[levelIndex].pairs) {
              // All pairs found, move to next level
              clearInterval(countdownInterval!); // Stop countdown
              if (levelIndex < levels.length - 1) {
                  levelIndex++; // Increase level if not the last level
                  alert(`Hoàn thành màn ${levelIndex + 1}!`);
                  resetGame(); // Reset game for new level
              } else {
                  alert("Xin chúc mừng! Bạn đã hoàn thành tất cả các màn!");
                  resetGame(); // Reset game if all levels are completed
              }
          }
      } else {
          // Not a match
          setTimeout(() => {
              firstCard?.classList.remove("flipped");
              secondCard?.classList.remove("flipped");
              hideImage(firstCard);
              hideImage(secondCard);
              firstCard = null;
              secondCard = null;
          }, 500);
      }
  }
}

function hideMatchedPair(): void {
  if (firstCard && secondCard) {
      firstCard.style.visibility = "hidden";
      secondCard.style.visibility = "hidden";
  }
  firstCard = null;
  secondCard = null;
}

function showImage(card: HTMLElement | null): void {
  if (card) {
      const index = card.dataset.index;
      if (index) {
          const imageUrl = `https://pokeapi.co/api/v2/pokemon/${index}`;
          fetch(imageUrl)
              .then((response) => {
                  if (!response.ok) {
                      throw new Error("Không thể tải dữ liệu");
                  }
                  return response.json();
              })
              .then((pokemonData: PokemonData) => {
                  const imageUrl: string = pokemonData.sprites.front_default;
                  card.style.backgroundImage = `url(${imageUrl})`;
              })
              .catch((error) => {
                  console.error("Lỗi khi tải dữ liệu Pokémon:", error);
              });
      }
  }
}

function hideImage(card: HTMLElement | null): void {
  if (card) {
      card.style.backgroundImage = `url(https://st.quantrimang.com/photos/image/2016/08/11/Pokemon-Go-Fastball.jpg)`;
  }
}

function resetGame(): void {
  clearInterval(countdownInterval!); // Stop countdown
  pairsFound = 0;
  score = 0; // Reset score
  updateScore();
  firstCard = null;
  secondCard = null;
  createBoard(); // Create new game board
}

function updateScore(): void {
  const scoreDisplay: HTMLElement | null = document.getElementById("score-display");
  if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${globalScore}`;
  }
}

function resetScore(): void {
  globalScore = 0;
  updateScore();
}

function pauseGame(): void {
  if (!isPaused) {
      isPaused = true;
      clearInterval(countdownInterval!); // Stop countdown
      const overlay: HTMLElement | null = document.getElementById("overlay");
      if (overlay) {
          overlay.style.display = "flex"; // Show overlay
      }
      remainingTimeAtPause = Math.floor((Date.now() - startTime) / 1000);
  }
}

function resumeGame(): void {
  if (isPaused) {
      isPaused = false;
      startCountdown(levels[levelIndex].countdownDuration - remainingTimeAtPause); // Resume countdown
      const overlay: HTMLElement | null = document.getElementById("overlay");
      if (overlay) {
          overlay.style.display = "none"; // Hide overlay
      }
  }
}
