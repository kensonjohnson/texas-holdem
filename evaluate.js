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

const testHand5 = [
  new Card("S", "3"),
  new Card("C", "3"),
  new Card("D", "3"),
  new Card("H", "3"),
  new Card("S", "Q"),
];

const testHand6 = [
  new Card("S", "2"),
  new Card("C", "2"),
  new Card("D", "3"),
  new Card("H", "3"),
  new Card("S", "3"),
  new Card("C", "8"),
  new Card("H", "8"),
];

const testHand7 = [
  new Card("S", "2"),
  new Card("C", "2"),
  new Card("D", "3"),
  new Card("H", "3"),
  new Card("S", "3"),
  new Card("C", "9"),
  new Card("H", "A"),
];

const testHand8 = [
  new Card("S", "4"),
  new Card("C", "4"),
  new Card("D", "4"),
  new Card("H", "8"),
  new Card("S", "8"),
  new Card("C", "8"),
  new Card("H", "A"),
];

const testHand9 = [
  new Card("S", "2"),
  new Card("C", "4"),
  new Card("D", "4"),
  new Card("H", "4"),
  new Card("S", "7"),
  new Card("C", "8"),
  new Card("H", "A"),
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

  //This is for testing specific hands
  //   sorted = testHand9;

  //prepare all of the data we need to determine the hand score
  analyzeHand(sorted);

  // Check for a Royal Flush, Straight Flush, or Flush
  if (checkFlush(sorted)) {
    return [rankName, rank, rankCards];
  }
  console.log(duplicates);
  // Check for a Four of a Kind
  if (checkFourOfAKind(sorted)) {
    return { rankName, rank, rankCards };
  }

  // Check for a Three of a Kind or Full House

  if (checkThreeOfAKind(sorted)) {
    return { rankName, rank, rankCards };
  }

  return "Not a Winner";
}

//Many hands leave room for extra cards to be included in the mix. Such as having a Pair:
// Both players could have the same pair, and so the tiebreaker is decided by whoever has the highest card.
// This function determines how much a player's had is worth based on the value of thier highest cards.
function evaluateRankByHighestCards(
  arrayOfCards,
  excludedCard1 = -1,
  excludedCard2 = -1,
  limitCheck = 7, // The most cards we can expect are 7
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
    if (i >= limitCheck - 1) {
      break;
    }
  }

  return sum / normalize;
}

// Before we get into determining if a hand is worth anything, we should identify cards that match by face value or by suit.
// We also grab some other metrics within this function.
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
  rank = 0;
  rankCards = [];

  //grab the highest value represented
  maxCardValue = sortedCards[sortedCards.length - 1].numericValue;
  for (let i = 0; i < sortedCards.length - 1; i++) {
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

  // If we find any matching cards, we want to save how many and what the card value is.
  if (dupCount > 1) {
    currentCardValue = nextCardValue;
    duplicates.push({ dupCount, currentCardValue });
  }

  // Finally, to make the matches easier to work with, we will move the highest number of matches to the front of the array
  duplicates.sort((a, b) => {
    return b.dupCount - a.dupCount;
  });
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

// Only checks for a Four of a kind, and the score it returns is simply the those four cards plus the highest other card available.
function checkFourOfAKind(sortedCards) {
  if (duplicates.length > 0 && duplicates[0].dupCount === 4) {
    rankName = "Four of a Kind";
    rank =
      700 +
      (duplicates[0].currentCardValue / 14) * 50 +
      evaluateRankByHighestCards(
        sortedCards,
        duplicates[0].currentCardValue, // leave out the cards included in the Four of a Kind
        -1,
        1 // We only want the single highest card other than the Four of a Kind to be included.
      );
    rankCards = sortedCards.slice(-5);
    return true;
  }
  return false;
}

// This function will check for a Three of a Kind, and also do another check for a Full House.
// A Full House is a three of a Kind and a Pair. If there are two Pairs available, it picks the highest valued Pair.
// If only a Three of a Kind is found, the score includes those cards plus the two highest valued cards left.
function checkThreeOfAKind(sortedCards) {
  if (duplicates.length > 0 && duplicates[0].dupCount === 3) {
    // check if a Full House is present
    // First Edge Case: if there are two Pair available, take the highest pair
    if (
      duplicates.length > 2 &&
      duplicates[0].dupCount === 3 &&
      duplicates[1].dupCount === 2 &&
      duplicates[2].dupCount === 2
    ) {
      rankName = "Full House";
      let highestPairValue = Math.max(
        duplicates[1].currentCardValue,
        duplicates[2].currentCardValue
      );
      rank = 600 + duplicates[0].currentCardValue + highestPairValue / 14;
      let tempThree = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[0].currentCardValue) {
          return true;
        }
      });
      let tempTwo = sortedCards.filter((card) => {
        if (card.numericValue === highestPairValue) {
          return true;
        }
      });

      rankCards = tempThree.concat(tempTwo);
    }
    //Look at a normal Full House
    else if (
      duplicates.length > 1 &&
      duplicates[0].dupCount === 3 &&
      duplicates[1].dupCount === 2
    ) {
      rankName = "Full House";
      rank =
        600 +
        duplicates[0].currentCardValue +
        duplicates[1].currentCardValue / 14;
      let tempThree = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[0].currentCardValue) {
          return true;
        }
      });
      let tempTwo = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[1].currentCardValue) {
          return true;
        }
      });

      rankCards = tempThree.concat(tempTwo);
    }
    // Second Edge Case: Two sets of Three of a Kind
    else if (
      duplicates.length > 1 &&
      duplicates[0].dupCount === 3 &&
      duplicates[1].dupCount === 3
    ) {
      rankName = "Full House";
      let rank1 =
        600 +
        duplicates[0].currentCardValue +
        duplicates[1].currentCardValue / 14;
      let rank2 =
        600 +
        duplicates[1].currentCardValue +
        duplicates[0].currentCardValue / 14;

      if (rank1 > rank2) {
        rank = rank1;
        let tempThree = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[0].currentCardValue) {
            return true;
          }
        });
        let tempTwo = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[1].currentCardValue) {
            return true;
          }
        });

        rankCards = tempThree.concat(tempTwo.slice(-2));
      } else {
        rank = rank2;
        let tempThree = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[1].currentCardValue) {
            return true;
          }
        });
        let tempTwo = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[0].currentCardValue) {
            return true;
          }
        });

        rankCards = tempThree.concat(tempTwo.slice(-2));
      }
    } else if (duplicates.length === 1 && duplicates[0].dupCount === 3) {
      rankName = "Three of a Kind";
      rank =
        300 +
        (duplicates[0].currentCardValue / 14) *
          (50 +
            evaluateRankByHighestCards(
              sortedCards,
              duplicates[0].currentCardValue,
              -1,
              2 // We only want to two highest cards other than the triple
            ));

      let tempThree = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[0].currentCardValue) {
          return true;
        }
      });
      let tempTwo = sortedCards.filter((card) => {
        if (card.numericValue != duplicates[0].currentCardValue) {
          return true;
        }
      });

      rankCards = tempThree.concat(tempTwo.slice(-2));
    }

    return true;
  }
}
