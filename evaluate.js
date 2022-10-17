import Card from "./card.js";

const SUITS = ["S", "C", "D", "H"];
const FACE_VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
];

const testHand1 = [
  new Card("H", "T"),
  new Card("H", "J"),
  new Card("H", "Q"),
  new Card("H", "K"),
  new Card("H", "A"),
];

const testHand2 = [
  new Card("C", "9"),
  new Card("C", "T"),
  new Card("C", "J"),
  new Card("C", "Q"),
  new Card("C", "K"),
];

const testHand3 = [
  new Card("C", "2"),
  new Card("C", "3"),
  new Card("C", "4"),
  new Card("C", "5"),
  new Card("C", "A"),
];

const testHand4 = [
  new Card("S", "2"),
  new Card("S", "3"),
  new Card("S", "5"),
  new Card("S", "8"),
  new Card("S", "Q"),
];

let dupCount = 1;
let seqCount = 1;
let seqCountMax = 1;
let maxCardValue = -1;
let dupValue = -1;
let seqMaxValue = -1;
let currentCardValue = -1;
let nextCardValue = -1;
let currentCardSuit = null;
let nextCardSuit = null;
let duplicates = [];
let rankName = "";
let rank = 0;
let rankCards = [];

export default function getPlayerHandRank(playerCards, tableCards) {
  //create and initialize the needed variables

  //combine the cards into one array and sort them by the card values
  let sorted = playerCards.concat(tableCards).sort((a, b) => {
    return a.numericValue - b.numericValue;
  });
  //prepare all of the data we need to determine the hand score
  analyzeHand(sorted);
  if (checkFlush(testHand4)) {
    return [rankName, rank, rankCards];
  }
}

//Many hands leave room for extra cards to be included in the mix. Such as having a Pair:
// Both players could have the same pair, and so the tiebreaker is decided by whoever has the highest card.
// This function determines how much a player's had is worth based on the value of thier highest cards.
function evaluateRankByHighestCards(
  arrayOfCards,
  excludedCard1 = -1,
  excludedCard2 = -1,
  normalize = 433175 // this brings the final sum back down to a number between 0 and 1
) {
  let sum = 0;
  let arrayLength = arrayOfCards.length - 1;
  for (let i = arrayLength; i >= 0; i--) {
    let cardValue = arrayOfCards[i].numericValue;
    if (cardValue == excludedCard1 || cardValue == excludedCard2) {
      continue;
    }
    let normalizedValue = cardValue - 2;
    sum += normalizedValue * Math.pow(13, i);
  }

  return sum / normalize;
}

function analyzeHand(sortedCards) {
  //reset the variables
  dupCount = 1;
  seqCount = 1;
  seqCountMax = 1;
  maxCardValue = -1;
  dupValue = -1;
  seqMaxValue = -1;
  currentCardValue = -1;
  nextCardValue = -1;
  currentCardSuit = null;
  nextCardSuit = null;
  duplicates = [];
  rankName = "";

  //grab the highest value represented
  maxCardValue = sortedCards[sortedCards.length - 1].numericValue;
  for (let i = 0; i < 6; i++) {
    currentCardValue = sortedCards[i].numericValue;
    currentCardSuit = sortedCards[i].suit;

    nextCardValue = sortedCards[i + 1].numericValue;
    nextCardSuit = sortedCards[i + 1].numericValue;

    //check for duplicates
    if (currentCardValue == nextCardValue) {
      dupCount++;
      dupValue = currentCardValue;
    } else if (dupCount > 1) {
      duplicates.push({ dupCount, currentCardValue });
      dupCount = 1;
    }

    if (currentCardValue + 1 == nextCardValue) {
      seqCount++;
    } else if (currentCardValue != nextCardValue) {
      if (seqCount > seqCountMax) {
        seqCountMax = seqCount;
        seqMaxValue = currentCardValue;
      }
      seqCount = 1;
    }
  }
  if (seqCount > seqCountMax) {
    seqCountMax = seqCount;
    seqMaxValue = nextCardValue;
  }

  if (dupCount > 1) {
    duplicates.push({ dupCount, nextCardValue });
  }
}

function checkFlush(sortedCards) {
  //There are four suits, so we check how many we have of each
  SUITS.forEach((suit) => {
    let suitedCards = sortedCards.filter((card) => {
      if (card.suit == suit) {
        return true;
      }
    });
    let counter = 1;
    let counterMax = 1;
    let lastValue = -1;
    for (let i = 0; i < suitedCards.length - 1; i++) {
      if (suitedCards[i].numericValue + 1 === suitedCards[i + 1].numericValue) {
        counter++;
        counterMax++;
        lastValue = suitedCards[i + 1].numericValue;
        rankCards.push(suitedCards[i]);
        if (i == suitedCards.length - 2) {
          rankCards.push(suitedCards[i + 1]);
        }
      } else {
        counter = 1;
        rankCards = [];
      }
    }
    if (counter >= 5) {
      rankName = "Straight Flush";
      rank = 800 + (lastValue / 14) * 99;
      if (checkRoyalFlush(suitedCards)) {
        rankName = "Royal Flush";
        rank = 900;
        rankCards = sortedCards.slice(-5);
        return;
      }
      // Edge Case: the Ace can be used as the starting OR final card in a straight flush:
      // Meaning that A,2,3,4,5 is a Straight and so is T,J,Q,K,A
      // We just need to check if the Ace is the last card in our suitedCards and that our counterMax made it to 4 before stopping at a card with a numeric value of 5
    } else if (
      counterMax === 4 &&
      lastValue === 5 &&
      suitedCards[suitedCards.length - 1].numericValue === 14
    ) {
      rankName = "Straight Flush";
      rank = 800 + (5 / 14) * 99;
      rankCards = sortedCards.filter((card) => {
        if (suit === card.suit) {
          return true;
        }
      });
      return;
    } else if (suitedCards.length >= 5) {
      rankName = "Flush";
      rank = 500 + evaluateRankByHighestCards(suitedCards.slice(-5));
      rankCards = suitedCards.slice(-5);
    }
  });
  if (rank > 0) return true;
  return false;
}

function checkRoyalFlush(suitedCards) {
  if (suitedCards.length < 5) {
    return false;
  }
  if (
    suitedCards[suitedCards.length - 1].numericValue == 14 &&
    suitedCards[suitedCards.length - 2].numericValue == 13 &&
    suitedCards[suitedCards.length - 3].numericValue == 12 &&
    suitedCards[suitedCards.length - 4].numericValue == 11 &&
    suitedCards[suitedCards.length - 5].numericValue == 10
  ) {
    return true;
  }
  return false;
}
