export default class Table {
  constructor(cards) {
    this.cards = cards;
    this.cards.forEach((card) => {
      card.faceUp = true;
    });
    this.table = document.querySelectorAll("[data-table-card]");
  }

  getCards() {
    return this.cards;
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

  addCard(card) {
    this.cards.push(card);
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
    this.table.forEach((item, index) => {
      item.src = this.cards[index].cardBackImagePath;
    });
  }
}
