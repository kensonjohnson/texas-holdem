export default class Player {
  constructor(cards) {
    this.cards = cards;
    this.hand = document.querySelectorAll("[data-player-card]");
    this.handValues = document.querySelectorAll("[data-player-card-value]");
    this.handCards = document.querySelectorAll("[data-player-card-front]");
  }

  getCards() {
    return this.cards;
  }

  displayCards() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].faceUp = true;
      this.handValues[i].src = this.cards[i].imagePath;
      this.hand[i].classList.add("turned");
      if (this.cards[i].winningCard) {
        this.handCards[i].classList.add("winning-card");
      }
    }
  }

  reset() {
    this.hand.forEach((card) => {
      card.className = "card";
    });
    this.handCards.forEach((card) => {
      card.className = "card-front card-face";
    });
  }
}
