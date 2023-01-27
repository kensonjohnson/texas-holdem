import Deck from "./deck.js";
import Player from "./player.js";
import Table from "./table.js";
import checkPlayerHand from "./evaluate.js";

const NUMBER_OF_PLAYERS = 1;

const wagerButton = document.querySelector("[data-wager-button]");
const nextButton = document.querySelector("[data-next-button]");
const instructionText = document.querySelector("[data-instructions-text]");
const currentChipsDisplay = document.querySelector("[data-current-chips]");
const currentBetDisplay = document.querySelector("[data-current-bet]");
const helpButton = document.querySelector("[data-help-button]");
const helpModal = document.getElementById("help-modal");
const modalCloseButton = document.querySelector("[data-help-close]");

//create deck of 52 cards
let deck = new Deck();
//precache all of the images, doesn't work on all browsers
const precacheImages = deck.preloadImages();
let gameStep = 0;
let currentChips = 150;
let currentWager = 0;
let table = new Table(deck.dealTable());
let player = new Player(deck.dealPlayer());
let canBet = true;

function next() {
  switch (gameStep) {
    case 0: //prepare new game and the player's hand
      currentChips = currentChips - 5;
      currentWager = currentWager + 5;
      updateStatsDisplay();
      deck = new Deck();
      deck.shuffle();
      table = new Table(deck.dealTable());
      player = new Player(deck.dealPlayer());
      player.displayCards();
      table.addCard(deck.dealCard());
      table.addCard(deck.dealCard());
      console.log(checkPlayerHand(player.cards, table.cards));
      // console.log(table.cards);
      gameStep++;
      instructionText.innerHTML = "You can place a bet, or hit play!";
      wagerButton.addEventListener("click", wager);
      wagerButton.disabled = false;
      canBet = true;
      break;

    case 1: //reveal the flop
      wagerButton.disabled = false;
      canBet = true;
      table.displayCards();
      gameStep++;
      break;

    case 2: //reveal the turn card
      wagerButton.disabled = false;
      canBet = true;
      table.turnCard();
      gameStep++;
      break;

    case 3: //reveal the river card
      wagerButton.removeEventListener("click", wager);
      wagerButton.disabled = true;
      table.river();
      gameStep++;
      let results = checkPlayerHand(player.cards, table.cards);
      let winnings = determineWinnings(results.score, currentWager);
      let message = determineIfWinner(results, winnings);
      displayWinningCards(results.hand);
      instructionText.innerHTML = message;
      currentChips = currentChips + winnings;
      break;

    case 4: //reset table for another round
      table.reset();
      player.reset();
      gameStep = 0;
      currentWager = 0;
      updateStatsDisplay();
      instructionText.innerHTML =
        'Hit "Play" to begin playing. Each game costs $5 in chips to start!';
      break;

    default: //if something doesn't match up, just reset the game
      table.reset();
      player.reset();
      gameStep = 0;
      currentWager = 0;
      instructionText.innerHTML =
        'Hit "Play" to begin playing. Each game costs $5 in chips to start!';
      wagerButton.removeEventListener("click", wager);
      wagerButton.disabled = true;
  }
}

function updateStatsDisplay() {
  currentChipsDisplay.innerHTML = `$${currentChips}`;
  currentBetDisplay.innerHTML = `$${currentWager}`;
}

function determineIfWinner(results, winnings) {
  if (results.score > 99) {
    return `You win with a ${results.handName}! You won $${winnings}!`;
  }
  return `You lost. These are your five best cards, but they don't make anything! Please try again!`;
}

function determineWinnings(score, wager) {
  if (score < 100) return 0; // High Card

  if (score >= 900) return wager * 30; // Royal Flush

  if (score >= 800) return wager * 20; // Straight Flush

  if (score >= 700) return wager * 15; // Four of a Kind

  if (score >= 600) return wager * 12; // Full House

  if (score >= 500) return wager * 10; // Flush

  if (score >= 400) return wager * 8; // Straight

  if (score >= 300) return wager * 4; // Three of a Kind

  if (score >= 200) return wager * 2; // Two Pair

  if (score >= 100) return wager; // Pair
}

function displayWinningCards(hand) {
  table.cards.forEach((tableCard) => {
    for (let card of hand) {
      if (
        card.faceValue === tableCard.faceValue &&
        card.suit === tableCard.suit
      ) {
        tableCard.winningCard = true;
      }
    }
  });
  player.cards.forEach((playerCard) => {
    for (let card of hand) {
      if (
        card.faceValue === playerCard.faceValue &&
        card.suit === playerCard.suit
      ) {
        playerCard.winningCard = true;
      }
    }
  });

  table.displayCards();
  player.displayCards();
}

const wager = () => {
  if (canBet) {
    currentChips = currentChips - 5;
    currentWager = currentWager + 5;
    canBet = false;
    wagerButton.disabled = true;
    updateStatsDisplay();
  }
};

nextButton.addEventListener("click", () => {
  next();
});

helpButton.addEventListener("click", () => {
  helpModal.classList.add("show");
});

modalCloseButton.addEventListener("click", () => {
  helpModal.classList.remove("show");
});
