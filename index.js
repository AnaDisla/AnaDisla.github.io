const heroes = [
    '1.png', '1.png', 
    '2.png', '2.png', 
    '3.png', '3.png', 
    '4.png', '4.png', 
    '5.png', '5.png', 
    '6.png', '6.png', 
    '7.png', '7.png', 
    '8.png', '8.png'
];
let shuffledHeroes;
let firstCard, secondCard;
let lockBoard = false;
let flips = 0;
let timeLeft;
let timer;
let isPaused = false;
let bestTime = localStorage.getItem('bestTime') || '--';
let currentLevel;
let intervalShuffle;
document.getElementById('bestTime').textContent = bestTime;

function startGame(level) {
    currentLevel = level;
    document.getElementById('startModal').classList.remove('show');
    setGameLevel(level);
    resetGame();
    startTimer();
}

function setGameLevel(level) {
    if (level === 'easy') {
        shuffledHeroes = heroes.slice(0, 8);
        timeLeft = 40;
        startTimer()
    } else if (level === 'medium') {
        shuffledHeroes = heroes.slice(0, 12);
        timeLeft = 60;
        startTimer()
    } else if (level === 'hard') {
        shuffledHeroes = heroes.slice(0, 16);
        timeLeft = 45;
        startShuffleInterval(10000);
        startTimer()
    } else if (level === 'impossible') {
        shuffledHeroes = heroes.slice(0, 18);
        let extraCards = heroes.slice(0, 2).map(card => [card, card]).flat();
        shuffledHeroes = shuffledHeroes.concat(extraCards);
        timeLeft = 80;
        startTimer()
        startShuffleInterval(20000, true);
    }
}

function startShuffleInterval(interval, keepMatched = false) {
    clearInterval(intervalShuffle);
    intervalShuffle = setInterval(() => {
        shuffleCards(keepMatched);
    }, interval);
}

function shuffleCards(keepMatched) {
    const gameBoard = document.getElementById('gameBoard');
    let cards = Array.from(gameBoard.children);
    let matchedCards = [];
    let unmatchedCards = [];
    
    cards.forEach((card, index) => {
        if (card.classList.contains('matched')) {
            matchedCards[index] = card;
        } else {
            unmatchedCards.push(card);
        }
    });
    
    unmatchedCards.sort(() => 0.5 - Math.random());
    let newBoard = [];
    let unmatchedIndex = 0;
    for (let i = 0; i < cards.length; i++) {
        if (matchedCards[i]) {
            newBoard.push(matchedCards[i]);
        } else {
            newBoard.push(unmatchedCards[unmatchedIndex++]);
        }
    }
    
    gameBoard.innerHTML = '';
    newBoard.forEach(card => gameBoard.appendChild(card));
}

function createBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    shuffledHeroes.forEach((hero, index) => {
        let card = document.createElement('div');
        card.classList.add('card', 'hidden');
        card.dataset.hero = hero;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function startTimer() {
    clearInterval(timer);
    document.getElementById('timer').textContent = `Tiempo: ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Tiempo: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            showLoseModal();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function flipCard() {
    if (lockBoard || this.classList.contains('matched')) return;
    if (this === firstCard) return;
    const img = document.createElement('img');
    img.src = this.dataset.hero;
    img.classList.add('card-image');
    this.appendChild(img);
    this.classList.remove('hidden');
    flips++;
    document.getElementById('flips').textContent = `Flips: ${flips}`;
    if (!firstCard) {
        firstCard = this;
        return;
    }
    secondCard = this;
    lockBoard = true;
    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.dataset.hero === secondCard.dataset.hero;
    isMatch ? disableCards() : unflipCards();
    if (document.querySelectorAll('.matched').length === shuffledHeroes.length) {
        clearInterval(timer);
        showWinModal();
    }
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    setTimeout(() => {
        firstCard.innerHTML = '';
        secondCard.innerHTML = '';
        firstCard.classList.add('hidden');
        secondCard.classList.add('hidden');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modal').classList.add('show');
    closePauseModal();
}

function resetGame() {
    closeEndModal();
    clearInterval(timer);
    clearInterval(intervalShuffle);
    flips = 0;
    closePauseModal();
    setGameLevel(currentLevel);
    document.getElementById('flips').textContent = `Flips: ${flips}`;
    shuffledHeroes = shuffledHeroes.sort(() => 0.5 - Math.random());
    createBoard();
    document.getElementById('modal').classList.remove('show');
    startTimer();
    closeEndModal();
}

// Elementos del modal
let pauseModal = document.getElementById('pauseModal');
let resumeBtn = document.getElementById('resumeBtn');
let replayBtn = document.getElementById('replayBtn');
let backToStartBtn = document.getElementById('backToStartBtn');


function pauseGame() {
    clearInterval(timer);
    document.querySelector('.modal-pause-wrapper').style.display = 'flex'; // Muestra el fondo con el blur
    document.querySelector('.modal-pause').style.display = 'flex'; // Muestra el contenido del modal
}

function closePauseModal() {
   
    document.querySelector('.modal-pause-wrapper').style.display = 'none'; // Oculta el fondo
    document.querySelector('.modal-pause').style.display = 'none'; // Oculta el contenido del modal
}


resumeBtn.addEventListener('click', () => {
    startTimer(); 
    startShuffleInterval(30000, true); 
    pauseModal.style.display = 'none'; 
    closePauseModal()
});


resumeBtn.addEventListener('click', () => {
    startTimer();
    startShuffleInterval(30000, true); 
    pauseModal.style.display = 'none'; 
    closePauseModal();
});

replayBtn.addEventListener('click', () => {
    resetGame(); 
    pauseModal.style.display = 'none'; 
    closePauseModal()
});

backToStartBtn.addEventListener('click', () => {
    document.getElementById('startModal').classList.add('show'); // Mostrar el modal de inicio
    pauseModal.style.display = 'none'; 
});


document.getElementById('pauseButton').addEventListener('click', pauseGame);

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    if (level) {
        startGame(level);
    }
    const bestTime = localStorage.getItem('bestTime') || '--';
    document.getElementById('bestTime').textContent = bestTime;
});


function showWinModal() {
    clearInterval(timer);
    document.getElementById('endMessage').textContent = '¡Ganaste!';
    document.getElementById('endModal').classList.add('show');

    if (currentLevel === 'impossible') {
        const bestTime = localStorage.getItem('bestTime');
        if (!bestTime || timeLeft > parseInt(bestTime)) {
            localStorage.setItem('bestTime', timeLeft);
            document.getElementById('bestTime').textContent = timeLeft;
        }
    }
}
function showLoseModal() {
    clearInterval(timer);
    document.getElementById('endMessage').textContent = '¡Tiempo agotado!';
    document.getElementById('endModal').classList.add('show');
}

