export default class Player {
  constructor(cards) {
    this.cards = cards;
    this.hand = document.querySelectorAll("[data-player-card]");
  }

  getCards() {
    return this.cards;
  }

  displayCards() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].faceUp = true;
      this.hand[i].src = this.cards[i].imagePath;
    }
  }

  reset() {
    this.cards.forEach((card, index) => {
      this.hand[index].src = card.cardBackImagePath;
    });
  }
}
