// Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyDIcSlBjSKVY-SJmDh_RtRXuuB29LdpRyQ",
  authDomain: "deeper-paths.firebaseapp.com",
  databaseURL: "https://deeper-paths-default-rtdb.firebaseio.com",
  projectId: "deeper-paths",
  storageBucket: "deeper-paths.appspot.com",
  messagingSenderId: "494030260010",
  appId: "1:494030260010:web:29aaf47310af25555b0053",
  measurementId: "G-LC45VYLJ4C"
};

firebase.initializeApp(firebaseConfig);

// Defining constants and giving the cards values
const cards = [
  "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
  "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠",
  "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",
  "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣"
];
let totalScore = 0;
let suitScores = {
  "♥": 0,
  "♠": 0,
  "♦": 0,
  "♣": 0
  };

//*********************PREPARING GAMEBOARD*********************** */
  // Shuffle the cards using the Fisher-Yates algorithm
  function shuffleDeck() {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    }

//Converts Unicode symbol into words
function assignCardSuit(cardElement, card) {
  if (card.includes("♥")) {
    cardElement.classList.add("heart");
  } else if (card.includes("♠")) {
    cardElement.classList.add("spade");
  } else if (card.includes("♦")) {
    cardElement.classList.add("diamond");
  } else if (card.includes("♣")) {
    cardElement.classList.add("club");
  }
}

//Develops scoring mechanism
function assignCardPoints(cardElement, card) {
  let points;
  if (card.startsWith("A")) {
    points = 2;
  } else if (card.startsWith("K") || card.startsWith("Q") || card.startsWith("J") || card.startsWith("10")) {
    points = 1;
  } else {
    points = 0;
  }
  cardElement.dataset.points = points;
}

// Assign each card a value and point value based on scoring system
const cardElements = document.querySelectorAll('.card');
function assignCardValue(cardElement, card) {
  cardElement.dataset.value = card;
  cardElement.classList.add("card-invalid");
  assignCardPoints(cardElement, card);
  assignCardSuit(cardElement, card);
}

//Deals out cards and assigns them values
function dealCards() {
  cards.forEach((card, index) => {
    const cardElement = cardElements[index];
    assignCardValue(cardElement, card);
  });
}

//*********************STARTING GAME*********************** */
// Generate User ID
function generateUserID() {
  const timestamp = Date.now().toString();
  const randomChars = Math.random().toString(36).substring(2, 8);
  return timestamp + randomChars;
}

// Reset GameBoard
function resetGameBoard() {
  // Remove the end game message box if it exists
    const messageBox = document.querySelector('.message-box');
    if (messageBox) {
      messageBox.remove();
    }

  // Reset both the stats and suit scores to 0
  totalScore = 0;
  suitScores = {
    "♥": 0,
    "♠": 0,
    "♦": 0,
    "♣": 0
  };
  exploratoryMoves = 0;
  exploitativeMoves = 0;

  // Reseting card states
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.classList.remove('card-locked', 'card-valid', 'card-flipped'); // Removing all prior classes from the card
    card.classList.add('card-invalid'); // Reseting the card stats to invalid
    card.textContent = ''; // Clearing all card text content
    if (card.classList.contains('card-selected')) { // Showing text content for all cards assigned card-selected classicfication ***CAN CHANGE THIS TO DETERMINE HOW LONG EACH CARD WILL SHOW THIS INFORMATION***
      card.textContent = card.dataset.value; 
    }
  });

  // Validating the cards in row 1
  const row1Cards = document.querySelectorAll('.row[data-row="1"] .card');
  row1Cards.forEach(card => {
    card.classList.remove('card-invalid');
    card.classList.add('card-valid');
  });

  // Updating scoreboard
  updateScoreboard();
}

// Starting game
let currentGame = 0;
let userID;
let dateTime;

function startGame() {
  if (currentGame === 0) {
    shuffleDeck();
    userID = generateUserID();
    dateTime = new Date();

    // Write the date and time the user first loaded the page to the database
    const db = firebase.database();
    db.ref(`users/${userID}/userData/DateTime`).set(dateTime.toString());
  }

  currentGame++;
  dealCards();
  gameStarted = true;
  resetGameBoard();
  lastMoveTime = new Date().getTime(); //Resting move time on start of game
}


//*********************GAME LOGIC AND RULES*********************** */
// STEP 1: Flip card
    let flippedCards = [];

    // Recording move time
    let moves = [];
    let lastMoveTime = new Date().getTime();
 
      // Function for recording move time
      function recordMoveTime(isExploratory) {
        const now = new Date();
        const moveTime = now.getTime() - lastMoveTime;
        lastMoveTime = now.getTime();
      
        // Record move time, type, and move number in an array
        moves.push({
          moveNumber: moves.length + 1,
          time: moveTime,
          type: isExploratory ? 'exploratory' : 'exploitative'
        });
      }

    // Function for measuring exploratory vs. exploitative behavior
      let exploratoryMoves = 0;
      let exploitativeMoves = 0;
      let unexploredCards = (document.querySelectorAll('.card')).length;
      let percentUnexplored = 100;

      function countMoves(cardElement) {
        const cardValue = cardElement.dataset.value;
        const exploitedCards = document.querySelectorAll('.card-selected[data-value="' + cardValue + '"]');
        const allCards = document.querySelectorAll('.card');
      
        // If move is exploratory
        if (exploitedCards.length === 0) {
          exploratoryMoves++;
          unexploredCards--;
          percentUnexplored = (unexploredCards / allCards.length) * 100;
          recordMoveTime(true);
      
        // If move is exploitative
        } else {
          const flippedCardValues = flippedCards.map(card => card.dataset.value);
          if (flippedCardValues.includes(cardValue)) {
            exploitativeMoves++;
            recordMoveTime(false);
          }
        }
      
        flippedCards.push(cardElement);
      }
      
      // Function for flipping the card
      function flipCard(cardElement) {
        cardElement.classList.remove('card-valid');
        cardElement.classList.add('card-flipped');
        cardElement.textContent = cardElement.dataset.value;
      
        countMoves(cardElement);
      }

  // STEP 2: Update the scores
    function updateScores(cardElement) {
      const suit = cardElement.dataset.value.slice(-1);   // Get the suit and points data from the card element
      const points = parseInt(cardElement.dataset.points);

      totalScore += points;   // Update the total score and suit scores objects
      suitScores[suit] += points;

      // Check if points were scored and play sound if so
      if (points > 0) {
        const audio = new Audio('ClinkingCoins.wav');
        audio.play();
      }
    }

  // STEP 3: Update the scoreboard
    function updateScoreboard() {
    // Update total score
    totalScore = Object.values(suitScores).reduce((acc, val) => acc + val, 0);
    document.getElementById("score-box").textContent = `Total score: ${totalScore}`;

    // Update suit scores
    let sortedScores = Object.entries(suitScores).sort((a, b) => b[1] - a[1]); // Sort suitScores object by values in descending order

    const heartScoreElement = document.getElementById("♥-score"); // Get the suit score elements
    const spadeScoreElement = document.getElementById("♠-score");
    const diamondScoreElement = document.getElementById("♦-score");
    const clubScoreElement = document.getElementById("♣-score");

    heartScoreElement.textContent = `Hearts ♥: ${suitScores["♥"]}`;  // Update the scores of the suit score elements
    spadeScoreElement.textContent = `Spades ♠: ${suitScores["♠"]}`;
    diamondScoreElement.textContent = `Diamonds ♦: ${suitScores["♦"]}`;
    clubScoreElement.textContent = `Clubs ♣: ${suitScores["♣"]}`;

    let scoreboard = document.querySelector(".scoreboard");   // Reorder the suit score elements based on the sorted scores
    sortedScores.forEach((suitScore) => {
      let suit = suitScore[0];
      if (suit === "♥") {
        scoreboard.appendChild(heartScoreElement);
      } else if (suit === "♠") {
        scoreboard.appendChild(spadeScoreElement);
      } else if (suit === "♦") {
        scoreboard.appendChild(diamondScoreElement);
      } else if (suit === "♣") {
        scoreboard.appendChild(clubScoreElement);
      }
    });
  }

  // STEP 4: Lock all other cards in the row
    function lockOtherCardsInRow(cardElement) {
      const row = cardElement.closest('.row'); // Get the row that contains the clicked card
      const otherCardsInRow = row.querySelectorAll('.row[data-row="' + row.dataset.row + '"] .card:not(.card-flipped)'); // Get all other cards in the row
    
      otherCardsInRow.forEach(card => {
        card.classList.remove('card-valid');
        card.classList.add('card-locked');
      });
    }

  // STEP 5: Validates cards in the next row
    function unlockCardsInNextRow(cardElement) {
      const row = cardElement.parentElement.dataset.row;
      const nextRow = parseInt(row) + 1;
      let cardIndex = Array.from(cardElement.parentElement.children).indexOf(cardElement);
    
      let cardIndicesToUnlock = [];
    
      if (row === "1") {    
        // For row 1, unlock the next 3 cards
        cardIndicesToUnlock.push(cardIndex * 2 + 1);
        cardIndicesToUnlock.push(cardIndex * 2 + 2);
        cardIndicesToUnlock.push(cardIndex * 2 + 3);
      } else {       
        // For other rows, unlock the two or three cards cards closest to the selected card
        if (cardIndex > 0) {
          cardIndicesToUnlock.push(cardIndex);
          cardIndicesToUnlock.push(cardIndex + 1);
        }
    
        if (cardIndex < cardElement.parentElement.children.length - 1) {
          cardIndicesToUnlock.push(cardIndex + 1);
          cardIndicesToUnlock.push(cardIndex + 2);
        }
      }
    
      cardIndicesToUnlock.forEach(index => {
        const nextRowCard = document.querySelector(`.row[data-row="${nextRow}"] .card:nth-child(${index})`);
        nextRowCard.classList.remove('card-invalid');
        nextRowCard.classList.add('card-valid');
      });
    }
  
//*********************ENDING GAME*********************** */
// Output total score to the scoretracker
let averageTotalScores = 0;
let TotalScoreAcrossGames = 0;

function updateScoreTracker(gameNumber, totalScore) {
  // Calculate running average of total score
  TotalScoreAcrossGames += totalScore;
  averageTotalScores = (TotalScoreAcrossGames / gameNumber);

  // Output total and average total scores on score tracker
  const gameScoreDiv = document.getElementById(`gamescore-${gameNumber}`);
  let output = `Game ${gameNumber}: ${totalScore} (${averageTotalScores.toFixed(1)})`;
  gameScoreDiv.innerHTML = output;
}

// Output suit scores to the suittracker
function updateSuitTracker(gameNumber, suitScores) {
  const suitTrackerDiv = document.getElementById(`suitscore-${gameNumber}`);
  let output = '';
  for (const suit in suitScores) {
    let colorClass = '';
    if (suit === '♥') {
      colorClass = 'heart';
    } else if (suit === '♦') {
      colorClass = 'diamond';
    } else if (suit === '♠') {
      colorClass = 'spade';
    } else if (suit === '♣') {
      colorClass = 'club';
    }
    output += `<span class="${colorClass}">${suit} ${suitScores[suit]}</span>, `;
  }
  suitTrackerDiv.innerHTML = output.slice(0, -2); // Remove trailing comma and space
}

// Show end round message
function showEndRoundMessage(score) {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.innerHTML = `
    <h2>Round Over!</h2>
    <p>Your total score was: ${score}</p>
    <div class="button-container">
      <button onclick="startGame()">Play Again</button>
    </div>
  `;
  document.body.appendChild(messageBox);
}

// Show end round message
function showEndGameMessage() {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.innerHTML = `
    <h2>Game Over!</h2>
    <p>Thank you for playing!</p>
  `;
  document.body.appendChild(messageBox);
}

// Write stats to database
function writeStatsToDatabase(gameNumber) {
  const db = firebase.database();

  db.ref(`users/${userID}/stats/TotalScore_Game${gameNumber}`).set(totalScore); // Write the totalscore for the game to the database
  db.ref(`users/${userID}/stats/AvgTotalScore_Game${gameNumber}`).set(averageTotalScores); // Write the average totalscore for the game to the database
  db.ref(`users/${userID}/stats/Exploration_Game${gameNumber}`).set(exploratoryMoves); // Write the exploration behavior for the game to the database
  db.ref(`users/${userID}/stats/Exploitation_Game${gameNumber}`).set(exploitativeMoves); // Write the exploitative behavior for the game to the database
  db.ref(`users/${userID}/stats/PercentUnexplored_Game${gameNumber}`).set(percentUnexplored); // Write the percent unexplored for the game to the database

  db.ref(`users/${userID}/moves`).set(moves); // Add the move times for the game to the existing array in the databas
}

// Execute ending game functions when called
function endGame() {
  // Assign the card-selected class to all cards that were flipped
  const flippedCards = document.querySelectorAll('.card-flipped');
  flippedCards.forEach(card => {
    card.classList.add('card-selected');
  });

  //Updating scoreboards and databases
  updateScoreTracker(currentGame, totalScore);   // Append scores to the scoretracker
  updateSuitTracker(currentGame, suitScores);   // Append scores to the suittracker

  writeStatsToDatabase(currentGame) // Writing stats to database
  
  //Starting up next game
  if (currentGame === 10) {
    showEndGameMessage(); // Call the showEndGameMessage function if it's the last game
  } else {
    showEndRoundMessage(totalScore); // Call the showEndRoundMessage function if it's not the last game
  }
}

//*********************EVENT LISTENERS*********************** */
// Start the game right away
window.addEventListener('load', function() {
  startGame();
});

// Add click event listener to each card element
cardElements.forEach((cardElement) => {
  cardElement.addEventListener("click", () => {
    const isCardValid = cardElement.classList.contains("card-valid");
    if (isCardValid) {

      // Flip the card, update scores and scoreboard
      flipCard(cardElement);
      updateScores(cardElement);
      updateScoreboard();
      lockOtherCardsInRow(cardElement);
    
      // Check if game is over (card is in row 8)
      const row = cardElement.parentElement.dataset.row;
      if (row === "8") {
        endGame();
      } else {
        unlockCardsInNextRow(cardElement);
      }
    
    } else {
      const message = "Card is not valid";
      const errorBox = document.querySelector(".error-box");
      errorBox.innerHTML = message;
      errorBox.style.opacity = 1;
      setTimeout(() => {
        errorBox.style.opacity = 0;
      }, 2000);
    }
  });
});