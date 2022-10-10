import Deck from "./deck.js";
import Player from "./player.js";
import River from "./river.js";

const NUMBER_OF_PLAYERS = 1;

function startGame() {
  //create deck of 52 cards
  const deck = new Deck();
  //shuffle the deck
  deck.shuffle();
  //deal the river
  const river = new River(deck.dealRiver());
  deck.dealRiver();
  river.displayCards();
  //deal player hand
  const player = new Player(deck.dealPlayer());
  player.displayCards();
}
startGame();
