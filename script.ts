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
  { pairs: 5, countdownDuration: 120 }, // Màn 1
  { pairs: 10, countdownDuration: 180 }, // Màn 2
];


let levelIndex: number = 0;
let startTime: number;
let countdownInterval: NodeJS.Timeout | null = null;

let firstCard: HTMLElement | null = null;
let secondCard: HTMLElement | null = null;
let pairsFound: number = 0;
let score: number = 0;

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
      alert('Hết giờ!');
      resetGame();
  } else {
      const minutes: number = Math.floor(remainingTime / 60);
      const seconds: number = remainingTime % 60;
      const timerDisplay: HTMLElement | null = document.getElementById('timer-display');

      if (timerDisplay) {
          timerDisplay.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
  }
}

async function createBoard(): Promise<void> {
  const pairs: number = levels[levelIndex].pairs;
  const images: string[] = Array.from({ length: pairs }, (_, i) => (i + 1).toString());
  const imagePairs: string[] = [...images, ...images];
  const shuffledPairs: string[] = shuffle(imagePairs);
  const gameContainer: HTMLElement | null = document.getElementById('game-container');

  if (!gameContainer) return;

  gameContainer.innerHTML = ''; // Xóa bảng trò chơi trước khi tạo lại
  score = 0; // Reset điểm khi tạo lại bảng

  for (let i = 0; i < shuffledPairs.length; i++) {
      const tile: HTMLDivElement = document.createElement('div');
      tile.classList.add('tile');
      tile.dataset.index = shuffledPairs[i];
      
      // Thêm ảnh màu trắng ban đầu
      tile.style.backgroundImage = `url(https://static.vecteezy.com/system/resources/thumbnails/022/004/951/small_2x/ultra-ball-icon-pokemon-free-vector.jpg)`;

      // Thêm sự kiện click vào ô để hiển thị ảnh
      tile.addEventListener('click', handleTileClick);

      gameContainer.appendChild(tile);
  }

  startCountdown(levels[levelIndex].countdownDuration); // Bắt đầu đếm ngược với thời gian của cấp độ hiện tại
}

function handleTileClick(event: Event): void {
  const clickedTile: HTMLElement = event.target as HTMLElement;

  if (!firstCard) {
      firstCard = clickedTile;
      firstCard.classList.add('flipped');
      showImage(firstCard);
  } else if (!secondCard && clickedTile !== firstCard) {
      secondCard = clickedTile;
      secondCard.classList.add('flipped');
      showImage(secondCard);

      const firstIndex = firstCard.dataset.index;
      const secondIndex = secondCard.dataset.index;

      if (firstIndex && secondIndex && firstIndex === secondIndex) {
          // Tìm thấy một cặp
          pairsFound++;
          score += 10; // Cộng điểm nếu chọn đúng
          updateScore();
          
          // Ẩn hai ô đã chọn đúng
          setTimeout(() => {
              hideMatchedPair();
          }, 500);

          if (pairsFound === levels[levelIndex].pairs) {
              // Tất cả các cặp được tìm thấy, chuyển sang cấp độ tiếp theo
              clearInterval(countdownInterval!); // Dừng đếm ngược
              if (levelIndex < levels.length - 1) {
                  levelIndex++; // Tăng cấp độ nếu chưa phải cấp độ cuối cùng
                  alert(`Hoàn thành màn ${levelIndex + 1}!`);
                  resetGame(); // Reset game với màn mới
              } else {
                  alert('Xin chúc mừng! Bạn đã hoàn thành tất cả các màn!');
                  resetGame(); // Reset game nếu đã hoàn thành tất cả các màn
              }
          }
      } else {
          // Không phải cặp
          updateScore();
          setTimeout(() => {
              firstCard?.classList.remove('flipped');
              secondCard?.classList.remove('flipped');
              hideImage(firstCard);
              hideImage(secondCard);
              firstCard = null;
              secondCard = null;
          }, 500);
      }
  }
}

function hideMatchedPair(): void {
  // Ẩn hai ô đã chọn đúng
  firstCard?.remove();
  secondCard?.remove();
  firstCard = null;
  secondCard = null;
}


function showImage(card: HTMLElement | null): void {
  if (card) {
      const index = card.dataset.index;
      if (index) {
          const imageUrl = `https://pokeapi.co/api/v2/pokemon/${index}`;
          fetch(imageUrl)
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Không thể tải dữ liệu');
                  }
                  return response.json();
              })
              .then((pokemonData: PokemonData) => {
                  const imageUrl: string = pokemonData.sprites.front_default;
                  card.style.backgroundImage = `url(${imageUrl})`;
              })
              .catch(error => {
                  console.error('Lỗi khi tải dữ liệu Pokémon:', error);
              });
      }
  }
}

function hideImage(card: HTMLElement | null): void {
  if (card) {
      card.style.backgroundImage = `url(https://static.vecteezy.com/system/resources/thumbnails/022/004/951/small_2x/ultra-ball-icon-pokemon-free-vector.jpg)`;
  }
}

function resetGame(): void {
  clearInterval(countdownInterval!); // Dừng đếm ngược
  pairsFound = 0;
  score = 0; // Reset điểm khi reset game
  updateScore();
  firstCard = null;
  secondCard = null;
  createBoard(); // Tạo lại bảng trò chơi với màn mới
}

function updateScore(): void {
  const scoreDisplay: HTMLElement | null = document.getElementById('score-display');
  if (scoreDisplay) {
      scoreDisplay.textContent = `Điểm: ${score}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  createBoard(); // Bắt đầu trò chơi với màn đầu tiên
  const gameContainer: HTMLElement | null = document.getElementById('game-container');
  if (gameContainer) gameContainer.addEventListener('click', handleTileClick);

  const resetButton: HTMLElement | null = document.getElementById('reset-button');
  if (resetButton) resetButton.addEventListener('click', resetGame);
});

document.getElementById('start-button')?.addEventListener('click', () => {
  const playerNameInput: HTMLInputElement | null = document.getElementById('player-name') as HTMLInputElement;
  const playerName: string = playerNameInput ? playerNameInput.value.trim() : '';
  if (playerName !== '') {
      localStorage.setItem('playerName', playerName);
      window.location.href = './game.html'; // Chuyển hướng đến trang game.html
  } else {
      alert('Vui lòng nhập tên của bạn!');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const playerNameDisplay: HTMLElement | null = document.getElementById('player-name-display');
  const playerName: string | null = localStorage.getItem('playerName');

  if (playerNameDisplay && playerName) {
      playerNameDisplay.textContent = 'Người chơi: ' + playerName;
  } else {
      if (playerNameDisplay) playerNameDisplay.textContent = 'Người chơi: Không xác định';
  }
});
// Decorator để đảm bảo độ dài tối thiểu của tên người chơi
function validatePlayerNameLength(minLength: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]): any {
      const playerNameInput: HTMLInputElement | null = document.getElementById("player-name") as HTMLInputElement;
      const playerName: string = playerNameInput ? playerNameInput.value.trim() : "";

      if (playerName.length >= minLength) {
        return originalMethod.apply(this, args); // Thực thi phương thức gốc
      } else {
        const errorMessageElement = document.getElementById("error-message");
        if (errorMessageElement) {
          errorMessageElement.innerText = `Tên người chơi phải có ít nhất ${minLength} ký tự.`;
          errorMessageElement.style.display = "block";
        } else {
          alert(`Tên người chơi phải có ít nhất ${minLength} ký tự.`);
        }
        return false; // Trả về false khi xác thực không thành công
      }
    };

    return descriptor;
  };
}

// Hàm xử lý kiểm tra tên người chơi
function validatePlayerName(event: MouseEvent): void {
  event.preventDefault(); // Ngăn chặn hành động mặc định của sự kiện "click"

  const playerNameInput: HTMLInputElement | null = document.getElementById("player-name") as HTMLInputElement;
  const playerName: string = playerNameInput ? playerNameInput.value.trim() : "";

  if (playerName !== "") {
    localStorage.setItem("playerName", playerName);
    window.location.href = "./game.html"; // Chuyển tiếp sang trang game
  } else {
    const errorMessageElement = document.getElementById("error-message");
    if (errorMessageElement) {
      errorMessageElement.innerText = "Vui lòng nhập tên của bạn!";
      errorMessageElement.style.display = "block";
    } else {
      alert("Vui lòng nhập tên của bạn!");
    }
  }
}

class PlayerNameValidator {
  @validatePlayerNameLength(7)
  static validate(event: MouseEvent): void {
    validatePlayerName(event);
  }
}


// Gán hàm đã được trang trí cho sự kiện click của nút "Start"
document.getElementById("start-button")?.addEventListener("click", (event: MouseEvent) => {
  event.preventDefault(); // Ngăn chặn hành động mặc định của sự kiện "click"
  
  // Thực hiện xác thực tên người chơi
  PlayerNameValidator.validate(event);
});

