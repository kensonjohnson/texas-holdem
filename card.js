const NUMERIC_VALUE_MAP = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export default class Card {
  constructor(suit, faceValue) {
    this.suit = suit;
    this.faceValue = faceValue;
    this.numericValue = NUMERIC_VALUE_MAP[faceValue];
    this.imagePath = `images/${faceValue}${suit}.svg`;
    this.cardBackImagePath = "images/B.svg";
    this.faceUp = false;
    this.winningCard = false;
  }
}
