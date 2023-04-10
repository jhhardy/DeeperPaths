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
const db = firebase.database();

//********************LOADING WELCOME SCREEN*********************** */
// Listen for start button on welcome screen
function welcomeScreen() {
  const continueButton = document.getElementById("continue-button");
  continueButton.addEventListener("click", showContestScreen);
}

// Show contest screen
function showContestScreen() {
  const welcomeScreen = document.getElementById("welcome-screen");
  const contestScreen = document.getElementById("contest-screen");
  
  welcomeScreen.style.display = "none";
  contestScreen.style.display = "block";
  
  listenForStartButton(); // Call the new function to listen for the start button click
  listenForSubmitEmailButton(); // Call the new function to listen for the submit email button click
}

// Listen for submit email button on contest screen
let userEmailAddress;
function listenForSubmitEmailButton() {
  const submitEmailButton = document.getElementById("submit-email-button");
  const emailForm = document.querySelector("form");
  const emailInput = document.getElementById("email");

  submitEmailButton.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the form from submitting and refreshing the page
    const userEmail = emailInput.value;

    // Check if the user's email address is in a valid email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(userEmail)) {
      // If the email address is not in a valid format, warn the user and don't store the email address
      alert("Please enter a valid email address in order to enter the contest. If you would like to opt out, click: Start Game (No Contest) instead.");
      return;
    }

    // Store the user's email in a global variable
    userEmailAddress = userEmail;

    // Start the game by calling the startGame function
    startGame();
  });
  emailForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting and refreshing the page
  });
}

// Listen for start button on contest screen
function listenForStartButton() {
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", startGame);
}

//*********************PREPARING GAMEBOARD*********************** */
  // Defining constants and giving the cards values
  const cards = [
    "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
    "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠",
    "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",
    "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣"
  ];

  let suitScores = {
    "♥": 0,
    "♠": 0,
    "♦": 0,
    "♣": 0
    };

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
    const standardScoringRules = {
      "A": 2,
      "K": 1,
      "Q": 1,
      "J": 1,
      "10": 1, /*this is the value for the 10's place*/
      "9": 0,
      "8": 0,
      "7": 0,
      "6": 0,
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0
    };

    const modifiedScoringRules = {
      "A": 2,
      "K": 2,
      "Q": 2,
      "J": 2,
      "10": 2, /* this is the value for the 10's place */
      "9": 1,
      "8": 1,
      "7": 1,
      "6": 1,
      "5": 1,
      "4": 1,
      "3": 1,
      "2": 1
    };
    
    // Assign each card a value and point value based on scoring system
    const cardElements = document.querySelectorAll('.card');
    function assignCardPoints(cardElement, card, scoringSystem, suitsScoring) {
      let points = 0;
      const cardRank = card.charAt(0) === "1" && card.charAt(1) === "0" ? "10" : card.charAt(0);
      const cardSuit = cardRank === "10" ? card.charAt(2) : card.charAt(1);
      if (suitsScoring === "allSuits" || suitsScoring === cardSuit) {
        points = scoringSystem[cardRank] || 0;
      }
      cardElement.dataset.points = points;
    }

    // Function to assign the appropriate scoring system
    function assignCardValue(cardElement, card, scoringSystem, suitsScoring) {
      cardElement.dataset.value = card;
      cardElement.classList.add("card-invalid");
      assignCardPoints(cardElement, card, scoringSystem, suitsScoring);
      assignCardSuit(cardElement, card);
    }

  //Deals out cards and assigns them values according the scoring system and suit options
  function dealCards(valueScoring, suitsScoring) {
    cards.forEach((card, index) => {
      const cardElement = cardElements[index];
      assignCardValue(cardElement, card, valueScoring, suitsScoring);
    });
  }

  //Function that updates the rule container to display current rule set to the user
  function updateRuleContainer(activeScoring) {
    const ruleContainer = document.querySelector('.rule-container');
    
    if (activeScoring === standardScoringRules) {
      ruleContainer.innerHTML = '<span class="purple-text">A: 2 points</span>&nbsp;<span class="green-text">K, Q, J, and 10s: 1 point</span>&nbsp;<span class="red-text">All other cards: 0 points</span>';
    } else if (activeScoring === modifiedScoringRules) {
      const suitNames = ["Spades", "Hearts", "Diamonds", "Clubs"];
      const activeSuitIndex = ["♠", "♥", "♦", "♣"].indexOf(activeSuits);
      const activeSuitName = suitNames[activeSuitIndex];
      ruleContainer.innerHTML = `<span class="purple-text">A, K, Q, J, and 10s of ${activeSuitName} ${activeSuits}: 2 points</span>&nbsp;<span class="green-text">9, 8, 7, 6, 5, 4, 3, 2 of ${activeSuitName} ${activeSuits}: 1 point</span>&nbsp;<span class="red-text">All other cards: 0 points</span>`;
    }
  }


//*********************STARTING GAME*********************** */
// Generate User ID
function generateUserID() {
  const randomChars = Math.random().toString(36).substring(2, 8);
  return randomChars;
}

// Reset GameBoard
let totalScore = 0;
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
    if (card.classList.contains('card-selected')) { // Showing text content for all cards assigned card-selected classicfication
      card.textContent = card.dataset.value; 
    }
  });

  // Validating the cards in row 1
  const row1Cards = document.querySelectorAll('.row[data-row="1"] .card');
  row1Cards.forEach(card => {
    card.classList.remove('card-invalid');
    card.classList.add('card-valid');
  });

  // UpdatingRuleSetContainer
  updateRuleContainer(activeScoring)

  // Updating scoreboard
  updateScoreboard();
}

// Writing user data to the database on the first game
let userID;
function writeUserData() {
  const userEmailAddress = document.getElementById("email").value || "No Contest";
  const currentDate = new Date();
  const date = currentDate.toDateString();
  const time = currentDate.toTimeString();

  db.ref(`users/${userID}/userData/Date`).set(date);
  db.ref(`users/${userID}/userData/Time`).set(time);
  db.ref(`users/${userID}/userData/Email`).set(userEmailAddress);
}

// Starting game
let currentGame = 0;
let activeSuits;
let activeScoring;
function startGame() {
  if (currentGame === 0) {
    shuffleDeck();
    userID = generateUserID();
    writeUserData();
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    activeSuits = "allSuits";
    activeScoring = standardScoringRules;
  }

  currentGame++;
  dealCards(activeScoring, activeSuits);
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
      function recordMoveData(isExploratory, cardElement) {
        const now = new Date();
        const moveTime = now.getTime() - lastMoveTime;
        lastMoveTime = now.getTime();
      
        // Record move time, type, move number, and data-points in an array
        moves.push({
          moveNumber: moves.length + 1,
          time: moveTime,
          type: isExploratory ? 'exploratory' : 'exploitative',
          points: cardElement.dataset.points
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
          recordMoveData(true, cardElement);
      
        // If move is exploitative
        } else {
          const flippedCardValues = flippedCards.map(card => card.dataset.value);
          if (flippedCardValues.includes(cardValue)) {
            exploitativeMoves++;
            recordMoveData(false, cardElement);
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
      if (isSoundOn) {
        if (points === 1) {
          const audio = new Audio('ClinkingCoin.wav');
          audio.play();
        } else if (points > 1) {
          const audio = new Audio('ClinkingCoins.wav');
          audio.play();
        }
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

// Helper function calculating color gradient for final score
function getColor(score) {
  let r, g, b;

  if (score <= 4) {
    // Dark red
    r = 200;
    g = 0;
    b = 0;
  } else if (score > 4 && score <= 5) {
    // Yellow
    r = 255;
    g = 255;
    b = 0;
  } else if (score > 5 && score <= 9) {
    // Dark green
    r = 0;
    g = 200;
    b = 0;
  } else {
    // Dark purple
    r = 128;
    g = 0;
    b = 128;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// Update ScoreTracker with final game score
function updateScoreTracker(gameNumber, totalScore) {
  // Calculate running average of total score
  TotalScoreAcrossGames += totalScore;
  averageTotalScores = (TotalScoreAcrossGames / gameNumber);

  // Output total and average total scores on score tracker
  const gameScoreDiv = document.getElementById(`gamescore-${gameNumber}`);
  let output = `Round ${gameNumber}: <span class="total-score">${totalScore}</span> (<span class="average-score">${averageTotalScores.toFixed(1)}</span>)`;
  gameScoreDiv.innerHTML = output;

  // Set the color based on the scores
  const totalScoreColor = getColor(totalScore);
  const averageScoreColor = getColor(averageTotalScores);
  gameScoreDiv.querySelector('.total-score').style.color = totalScoreColor;
  gameScoreDiv.querySelector('.average-score').style.color = averageScoreColor;
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
function showEndRoundMessage(score, isRuleChange) {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  if (isRuleChange) {
    messageBox.innerHTML = `
      <h2>Round Over!</h2>
      <p>Your score for the round was: ${score}</p>
      <div class="button-container">
      <button onclick="showRuleChangeMessage()">BIG NEWS!</button>
      </div>
    `;
  } else {
    messageBox.innerHTML = `
      <h2>Round Over!</h2>
      <p>Your score for the round was: ${score}</p>
      <div class="button-container">
        <button onclick="startGame()">We go again!</button>
      </div>
    `;
  }
  document.body.appendChild(messageBox);
}

// Show the rule change message
function showRuleChangeMessage() {
  // Remove the existing message box (if any)
  const existingMessageBox = document.querySelector('.message-box');
  if (existingMessageBox) {
    existingMessageBox.remove();
  }

  //Update the Rule Container
  updateRuleContainer(activeScoring)
  
  // Create and append the new message box
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.innerHTML = `
    <h2><span style="color: rgb(255, 255, 255); font-weight: bold;">Big news explorers!</span></h2>
    <p>The market has changed!</p>
    <p><span style="color: rgb(34, 172, 214); font-weight: bold;">Gemseekers INC</span> will now only pay for <span style="color: rgb(182, 179, 17); font-weight: bold;">${activeSuits} cards</span>.</p>
    <p>However, <span style="color: rgb(182, 179, 17); font-weight: bold;">K, Q, J, and 10s of ${activeSuits}s</span> are now worth <span style="color: rgb(156, 102, 241); font-weight: bold;">2 points!</span></p>
    <p>Also, <span style="color: rgb(182, 179, 17); font-weight: bold;">9, 8, 7, 6, 5, 4, 3 ,2 of ${activeSuits}s</span> are now worth <span style="color: rgb(66, 190, 41); font-weight: bold;">1 points!</span></p>
    <p><span style="color: rgb(228, 51, 51); font-weight: bold;">ALL other suits</span> are now worth <span style="color: rgb(228, 51, 51); font-weight: bold;">0 points!</span></p>
    <div class="button-container">
      <button onclick="startGame()">Understood! Let's go!</button>
    </div>
  `;
  document.body.appendChild(messageBox);
}

// Show end game message
function showEndGameMessage() {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.innerHTML = `
    <h2>Game Over!</h2>
    <p>Thank you for playing!</p>
    <p>Final score: ${TotalScoreAcrossGames}</p>
  `;
  document.body.appendChild(messageBox);

  // Set the text content of each card to its data value
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.textContent = ''; // Clearing all card text content
    if (card.classList.contains('card')) { // Showing text content for all cards assigned card-selected classicfication
      card.textContent = card.dataset.value; 
    }
  });

  db.ref(`users/${userID}/stats/FinalScore`).set(TotalScoreAcrossGames); // If its the last game, write the final score for the game to the database
}

// Write stats to database
function writeStatsToDatabase(gameNumber) {
  db.ref(`users/${userID}/stats/TotalScore_Game_${gameNumber}`).set(totalScore); // Write the totalscore for the game to the database
  db.ref(`users/${userID}/stats/AvgTotalScore_Game_${gameNumber}`).set(averageTotalScores); // Write the average totalscore for the game to the database
  db.ref(`users/${userID}/stats/Exploration_Game_${gameNumber}`).set(exploratoryMoves); // Write the exploration behavior for the game to the database
  db.ref(`users/${userID}/stats/Exploitation_Game_${gameNumber}`).set(exploitativeMoves); // Write the exploitative behavior for the game to the database
  db.ref(`users/${userID}/stats/PercentUnexplored_Game_${gameNumber}`).set(percentUnexplored); // Write the percent unexplored for the game to the database

  db.ref(`users/${userID}/moves`).set(moves); // Add the move times for the game to the existing array in the databas
}

// Displays the correct message to transition to next game
function transitionMessages(totalScore) {
  if (currentGame === 5) {
    activeScoring = modifiedScoringRules;
    activeSuits = ["♠", "♥", "♦", "♣"][Math.floor(Math.random() * 4)]; //Randomly sets on of the suits to be the active suit.
    showEndRoundMessage(totalScore, true);
  } else if (currentGame === 10) {
    showEndGameMessage();
  } else {
    showEndRoundMessage(totalScore, false);
  }
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

  // Write stats to database
  writeStatsToDatabase(currentGame);

  //Display end of game messages;
  transitionMessages(totalScore);
}

//*********************EVENT LISTENERS*********************** */
// Loading game
window.addEventListener('load', function() {
  welcomeScreen()
});

// Add sound on/off toggles
const soundToggle = document.querySelector('.sound-toggle');
let isSoundOn = true;

soundToggle.addEventListener('click', () => {
  if (isSoundOn) {
    soundToggle.classList.remove('on');
    soundToggle.classList.add('off');
    soundToggle.textContent = 'Sound off 🔊';
    // Your code to mute the sound goes here
  } else {
    soundToggle.classList.remove('off');
    soundToggle.classList.add('on');
    soundToggle.textContent = 'Sound on 🔊';
    // Your code to unmute the sound goes here
  }
  
  isSoundOn = !isSoundOn;
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
      const message = "Card is not valid! Look for the golden keys! 🔑";
      const errorBox = document.querySelector(".error-box");
      errorBox.innerHTML = message;
      errorBox.classList.add("fade-in"); // Add the fade-in class to trigger the animation
      setTimeout(() => {
        errorBox.classList.remove("fade-in"); // Remove the fade-in class to trigger the fade-out animation
        errorBox.classList.add("fade-out"); // Add the fade-out class to trigger the animation
        setTimeout(() => {
          errorBox.classList.remove("fade-out"); // Remove the fade-out class to hide the error box completely
        }, 1000);
      }, 2000);
    }
  });
});
