import Card from "./card.js";

const SUITS = ["S", "C", "D", "H"];

const testHand = [
  new Card("H", "2"),
  new Card("H", "4"),
  new Card("H", "6"),
  new Card("H", "8"),
  new Card("H", "T"),
  new Card("D", "Q"),
  new Card("H", "A"),
];

let dupCount = 1;
let seqCount = 1;
let seqCountMax = 1;
let maxCardValue = -1;
let seqMaxValue = -1;
let cardValue = -1;
let nextCardValue = -1;
let duplicates = [];
let handName = "";
let score = 0;
let hand = [];

export default function getPlayerHandRank(playerCards, tableCards) {
  //create and initialize the needed variables

  //combine the cards into one array and sort them by the card values
  let sorted = playerCards.concat(tableCards).sort((a, b) => {
    return a.numericValue - b.numericValue;
  });

  //This is for testing specific hands
  // sorted = testHand;

  //prepare all of the data we need to determine the handName score
  analyzeHand(sorted);

  // Check for a Royal Flush, Straight Flush, or Flush
  if (checkFlush(sorted)) {
    return { handName, score, hand };
  }

  // Check for a Four of a Kind
  if (checkFourOfAKind(sorted)) {
    return { handName, score, hand };
  }

  if (checkForStraight(sorted)) {
    return { handName, score, hand };
  }

  // Check for a Three of a Kind or Full House
  if (checkThreeOfAKind(sorted)) {
    return { handName, score, hand };
  }

  // Check for a Pair or Two Pairs
  if (checkPairs(sorted)) {
    return { handName, score, hand };
  }

  // No valid hands, so we play High Card
  handName = "High Card";
  score = evaluateRankByHighestCards(sorted.slice(-5));
  hand = sorted.slice(-5);
  return { handName, score, hand };
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
  for (let i = arrayOfCards.length - 1; i >= 0; i--) {
    let cardValue = arrayOfCards[i].numericValue;
    if (cardValue == excludedCard1 || cardValue == excludedCard2) {
      continue;
    }
    let normalizedValue = cardValue - 2;
    sum += normalizedValue * Math.pow(13, 5 - i);
    if (i >= limitCheck - 1) {
      break;
    }
  }

  return sum / normalize;
}

// Before we get into determining if a handName is worth anything, we should identify cards that match by face value.
// We also grab some other metrics within this function.
function analyzeHand(sortedCards) {
  //reset the variables
  dupCount = 1;
  seqCount = 1;
  seqCountMax = 1;
  maxCardValue = -1;
  seqMaxValue = -1;
  cardValue = -1;
  nextCardValue = -1;
  duplicates = [];
  handName = "";
  score = 0;
  hand = [];

  //grab the highest value represented
  maxCardValue = sortedCards[sortedCards.length - 1].numericValue;
  for (let i = 0; i < sortedCards.length - 1; i++) {
    cardValue = sortedCards[i].numericValue;
    nextCardValue = sortedCards[i + 1].numericValue;

    //check for duplicates
    if (cardValue == nextCardValue) {
      dupCount++;
    } else if (dupCount > 1) {
      duplicates.push({ dupCount, cardValue });
      dupCount = 1;
    }

    if (cardValue + 1 == nextCardValue) {
      seqCount++;
    } else if (cardValue != nextCardValue) {
      if (seqCount > seqCountMax) {
        seqCountMax = seqCount;
        seqMaxValue = cardValue;
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
    cardValue = nextCardValue;
    duplicates.push({ dupCount, cardValue });
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
      } else {
        counter = 1;
      }
    }
    if (counter >= 5) {
      handName = "Straight Flush";
      score = 800 + (lastValue / 14) * 99;
      if (checkRoyalFlush(suitedCards)) {
        handName = "Royal Flush";
        score = 900;
        hand = sortedCards.slice(-5);
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
      handName = "Straight Flush";
      score = 800 + (5 / 14) * 99;
      hand = sortedCards
        .filter((card) => {
          if (suit === card.suit) {
            return true;
          }
        })
        .slice(-5);
      return;
    } else if (suitedCards.length >= 5) {
      handName = "Flush";
      score = 500 + evaluateRankByHighestCards(suitedCards.slice(-5));
      hand = suitedCards.slice(-5);
    }
  });
  if (score > 0) return true;
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
    handName = "Four of a Kind";
    score =
      700 +
      (duplicates[0].cardValue / 14) * 50 +
      evaluateRankByHighestCards(
        sortedCards,
        duplicates[0].cardValue, // leave out the cards included in the Four of a Kind
        -1,
        1 // We only want the single highest card other than the Four of a Kind to be included.
      );
    hand = sortedCards.slice(-5);
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
      handName = "Full House";
      let highestPairValue = Math.max(
        duplicates[1].cardValue,
        duplicates[2].cardValue
      );
      score = 600 + duplicates[0].cardValue + highestPairValue / 14;
      let tempThree = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[0].cardValue) {
          return true;
        }
      });
      let tempTwo = sortedCards.filter((card) => {
        if (card.numericValue === highestPairValue) {
          return true;
        }
      });

      hand = tempThree.concat(tempTwo);
    }
    //Look at a normal Full House
    else if (
      duplicates.length > 1 &&
      duplicates[0].dupCount === 3 &&
      duplicates[1].dupCount === 2
    ) {
      handName = "Full House";
      score = 600 + duplicates[0].cardValue + duplicates[1].cardValue / 14;
      let tempThree = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[0].cardValue) {
          return true;
        }
      });
      let tempTwo = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[1].cardValue) {
          return true;
        }
      });

      hand = tempThree.concat(tempTwo);
    }
    // Second Edge Case: Two sets of Three of a Kind
    else if (
      duplicates.length > 1 &&
      duplicates[0].dupCount === 3 &&
      duplicates[1].dupCount === 3
    ) {
      handName = "Full House";
      let rank1 =
        600 + (duplicates[0].cardValue + duplicates[1].cardValue) / 14;
      let rank2 =
        600 + (duplicates[1].cardValue + duplicates[0].cardValue) / 14;

      if (rank1 > rank2) {
        score = rank1;
        let tempThree = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[0].cardValue) {
            return true;
          }
        });
        let tempTwo = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[1].cardValue) {
            return true;
          }
        });

        hand = tempThree.concat(tempTwo.slice(-2));
      } else {
        score = rank2;
        let tempThree = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[1].cardValue) {
            return true;
          }
        });
        let tempTwo = sortedCards.filter((card) => {
          if (card.numericValue === duplicates[0].cardValue) {
            return true;
          }
        });

        hand = tempThree.concat(tempTwo.slice(-2));
      }
    } else if (duplicates.length === 1 && duplicates[0].dupCount === 3) {
      handName = "Three of a Kind";
      score =
        300 +
        (duplicates[0].cardValue / 14) *
          (50 +
            evaluateRankByHighestCards(
              sortedCards,
              duplicates[0].cardValue,
              -1,
              2 // We only want to two highest cards other than the triple
            ));

      let tempThree = sortedCards.filter((card) => {
        if (card.numericValue === duplicates[0].cardValue) {
          return true;
        }
      });
      let tempTwo = sortedCards.filter((card) => {
        if (card.numericValue != duplicates[0].cardValue) {
          return true;
        }
      });

      hand = tempThree.concat(tempTwo.slice(-2));
    }

    return true;
  }
}

function checkForStraight(sortedCards) {
  if (seqCountMax >= 5) {
    handName = "Straight";
    score = 400 + (seqMaxValue / 14) * 99;
    hand = sortedCards;
    return true;
  }
  // Edge case: if the straight is A,2,3,4,5 we need to recognize that using seqCountMax == 4, seqMaxValue == 5, and at least one Ace in the handName.
  else if (seqCountMax === 4 && seqMaxValue === 5 && maxCardValue === 14) {
    handName = "Straight";
    score = 400 + (5 / 14) * 99;
    hand = sortedCards;
    return true;
  }
}

// This function checks for a Pair, or Two Pairs. In a Pair, the other three slots will be filled with the three highest cards for the scoring.
// In a Two Pair, the highest card left will be added for the scoring.
function checkPairs(sortedCards) {
  if (
    duplicates.length > 1 &&
    duplicates[0].dupCount === 2 &&
    duplicates[1].dupCount === 2
  ) {
    handName = "Two Pairs";

    //Edge Case: if there are three pairs, we want the two highest pairs
    if (duplicates.length > 2 && duplicates[2].dupCount === 2) {
      let temp = duplicates;
      temp.sort((a, b) => {
        return b.cardValue - a.cardValue;
      });
      score =
        200 +
        (Math.pow(temp[0].cardValue, 2) / 392 +
          (Math.pow(temp[1].cardValue, 2) / 392) * 50) +
        evaluateRankByHighestCards(
          sortedCards,
          temp[0].cardValue, // exclude first pair
          temp[1].cardValue, // exclude second pair
          1 // only get the next highest card
        );
      hand = sortedCards.slice(-5);
    } else {
      score =
        200 +
        (Math.pow(duplicates[0].cardValue, 2) / 392 +
          (Math.pow(duplicates[1].cardValue, 2) / 392) * 50) +
        evaluateRankByHighestCards(
          sortedCards,
          duplicates[0].cardValue, // exclude first pair
          duplicates[1].cardValue, // exclude second pair
          1 // only get the next highest card
        );

      let temp = sortedCards.filter((card) => {
        if (
          card.numericValue === duplicates[0].cardValue ||
          card.numericValue === duplicates[1].cardValue
        ) {
          return true;
        }
      });
      let temp2 = sortedCards.filter((card) => {
        if (
          card.numericValue != duplicates[0].cardValue &&
          card.numericValue != duplicates[1].cardValue
        ) {
          return true;
        }
      });
      hand = temp.concat(temp2.slice(-1));
    }
    return true;
  }
  // Check for one Pair
  else if (duplicates.length > 0 && duplicates[0].dupCount === 2) {
    handName = "Pair";
    score =
      100 +
      (duplicates[0].cardValue / 14) * 50 +
      evaluateRankByHighestCards(sortedCards, duplicates[0].cardValue, -1, 3);
    let temp = sortedCards.filter((card) => {
      if (card.numericValue === duplicates[0].cardValue) {
        return true;
      }
    });
    let temp2 = sortedCards.filter((card) => {
      if (card.numericValue != duplicates[0].cardValue) {
        return true;
      }
    });
    hand = temp.concat(temp2.slice(-3));
    return true;
  }
}
