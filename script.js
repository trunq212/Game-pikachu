"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
const levels = [
    { pairs: 5, countdownDuration: 120 }, // Màn 1
    { pairs: 10, countdownDuration: 180 }, // Màn 2
];
let levelIndex = 0;
let startTime;
let countdownInterval = null;
let firstCard = null;
let secondCard = null;
let pairsFound = 0;
let score = 0;
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function startCountdown(duration) {
    startTime = Date.now();
    updateTimer(duration);
    countdownInterval = setInterval(() => updateTimer(duration), 1000);
}
function updateTimer(duration) {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const remainingTime = duration - elapsedTime;
    if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        alert('Hết giờ!');
        resetGame();
    }
    else {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }
}
function createBoard() {
    return __awaiter(this, void 0, void 0, function* () {
        const pairs = levels[levelIndex].pairs;
        const images = Array.from({ length: pairs }, (_, i) => (i + 1).toString());
        const imagePairs = [...images, ...images];
        const shuffledPairs = shuffle(imagePairs);
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer)
            return;
        gameContainer.innerHTML = ''; // Xóa bảng trò chơi trước khi tạo lại
        score = 0; // Reset điểm khi tạo lại bảng
        for (let i = 0; i < shuffledPairs.length; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.index = shuffledPairs[i];
            // Thêm ảnh màu trắng ban đầu
            tile.style.backgroundImage = `url(https://static.vecteezy.com/system/resources/thumbnails/022/004/951/small_2x/ultra-ball-icon-pokemon-free-vector.jpg)`;
            // Thêm sự kiện click vào ô để hiển thị ảnh
            tile.addEventListener('click', handleTileClick);
            gameContainer.appendChild(tile);
        }
        startCountdown(levels[levelIndex].countdownDuration); // Bắt đầu đếm ngược với thời gian của cấp độ hiện tại
    });
}
function handleTileClick(event) {
    const clickedTile = event.target;
    if (!firstCard) {
        firstCard = clickedTile;
        firstCard.classList.add('flipped');
        showImage(firstCard);
    }
    else if (!secondCard && clickedTile !== firstCard) {
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
                clearInterval(countdownInterval); // Dừng đếm ngược
                if (levelIndex < levels.length - 1) {
                    levelIndex++; // Tăng cấp độ nếu chưa phải cấp độ cuối cùng
                    alert(`Hoàn thành màn ${levelIndex + 1}!`);
                    resetGame(); // Reset game với màn mới
                }
                else {
                    alert('Xin chúc mừng! Bạn đã hoàn thành tất cả các màn!');
                    resetGame(); // Reset game nếu đã hoàn thành tất cả các màn
                }
            }
        }
        else {
            // Không phải cặp
            updateScore();
            setTimeout(() => {
                firstCard === null || firstCard === void 0 ? void 0 : firstCard.classList.remove('flipped');
                secondCard === null || secondCard === void 0 ? void 0 : secondCard.classList.remove('flipped');
                hideImage(firstCard);
                hideImage(secondCard);
                firstCard = null;
                secondCard = null;
            }, 500);
        }
    }
}
function hideMatchedPair() {
    // Ẩn hai ô đã chọn đúng
    firstCard === null || firstCard === void 0 ? void 0 : firstCard.remove();
    secondCard === null || secondCard === void 0 ? void 0 : secondCard.remove();
    firstCard = null;
    secondCard = null;
}
function showImage(card) {
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
                .then((pokemonData) => {
                const imageUrl = pokemonData.sprites.front_default;
                card.style.backgroundImage = `url(${imageUrl})`;
            })
                .catch(error => {
                console.error('Lỗi khi tải dữ liệu Pokémon:', error);
            });
        }
    }
}
function hideImage(card) {
    if (card) {
        card.style.backgroundImage = `url(https://static.vecteezy.com/system/resources/thumbnails/022/004/951/small_2x/ultra-ball-icon-pokemon-free-vector.jpg)`;
    }
}
function resetGame() {
    clearInterval(countdownInterval); // Dừng đếm ngược
    pairsFound = 0;
    score = 0; // Reset điểm khi reset game
    updateScore();
    firstCard = null;
    secondCard = null;
    createBoard(); // Tạo lại bảng trò chơi với màn mới
}
function updateScore() {
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Điểm: ${score}`;
    }
}
window.addEventListener('DOMContentLoaded', () => {
    createBoard(); // Bắt đầu trò chơi với màn đầu tiên
    const gameContainer = document.getElementById('game-container');
    if (gameContainer)
        gameContainer.addEventListener('click', handleTileClick);
    const resetButton = document.getElementById('reset-button');
    if (resetButton)
        resetButton.addEventListener('click', resetGame);
});
(_a = document.getElementById('start-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    const playerNameInput = document.getElementById('player-name');
    const playerName = playerNameInput ? playerNameInput.value.trim() : '';
    if (playerName !== '') {
        localStorage.setItem('playerName', playerName);
        window.location.href = './game.html'; // Chuyển hướng đến trang game.html
    }
    else {
        alert('Vui lòng nhập tên của bạn!');
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const playerNameDisplay = document.getElementById('player-name-display');
    const playerName = localStorage.getItem('playerName');
    if (playerNameDisplay && playerName) {
        playerNameDisplay.textContent = 'Người chơi: ' + playerName;
    }
    else {
        if (playerNameDisplay)
            playerNameDisplay.textContent = 'Người chơi: Không xác định';
    }
});
// Decorator để đảm bảo độ dài tối thiểu của tên người chơi
function validatePlayerNameLength(minLength) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const playerNameInput = document.getElementById("player-name");
            const playerName = playerNameInput ? playerNameInput.value.trim() : "";
            if (playerName.length >= minLength) {
                return originalMethod.apply(this, args); // Thực thi phương thức gốc
            }
            else {
                const errorMessageElement = document.getElementById("error-message");
                if (errorMessageElement) {
                    errorMessageElement.innerText = `Tên người chơi phải có ít nhất ${minLength} ký tự.`;
                    errorMessageElement.style.display = "block";
                }
                else {
                    alert(`Tên người chơi phải có ít nhất ${minLength} ký tự.`);
                }
                return false; // Trả về false khi xác thực không thành công
            }
        };
        return descriptor;
    };
}
// Hàm xử lý kiểm tra tên người chơi
function validatePlayerName(event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của sự kiện "click"
    const playerNameInput = document.getElementById("player-name");
    const playerName = playerNameInput ? playerNameInput.value.trim() : "";
    if (playerName !== "") {
        localStorage.setItem("playerName", playerName);
        window.location.href = "./game.html"; // Chuyển tiếp sang trang game
    }
    else {
        const errorMessageElement = document.getElementById("error-message");
        if (errorMessageElement) {
            errorMessageElement.innerText = "Vui lòng nhập tên của bạn!";
            errorMessageElement.style.display = "block";
        }
        else {
            alert("Vui lòng nhập tên của bạn!");
        }
    }
}
class PlayerNameValidator {
    static validate(event) {
        validatePlayerName(event);
    }
}
__decorate([
    validatePlayerNameLength(7),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MouseEvent]),
    __metadata("design:returntype", void 0)
], PlayerNameValidator, "validate", null);
// Gán hàm đã được trang trí cho sự kiện click của nút "Start"
(_b = document.getElementById("start-button")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (event) => {
    event.preventDefault(); // Ngăn chặn hành động mặc định của sự kiện "click"
    // Thực hiện xác thực tên người chơi
    PlayerNameValidator.validate(event);
});
