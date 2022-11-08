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

//create deck of 52 cards
let deck = new Deck();
//precache all of the images, doesn't work on all browsers
const precacheImages = deck.preloadImages();
let gameStep = 0;
let currentChips = 150;
let currentWager = 0;
let table = new Table(deck.dealTable());
let player = new Player(deck.dealPlayer());

function next() {
  switch (gameStep) {
    case 0: //prepare new game and the player's hand
      wager();
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
      instructionText.innerHTML = "You can place a bet, or hit next!";
      wagerButton.addEventListener("click", wager);
      wagerButton.disabled = false;
      break;

    case 1: //reveal the flop
      table.displayCards();
      gameStep++;
      break;

    case 2: //reveal the turn card
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
        'Hit "Next" to begin playing. Each game costs $5 in chips to start!';
      break;

    default: //if something doesn't match up, just reset the game
      table.reset();
      player.reset();
      gameStep = 0;
      currentWager = 0;
      instructionText.innerHTML =
        'Hit "Next" to begin playing. Each game costs $5 in chips to start!';
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
  return `You lost. Please try again!`;
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

const wager = () => {
  currentChips = currentChips - 5;
  currentWager = currentWager + 5;
  updateStatsDisplay();
};

nextButton.addEventListener("click", () => {
  next();
});
