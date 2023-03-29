const cards = [
    "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
    "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠",
    "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",
    "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣"
  ];
const deck = document.querySelector('.deck');
const cardElements = document.querySelectorAll('.card');
let totalScore = 0;
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
  
  // Assign each card a value and point value
  function dealCards() {
    cards.forEach((card, index) => {
      const cardElement = cardElements[index];
      cardElement.dataset.value = card;
      cardElement.classList.add("card-hidden");
      let points;
      if (card.startsWith("A")) {
        points = 1;
      } else if (card.startsWith("K") || card.startsWith("Q") || card.startsWith("J")) {
        points = 10;
      } else {
        points = parseInt(card);
      }
      cardElement.dataset.points = points;
  
      // Set the suit class for each card element
      if (card.includes("♥")) {
        cardElement.classList.add("heart");
      } else if (card.includes("♠")) {
        cardElement.classList.add("spade");
      } else if (card.includes("♦")) {
        cardElement.classList.add("diamond");
      } else if (card.includes("♣")) {
        cardElement.classList.add("club");
      }
    });
  } 
  
  function updateScoreboard() {
    // Update total score
    totalScore = Object.values(suitScores).reduce((acc, val) => acc + val, 0);
    document.getElementById("score-box").textContent = `Total score: ${totalScore}`;
  
    // Sort suitScores object by values in descending order
    let sortedScores = Object.entries(suitScores).sort((a, b) => b[1] - a[1]);
  
    // Get the suit score elements
    const heartScoreElement = document.getElementById("♥-score");
    const spadeScoreElement = document.getElementById("♠-score");
    const diamondScoreElement = document.getElementById("♦-score");
    const clubScoreElement = document.getElementById("♣-score");
  
    // Update the scores of the suit score elements
    heartScoreElement.textContent = `Hearts ♥: ${suitScores["♥"]}`;
    spadeScoreElement.textContent = `Spades ♠: ${suitScores["♠"]}`;
    diamondScoreElement.textContent = `Diamonds ♦: ${suitScores["♦"]}`;
    clubScoreElement.textContent = `Clubs ♣: ${suitScores["♣"]}`;
  
    // Reorder the suit score elements based on the sorted scores
    let scoreboard = document.querySelector(".scoreboard");
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
      
  // Shuffle the deck and deal the cards
  function startGame() {
    startButton.disabled = true;
    resetButton.disabled = false;
    shuffleDeck();
    dealCards();
    gameStarted = true;

    let scores = {
      "♥": 0,
      "♦": 0,
      "♠": 0,
      "♣": 0
    };
    
  }
  
  // Attach event listener to start button
  const startButton = document.getElementById('start-btn');
  startButton.addEventListener('click', startGame);
 
 // Add click event listener to each card element
cardElements.forEach((cardElement) => {
  cardElement.addEventListener("click", () => {
    if (gameStarted) {
      cardElement.classList.toggle("card-hidden");
      if (!cardElement.classList.contains("card-hidden")) {
        cardElement.classList.add("card-flipped"); // Add the card-flipped class when face up
        cardElement.textContent = cardElement.dataset.value;
        totalScore += parseInt(cardElement.dataset.points);
        const suit = cardElement.dataset.value.split("").pop(); // get the suit from the card value
        suitScores[suit] += parseInt(cardElement.dataset.points); // add points to the suit score
        document.getElementById("score-box").textContent = `Total score: ${totalScore}`;
        document.getElementById("♥-score").textContent = `Hearts ♥: ${suitScores["♥"]}`;
        document.getElementById("♠-score").textContent = `Spades ♠: ${suitScores["♠"]}`;
        document.getElementById("♦-score").textContent = `Diamonds ♦: ${suitScores["♦"]}`;
        document.getElementById("♣-score").textContent = `Clubs ♣: ${suitScores["♣"]}`;
      } else {
        cardElement.classList.remove("card-flipped"); // Remove the card-flipped class when face down
        cardElement.textContent = "";
        totalScore -= parseInt(cardElement.dataset.points);
        const suit = cardElement.dataset.value.split("").pop(); // get the suit from the card value
        suitScores[suit] -= parseInt(cardElement.dataset.points); // subtract points from the suit score
        document.getElementById("score-box").textContent = `Total score: ${totalScore}`;
        document.getElementById("♥-score").textContent = `Hearts ♥: ${suitScores["♥"]}`;
        document.getElementById("♠-score").textContent = `Spades ♠: ${suitScores["♠"]}`;
        document.getElementById("♦-score").textContent = `Diamonds ♦: ${suitScores["♦"]}`;
        document.getElementById("♣-score").textContent = `Clubs ♣: ${suitScores["♣"]}`;
      }
      updateScoreboard();   
    } 
  });
});

  //Creating and setting reset button
  const resetButton = document.getElementById('reset-btn');

  resetButton.addEventListener('click', () => {
    // Clear all card values
    cardElements.forEach((cardElement) => {
      cardElement.classList.add("card-hidden");
      cardElement.textContent = "";
      cardElement.dataset.points = 0;
      cardElement.classList.remove("heart", "spade", "diamond", "club"); // Add this line to remove suit-related classes
    });
  
    // Reset all score values
    totalScore = 0;
    suitScores = {
      "♥": 0,
      "♠": 0,
      "♦": 0,
      "♣": 0
    };
    document.getElementById("score-box").textContent = `Total score: ${totalScore}`;
    document.getElementById("♥-score").textContent = `Hearts ♥: ${suitScores["♥"]}`;
    document.getElementById("♠-score").textContent = `Spades ♠: ${suitScores["♠"]}`;
    document.getElementById("♦-score").textContent = `Diamonds ♦: ${suitScores["♦"]}`;
    document.getElementById("♣-score").textContent = `Clubs ♣: ${suitScores["♣"]}`;
  
    // Reset start button and gameStarted variable
    startButton.disabled = false;
    resetButton.disabled = true;
    gameStarted = false;
  });
  
  

  