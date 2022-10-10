export default class Card {
  constructor(suit, faceValue) {
    this.suit = suit;
    this.faceValue = faceValue;
    this.imagePath = `images/${faceValue}${suit}.gif`;
    this.cardBackImagePath = "images/B.gif";
    this.faceUp = false;
  }
}
