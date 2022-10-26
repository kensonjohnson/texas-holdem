export default class Player {
  constructor(cards) {
    this.cards = cards;
    this.hand = document.querySelectorAll("[data-player-card]");
    this.handValues = document.querySelectorAll("[data-player-card-value]");
  }

  getCards() {
    return this.cards;
  }

  displayCards() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].faceUp = true;
      this.handValues[i].src = this.cards[i].imagePath;
      this.hand[i].classList.add("turned");
    }
  }

  reset() {
    this.hand.forEach((item) => {
      item.className = "card";
    });
  }
}
