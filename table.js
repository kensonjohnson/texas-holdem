export default class Table {
  constructor(cards) {
    this.cards = cards;
    this.cards.forEach((card) => {
      card.faceUp = true;
    });
    this.table = document.querySelectorAll("[data-table-card]");
    this.tableValues = document.querySelectorAll("[data-table-card-value]");
    this.tableCards = document.querySelectorAll("[data-table-card-front]");
  }

  getCards() {
    return this.cards;
  }

  displayCards() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].faceUp) {
        this.tableValues[i].src = this.cards[i].imagePath;
        this.table[i].classList.add("turned");
      } else {
        this.tableValues[i].src = this.cards[i].cardBackImagePath;
        this.table[i].className = "card";
      }

      if (this.cards[i].winningCard) {
        this.tableCards[i].classList.add("winning-card");
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
    this.table.forEach((card) => {
      card.className = "card";
    });

    this.tableCards.forEach((card) => {
      card.className = "card-front card-face";
    });
  }
}
