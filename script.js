import Deck from "./deck.js";
import Player from "./player.js";
import Table from "./table.js";

const NUMBER_OF_PLAYERS = 1;
const nextButton = document.querySelector("[data-next-button]");

//create deck of 52 cards
let deck = new Deck();
//precache all of the images, doesn't work on all browsers
const precacheImages = deck.preloadImages();
let gameStep = 0;
let table = new Table(deck.dealTable());
let player = new Player(deck.dealPlayer());

function startGame() {
  deck = new Deck();
  //shuffle the deck
  deck.shuffle();
  //deal the river
  table = new Table(deck.dealTable());
  table.displayCards();
  //deal player hand
  player = new Player(deck.dealPlayer());
  player.displayCards();
  //reveal the turn card
  table.turnCard();
  //reveal the river card
  table.river();
}
// startGame();
function next() {
  switch (gameStep) {
    case 0: //prepare new game and the player's hand
      deck = new Deck();
      deck.shuffle();
      table = new Table(deck.dealTable());
      player = new Player(deck.dealPlayer());
      player.displayCards();
      gameStep++;
      break;

    case 1: //player can place a bet
      //to implement
      gameStep++;
      break;

    case 2: //reveal the flop
      table.displayCards();
      gameStep++;
      break;

    case 3: // player can place a bet
      //to implement
      gameStep++;
      break;

    case 4: //reveal the turn card
      table.turnCard();
      gameStep++;
      break;

    case 5: //player can place a bet
      //to implement
      gameStep++;
      break;

    case 6: //reveal the river card
      table.river();
      gameStep++;
      //decide if winner and display results
      break;

    case 7: //reset table for another round
      table.reset();
      player.reset();
      gameStep = 0;
      break;

    default: //if something doesn't match up, just reset the game
      table.reset();
      player.reset();
      gameStep = 0;
  }
}

nextButton.addEventListener("click", () => {
  next();
});
