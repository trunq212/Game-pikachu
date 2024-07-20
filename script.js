var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var levels = [
    { pairs: 6, countdownDuration: 120 }, // Level 1
    { pairs: 9, countdownDuration: 200 }, // Level 2
    { pairs: 15, countdownDuration: 300 }, // Level 3
];
var levelIndex = 0;
var startTime;
var countdownInterval = null;
var firstCard = null;
var secondCard = null;
var pairsFound = 0;
var score = 0;
var globalScore = 0;
var isPaused = false;
var remainingTimeAtPause = 0;
document.addEventListener("DOMContentLoaded", function () {
    var startButton = document.getElementById("start-button");
    var playerNameInput = document.getElementById("player-name");
    var errorMessage = document.getElementById("error-message");
    startButton === null || startButton === void 0 ? void 0 : startButton.addEventListener("click", function () {
        var playerName = playerNameInput.value.trim();
        if (playerName.length >= 6) {
            localStorage.setItem("playerName", playerName);
            window.location.href = 'game.html'; // Chuyển sang trang game
        }
        else {
            if (errorMessage) {
                errorMessage.style.display = "block";
                errorMessage.textContent = "Tên người chơi phải có ít nhất 6 ký tự.";
            }
        }
    });
    // If on game page, initialize the game
    if (window.location.pathname.endsWith('game.html')) {
        var pauseButton = document.getElementById("pause-button");
        var overlay = document.getElementById("overlay");
        var resetButton = document.getElementById("reset-button");
        if (pauseButton)
            pauseButton.addEventListener("click", function () {
                if (!isPaused) {
                    pauseGame();
                }
                else {
                    resumeGame();
                }
            });
        if (resetButton)
            resetButton.addEventListener("click", resetGame);
        // Load player name
        var playerNameDisplay = document.getElementById("player-name-display");
        var playerName = localStorage.getItem("playerName");
        if (playerNameDisplay && playerName) {
            playerNameDisplay.textContent = "Player name: " + playerName;
        }
        else if (playerNameDisplay) {
            playerNameDisplay.textContent = "Player: Unknown";
        }
        // Start the game
        createBoard();
    }
});
function shuffle(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
    return array;
}
function startCountdown(duration) {
    startTime = Date.now();
    updateTimer(duration);
    countdownInterval = setInterval(function () { return updateTimer(duration); }, 1000);
}
function updateTimer(duration) {
    var elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    var remainingTime = duration - elapsedTime;
    if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        alert("Hết giờ!");
        resetGame();
    }
    else {
        var minutes = Math.floor(remainingTime / 60);
        var seconds = remainingTime % 60;
        var timerDisplay = document.getElementById("timer-display");
        if (timerDisplay) {
            timerDisplay.textContent = "Time left: ".concat(minutes, ":").concat(seconds < 10 ? "0" : "").concat(seconds);
        }
    }
}
function createBoard() {
    return __awaiter(this, void 0, void 0, function () {
        var pairs, images, imagePairs, shuffledPairs, tilesContainer, i, tile, levelDisplay;
        return __generator(this, function (_a) {
            pairs = levels[levelIndex].pairs;
            images = Array.from({ length: pairs }, function (_, i) { return (i + 1).toString(); });
            imagePairs = __spreadArray(__spreadArray([], images, true), images, true);
            shuffledPairs = shuffle(imagePairs);
            tilesContainer = document.getElementById("tiles-container");
            if (!tilesContainer)
                return [2 /*return*/];
            tilesContainer.innerHTML = ""; // Clear the game board before creating a new one
            score = 0; // Reset score when creating a new board
            for (i = 0; i < shuffledPairs.length; i++) {
                tile = document.createElement("div");
                tile.classList.add("tile");
                tile.dataset.index = shuffledPairs[i];
                // Add default image initially
                tile.style.backgroundImage = "url(https://st.quantrimang.com/photos/image/2016/08/11/Pokemon-Go-Fastball.jpg)";
                // Add click event to tile
                tile.addEventListener("click", handleTileClick);
                tilesContainer.appendChild(tile);
            }
            startCountdown(levels[levelIndex].countdownDuration); // Start countdown with current level time
            levelDisplay = document.getElementById("level-display");
            if (levelDisplay) {
                levelDisplay.textContent = "Level ".concat(levelIndex + 1);
            }
            return [2 /*return*/];
        });
    });
}
function handleTileClick(event) {
    var clickedTile = event.target;
    if (!firstCard) {
        firstCard = clickedTile;
        firstCard.classList.add("flipped");
        showImage(firstCard);
    }
    else if (!secondCard && clickedTile !== firstCard) {
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
                clearInterval(countdownInterval); // Stop countdown
                if (levelIndex < levels.length - 1) {
                    levelIndex++; // Increase level if not the last level
                    alert("Ho\u00E0n th\u00E0nh m\u00E0n ".concat(levelIndex + 1, "!"));
                    resetGame(); // Reset game for new level
                }
                else {
                    alert("Xin chúc mừng! Bạn đã hoàn thành tất cả các màn!");
                    resetGame(); // Reset game if all levels are completed
                }
            }
        }
        else {
            // Not a match
            setTimeout(function () {
                firstCard === null || firstCard === void 0 ? void 0 : firstCard.classList.remove("flipped");
                secondCard === null || secondCard === void 0 ? void 0 : secondCard.classList.remove("flipped");
                hideImage(firstCard);
                hideImage(secondCard);
                firstCard = null;
                secondCard = null;
            }, 500);
        }
    }
}
function hideMatchedPair() {
    if (firstCard && secondCard) {
        firstCard.style.visibility = "hidden";
        secondCard.style.visibility = "hidden";
    }
    firstCard = null;
    secondCard = null;
}
function showImage(card) {
    if (card) {
        var index = card.dataset.index;
        if (index) {
            var imageUrl = "https://pokeapi.co/api/v2/pokemon/".concat(index);
            fetch(imageUrl)
                .then(function (response) {
                if (!response.ok) {
                    throw new Error("Không thể tải dữ liệu");
                }
                return response.json();
            })
                .then(function (pokemonData) {
                var imageUrl = pokemonData.sprites.front_default;
                card.style.backgroundImage = "url(".concat(imageUrl, ")");
            })
                .catch(function (error) {
                console.error("Lỗi khi tải dữ liệu Pokémon:", error);
            });
        }
    }
}
function hideImage(card) {
    if (card) {
        card.style.backgroundImage = "url(https://st.quantrimang.com/photos/image/2016/08/11/Pokemon-Go-Fastball.jpg)";
    }
}
function resetGame() {
    clearInterval(countdownInterval); // Stop countdown
    pairsFound = 0;
    score = 0; // Reset score
    updateScore();
    firstCard = null;
    secondCard = null;
    createBoard(); // Create new game board
}
function updateScore() {
    var scoreDisplay = document.getElementById("score-display");
    if (scoreDisplay) {
        scoreDisplay.textContent = "Score: ".concat(globalScore);
    }
}
function resetScore() {
    globalScore = 0;
    updateScore();
}
function pauseGame() {
    if (!isPaused) {
        isPaused = true;
        clearInterval(countdownInterval); // Stop countdown
        var overlay = document.getElementById("overlay");
        if (overlay) {
            overlay.style.display = "flex"; // Show overlay
        }
        remainingTimeAtPause = Math.floor((Date.now() - startTime) / 1000);
    }
}
function resumeGame() {
    if (isPaused) {
        isPaused = false;
        startCountdown(levels[levelIndex].countdownDuration - remainingTimeAtPause); // Resume countdown
        var overlay = document.getElementById("overlay");
        if (overlay) {
            overlay.style.display = "none"; // Hide overlay
        }
    }
}
