import Deck from "./deck.js";
import Player from "./player.js";
import Table from "./table.js";

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
let currentBet = 0;
let table = new Table(deck.dealTable());
let player = new Player(deck.dealPlayer());

function next() {
  switch (gameStep) {
    case 0: //prepare new game and the player's hand
      deck = new Deck();
      deck.shuffle();
      table = new Table(deck.dealTable());
      player = new Player(deck.dealPlayer());
      player.displayCards();
      table.addCard(deck.dealCard());
      table.addCard(deck.dealCard());
      gameStep++;
      instructionText.innerHTML = "You can place a bet, or hit next!";
      wagerButton.addEventListener("click", wager);
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
      table.river();
      gameStep++;
      instructionText.innerHTML = "You Win/Lose!";
      //decide if winner and display results
      break;

    case 4: //reset table for another round
      table.reset();
      player.reset();
      gameStep = 0;
      currentBet = 0;
      currentChips = 150;
      updateStatsDisplay();
      instructionText.innerHTML = 'Hit "Next" to Start!';
      break;

    default: //if something doesn't match up, just reset the game
      table.reset();
      player.reset();
      gameStep = 0;
      currentBet = 0;
      currentChips = 150;
      instructionText.innerHTML = 'Hit "Next" to Start!';
      wagerButton.removeEventListener("click", wager);
  }
}

function updateStatsDisplay() {
  currentChipsDisplay.innerHTML = `$${currentChips}`;
  currentBetDisplay.innerHTML = `$${currentBet}`;
}

const wager = () => {
  currentChips = currentChips - 5;
  currentBet = currentBet + 5;
  updateStatsDisplay();
};

nextButton.addEventListener("click", () => {
  next();
});
