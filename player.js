export default class Player {
  constructor(cards) {
    this.cards = cards;
    this.hand = document.querySelectorAll("[data-player-card]");
  }

  displayCards() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].faceUp = true;
      this.hand[i].src = this.cards[i].imagePath;
    }
  }
}
