import Card from "./card.js";

const SPADES = "S";
const CLUBS = "C";
const DIAMONDS = "D";
const HEARTS = "H";

class HandData {
  constructor(
    duplicateCount,
    seqCount,
    seqCountMax,
    maxCardValue,
    seqMaxValue,
    duplicates,
    sortedSpades,
    sortedClubs,
    sortedDiamonds,
    sortedHearts,
    sortedCards
  ) {
    this.duplicateCount = duplicateCount;
    this.seqCount = seqCount;
    this.seqCountMax = seqCountMax;
    this.maxCardValue = maxCardValue;
    this.seqMaxValue = seqMaxValue;
    this.duplicates = duplicates;
    this.sortedSpades = sortedSpades;
    this.sortedClubs = sortedClubs;
    this.sortedDiamonds = sortedDiamonds;
    this.sortedHearts = sortedHearts;
    this.sortedCards = sortedCards;
  }
}

export default function checkPlayerHand(playerCards, tableCards) {
  let results = {};

  const handData = analyzeHand(playerCards, tableCards);

  results = checkRoyalFlush(handData);
  if (results != null) {
    return results;
  }

  results = checkStraightFlush(handData);
  if (results != null) {
    return results;
  }

  results = checkFourOfAKind(handData);
  if (results != null) {
    return results;
  }

  results = checkFullHouse(handData);
  if (results != null) {
    return results;
  }

  results = checkFlush(handData);
  if (results != null) {
    return results;
  }

  results = checkStraight(handData);
  if (results != null) {
    return results;
  }

  results = checkThreeOfAKind(handData);
  if (results != null) {
    return results;
  }

  results = checkTwoPair(handData);
  if (results != null) {
    return results;
  }

  results = checkPair(handData);
  if (results != null) {
    return results;
  }

  // No valid hands, so we play High Card
  let handName = "High Card";
  let score = evaluateRankByHighestCards(handData.sortedCards);
  let hand = handData.sortedCards.slice(-5);
  return { handName, score, hand };
}

// Many hands leave room for extra cards to be included in the mix. Such as having a Pair:
// Both players could have the same pair, and so the tiebreaker is decided by whoever has the highest card.
// This function determines how much a player's had is worth based on the value of the highest cards.

function evaluateRankByHighestCards(
  arrayOfCards,
  excludedCard1 = -1, // If this card value is found, it is skipped over in the loop.
  excludedCard2 = -1, // If this card value is found, it is skipped over in the loop.
  limitCheck = 5 // Determines the number of cards to include in the final sum.
) {
  let sum = 0;
  let passes = 0;
  for (let i = arrayOfCards.length - 1; i >= 0; i--) {
    let cardValue = arrayOfCards[i].numericValue;
    if (cardValue == excludedCard1 || cardValue == excludedCard2) {
      continue;
    }

    sum += cardValue;
    passes++;

    if (passes >= limitCheck) {
      break;
    }
  }

  return sum;
}

// Before we get into determining if a handName is worth anything, we should identify cards that match by face value.
// We also grab some other metrics within this function.
export function analyzeHand(playerCards, tableCards) {
  let duplicateCount = 1;
  let seqCount = 1;
  let seqCountMax = 1;
  let maxCardValue = -1;
  let seqMaxValue = -1;
  let cardValue = -1;
  let nextCardValue = -1;
  let duplicates = [];
  let sortedCards = playerCards.concat(tableCards).sort((a, b) => {
    return a.numericValue - b.numericValue;
  });

  //for testing specific hands only
  // const testHand = [
  //   new Card("H", "2"),
  //   new Card("H", "6"),
  //   new Card("H", "7"),
  //   new Card("H", "8"),
  //   new Card("H", "9"),
  //   new Card("H", "T"),
  //   new Card("H", "A"),
  // ];
  // sortedCards = testHand;

  //grab the highest value represented
  maxCardValue = sortedCards[sortedCards.length - 1].numericValue;
  for (let i = 0; i < sortedCards.length - 1; i++) {
    cardValue = sortedCards[i].numericValue;
    nextCardValue = sortedCards[i + 1].numericValue;

    //check for duplicates
    if (cardValue == nextCardValue) {
      duplicateCount++;
    } else if (duplicateCount > 1) {
      duplicates.push({ duplicateCount, cardValue });
      duplicateCount = 1;
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
  if (duplicateCount > 1) {
    cardValue = nextCardValue;
    duplicates.push({ duplicateCount, cardValue });
  }

  // Finally, to make the matches easier to work with, we will move the highest number of matches to the front of the array
  duplicates.sort((a, b) => {
    if (b.duplicateCount === a.duplicateCount) {
      return b.cardValue - a.cardValue;
    }
    return b.duplicateCount - a.duplicateCount;
  });

  let sortedSpades = sortedCards.filter((card) => {
    if (card.suit === SPADES) return true;
  });

  let sortedClubs = sortedCards.filter((card) => {
    if (card.suit === CLUBS) return true;
  });

  let sortedDiamonds = sortedCards.filter((card) => {
    if (card.suit === DIAMONDS) return true;
  });

  let sortedHearts = sortedCards.filter((card) => {
    if (card.suit === HEARTS) return true;
  });

  return new HandData(
    duplicateCount,
    seqCount,
    seqCountMax,
    maxCardValue,
    seqMaxValue,
    duplicates,
    sortedSpades,
    sortedClubs,
    sortedDiamonds,
    sortedHearts,
    sortedCards
  );
}

export function checkRoyalFlush(stats) {
  const suits = [
    stats.sortedSpades,
    stats.sortedClubs,
    stats.sortedDiamonds,
    stats.sortedHearts,
  ];

  for (const suit of suits) {
    if (royalFlushHelper(suit)) {
      return {
        handName: "Royal Flush",
        score: 900,
        hand: suit.slice(-5),
      };
    }
  }
  return null;
}

//make this similar to the straight flush helper
export function royalFlushHelper(suitedCards) {
  if (suitedCards.length < 5) return false;
  if (
    suitedCards[suitedCards.length - 1].numericValue == 14 &&
    suitedCards[suitedCards.length - 2].numericValue == 13 &&
    suitedCards[suitedCards.length - 3].numericValue == 12 &&
    suitedCards[suitedCards.length - 4].numericValue == 11 &&
    suitedCards[suitedCards.length - 5].numericValue == 10
  ) {
    return true;
  }
}

export function checkStraightFlush(stats) {
  const suits = [
    stats.sortedSpades,
    stats.sortedClubs,
    stats.sortedDiamonds,
    stats.sortedHearts,
  ];

  for (const suit of suits) {
    if (suit.length < 5) continue;
    let results = straightFlushHelper(suit);
    if (results != null) {
      return {
        handName: "Straight Flush",
        score: 800 + (results.highestValue / 14) * 99,
        hand: results.hand,
      };
    }
  }
  return null;
}

export function straightFlushHelper(suitedCards) {
  let counter = 1;
  let counterMax = 1;
  let highestValue = -1;

  if (suitedCards < 5) {
    return null;
  }

  for (let i = 0; i < suitedCards.length - 1; i++) {
    if (suitedCards[i].numericValue + 1 === suitedCards[i + 1].numericValue) {
      counter++;
      if (counter > counterMax) {
        counterMax = counter;
        highestValue = suitedCards[i + 1].numericValue;
      }
    } else {
      counter = 1;
    }
  }
  if (counterMax > 4) {
    let hand = suitedCards.filter((card) => {
      if (card.numericValue === highestValue) return true;
      if (card.numericValue === highestValue - 1) return true;
      if (card.numericValue === highestValue - 2) return true;
      if (card.numericValue === highestValue - 3) return true;
      if (card.numericValue === highestValue - 4) return true;
    });
    return { highestValue, hand };
  }
  // Edge Case: the Ace can be used as the starting OR final card in a straight flush:
  // Meaning that A,2,3,4,5 is a Straight and so is T,J,Q,K,A
  // We just need to check if the Ace is the last card in our suitedCards and that our counterMax made it to 4 before stopping at a card with a numeric value of 5
  else if (
    counterMax === 4 &&
    highestValue === 5 &&
    suitedCards[suitedCards.length - 1].numericValue === 14
  ) {
    let hand = suitedCards
      .slice(0, 4)
      .concat(suitedCards[suitedCards.length - 1]);
    return { highestValue, hand };
  }
  return null;
}

export function checkFourOfAKind(stats) {
  if (stats.duplicates.length > 0 && stats.duplicates[0].duplicateCount === 4) {
    let handName = "Four of a Kind";
    let score =
      700 +
      stats.duplicates[0].cardValue * 7 * 0.95 + // weighted at 95%
      evaluateRankByHighestCards(
        stats.sortedCards,
        stats.duplicates[0].cardValue, // leave out the cards included in the Four of a Kind
        -1,
        1 // We only want the single highest card other than the Four of a Kind to be included.
      ) *
        0.05; // weighted at 5%

    let highCard = stats.sortedCards
      .filter((card) => {
        if (card.numericValue != stats.duplicates[0].cardValue) return true;
      })
      .slice(-1);
    let hand = stats.sortedCards
      .filter((card) => {
        if (card.numericValue === stats.duplicates[0].cardValue) return true;
      })
      .concat(highCard);
    return { handName, score, hand };
  }
  return null;
}

export function checkFullHouse(stats) {
  if (
    stats.duplicates.length > 1 &&
    stats.duplicates[0].duplicateCount === 3 &&
    stats.duplicates[1].duplicateCount >= 2
  ) {
    let handName = "Full House";

    let score =
      600 +
      stats.duplicates[0].cardValue * 7 * 0.95 + // weighted at 95%
      stats.duplicates[1].cardValue * 7 * 0.05; // weighted at 5%

    let tempTriple = stats.sortedCards.filter((card) => {
      if (card.numericValue === stats.duplicates[0].cardValue) {
        return true;
      }
    });

    let tempPair = stats.sortedCards.filter((card) => {
      if (card.numericValue === stats.duplicates[1].cardValue) {
        return true;
      }
    });

    let hand = tempTriple.concat(tempPair.slice(-2));

    return { handName, score, hand };
  }
  return null;
}

export function checkFlush(stats) {
  const suits = [
    stats.sortedSpades,
    stats.sortedClubs,
    stats.sortedDiamonds,
    stats.sortedHearts,
  ];

  for (const suit of suits) {
    if (suit.length > 4) {
      let handName = "Flush";
      let score = 500 + evaluateRankByHighestCards(suit);
      let hand = suit.slice(-5);
      return { handName, score, hand };
    }
  }
  return null;
}

export function checkStraight(stats) {
  if (stats.seqCountMax >= 5) {
    let handName = "Straight";
    let score = 400 + (stats.seqMaxValue / 14) * 99;
    let hand = stats.sortedCards.filter((card) => {
      if (card.numericValue === stats.seqMaxValue) return true;
      if (card.numericValue === stats.seqMaxValue - 1) return true;
      if (card.numericValue === stats.seqMaxValue - 2) return true;
      if (card.numericValue === stats.seqMaxValue - 3) return true;
      if (card.numericValue === stats.seqMaxValue - 4) return true;
    });
    return { handName, score, hand };
  }
  // Edge case: if the straight is A,2,3,4,5 we need to recognize that using seqCountMax == 4, seqMaxValue == 5, and at least one Ace in the handName.
  if (
    stats.seqCountMax === 4 &&
    stats.seqMaxValue === 5 &&
    stats.maxCardValue === 14
  ) {
    let handName = "Straight";
    let score = 400 + (5 / 14) * 99;
    let hand = stats.sortedCards.filter((card) => {
      if (card.numericValue === 14) return true;
      if (card.numericValue === stats.seqMaxValue) return true;
      if (card.numericValue === stats.seqMaxValue - 1) return true;
      if (card.numericValue === stats.seqMaxValue - 2) return true;
      if (card.numericValue === stats.seqMaxValue - 3) return true;
    });
    return { handName, score, hand };
  }
  return null;
}

export function checkThreeOfAKind(stats) {
  if (
    stats.duplicates.length === 1 &&
    stats.duplicates[0].duplicateCount === 3
  ) {
    let handName = "Three of a Kind";
    let score =
      300 +
      stats.duplicates[0].cardValue * 7 * 0.95 + // weighted at 95%
      evaluateRankByHighestCards(
        stats.sortedCards,
        stats.duplicates[0].cardValue, // exclude the Three's value
        -1,
        2 // We only want to two highest cards other than the triple
      ) *
        0.05; // weighted at 5%

    let tempTriple = stats.sortedCards.filter((card) => {
      if (card.numericValue === stats.duplicates[0].cardValue) {
        return true;
      }
    });
    let tempTwo = stats.sortedCards.filter((card) => {
      if (card.numericValue != stats.duplicates[0].cardValue) {
        return true;
      }
    });

    let hand = tempTriple.concat(tempTwo.slice(-2));

    return { handName, score, hand };
  }
  return null;
}

export function checkTwoPair(stats) {
  if (stats.duplicates.length > 1) {
    let handName = "Two Pair";
    let score =
      200 +
      stats.duplicates[0].cardValue * 7 * 0.85 + // weighted at 85%
      stats.duplicates[1].cardValue * 7 * 0.1 + // weighted at 10%
      evaluateRankByHighestCards(
        stats.sortedCards,
        stats.duplicates[0].cardValue, // exclude first pair
        stats.duplicates[1].cardValue, // exclude second pair
        1 // only get the next highest card
      ) *
        0.05; // weighted at 5%

    let tempPairs = stats.sortedCards.filter((card) => {
      if (
        card.numericValue === stats.duplicates[0].cardValue ||
        card.numericValue === stats.duplicates[1].cardValue
      ) {
        return true;
      }
    });

    let hand = tempPairs.concat(
      stats.sortedCards
        .filter((card) => {
          if (
            card.numericValue != stats.duplicates[0].cardValue &&
            card.numericValue != stats.duplicates[1].cardValue
          ) {
            return true;
          }
        })
        .slice(-1)
    );

    return { handName, score, hand };
  }
}

export function checkPair(stats) {
  if (stats.duplicates.length > 0) {
    let handName = "Pair";
    let score =
      100 +
      stats.duplicates[0].cardValue * 7 * 0.95 + // weighted at 95%
      evaluateRankByHighestCards(
        stats.sortedCards,
        stats.duplicates[0].cardValue,
        -1,
        3
      ) *
        0.05; // weighted at 5%

    let temp = stats.sortedCards.filter((card) => {
      if (card.numericValue === stats.duplicates[0].cardValue) {
        return true;
      }
    });

    let temp2 = stats.sortedCards.filter((card) => {
      if (card.numericValue != stats.duplicates[0].cardValue) {
        return true;
      }
    });

    let hand = temp.concat(temp2.slice(-3));

    return { handName, score, hand };
  }
}
