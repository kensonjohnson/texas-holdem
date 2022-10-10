export default class River {
  constructor(cards) {
    this.cards = cards;
    this.cards[0].faceUp = true;
    this.cards[1].faceUp = true;
    this.cards[2].faceUp = true;
    this.river = document.querySelectorAll("[data-river-card]");
  }

  displayCards() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].faceUp) {
        this.river[i].src = this.cards[i].imagePath;
      } else {
        this.river[i].src = this.cards[i].cardBackImagePath;
      }
    }
  }
}
