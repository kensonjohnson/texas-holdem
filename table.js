export default class Table {
  constructor(cards) {
    this.cards = cards;
    this.cards[0].faceUp = true;
    this.cards[1].faceUp = true;
    this.cards[2].faceUp = true;
    this.table = document.querySelectorAll("[data-table-card]");
  }

  displayCards() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].faceUp) {
        this.table[i].src = this.cards[i].imagePath;
      } else {
        this.table[i].src = this.cards[i].cardBackImagePath;
      }
    }
  }

  //the "turn card" is the fourth card revealed on the table
  turnCard() {
    this.cards[3].faceUp = true;
    this.displayCards();
  }

  //the "river" is the fifth card revealed on the table
  river() {
    this.cards[4].faceUp = true;
    this.displayCards();
  }

  reset() {
    this.cards.forEach((card, index) => {
      this.table[index].src = card.cardBackImagePath;
    });
  }
}
