import Card from "./card.js";

const SUITS = ["S", "C", "D", "H"];
const FACE_VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
];

export default class Deck {
  constructor(cards = freshDeck()) {
    this.cards = cards;
  }

  get numberOfCards() {
    return this.cards.length;
  }
  //rather than use Array.sort(), which is predictable even when using Math.random(),
  //we will create our own random sorting algorithm
  shuffle() {
    for (let i = this.numberOfCards - 1; i > 0; i--) {
      //starting at the top of the deck, look for any card less than the current index.
      const newIndex = Math.floor(Math.random() * (i + 1));
      //save what that card value was:
      const oldValue = this.cards[newIndex];
      //then swap the values:
      this.cards[newIndex] = this.cards[i];
      this.cards[i] = oldValue;
    }
  }

  dealRiver() {
    //burn a card
    this.cards.shift;
    //send five cards to the river and remove them from the deck
    let riverCards = this.cards.slice(0, 5);
    this.cards.splice(0, 5);
    return riverCards;
  }

  dealPlayer() {
    //burn a card
    this.cards.shift;
    //deal two cards, face up
    let playerCards = this.cards.slice(0, 5);
    this.cards.splice(0, 5);
    return playerCards;
  }
}

function freshDeck() {
  return SUITS.flatMap((suit) => {
    return FACE_VALUES.map((value) => {
      return new Card(suit, value);
    });
  });
}
// document.images[0].src = deck.cards[0].imagePath;
