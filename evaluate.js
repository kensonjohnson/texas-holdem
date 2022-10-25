import Card from "./card.js";

const SPADES = "S";
const CLUBS = "C";
const DIAMONDS = "D";
const HEARTS = "H";

const testHand = [
  new Card("S", "5"),
  new Card("S", "5"),
  new Card("S", "9"),
  new Card("S", "J"),
  new Card("S", "Q"),
  new Card("S", "K"),
  new Card("S", "A"),
];

class HandStats {
  constructor(
    dupCount,
    seqCount,
    seqCountMax,
    maxCardValue,
    seqMaxValue,
    duplicates,
    spades,
    clubs,
    diamonds,
    hearts
  ) {
    this.dupCount = dupCount;
    this.seqCount = seqCount;
    this.seqCountMax = seqCountMax;
    this.maxCardValue = maxCardValue;
    this.seqMaxValue = seqMaxValue;
    this.duplicates = duplicates;
    this.spades = spades;
    this.clubs = clubs;
    this.diamonds = diamonds;
    this.hearts = hearts;
    this.handName = "";
    this.score = 0;
    this.hand = [];
  }
}

export default function checkPlayerHand(playerCards, tableCards) {
  //create and initialize the needed variables
  let results = {};

  //combine the cards into one array and sort them by the card values
  let sorted = playerCards.concat(tableCards).sort((a, b) => {
    return a.numericValue - b.numericValue;
  });

  //This is for testing specific hands
  // sorted = testHand;

  //prepare all of the data we need to determine the handName score
  const handStats = analyzeHand(sorted);

  // Check for a Royal Flush, Straight Flush, or Flush
  results = checkRoyalFlush(handStats);
  if (results != null) {
    return results;
  }

  results = checkStraightFlush(handStats);
  if (results != null) {
    return results;
  }

  results = checkFourOfAKind(handStats, sorted);
  if (results != null) {
    return results;
  }

  results = checkFullHouse(handStats, sorted);
  if (results != null) {
    return results;
  }

  results = checkFlush(handStats);
  if (results != null) {
    return results;
  }

  results = checkStraight(handStats, sorted);
  if (results != null) {
    return results;
  }

  results = checkThreeOfAKind(handStats, sorted);
  if (results != null) {
    return results;
  }

  results = checkTwoPair(handStats, sorted);
  if (results != null) {
    return results;
  }

  results = checkPair(handStats, sorted);
  if (results != null) {
    return results;
  }

  // No valid hands, so we play High Card
  let handName = "High Card";
  let score = evaluateRankByHighestCards(sorted);
  let hand = sorted.slice(-5);
  return { handName, score, hand };
}

//Many hands leave room for extra cards to be included in the mix. Such as having a Pair:
// Both players could have the same pair, and so the tiebreaker is decided by whoever has the highest card.
// This function determines how much a player's had is worth based on the value of the highest cards.
function evaluateRankByHighestCards(
  arrayOfCards,
  excludedCard1 = -1,
  excludedCard2 = -1,
  limitCheck = 5 // The most we will ever want is a 5 card hand
) {
  const normalize = 55000; // this brings the final sum back down to a number between 0 and 1
  let sum = 0;
  for (let i = arrayOfCards.length - 1; i >= 0; i--) {
    let cardValue = arrayOfCards[i].numericValue;
    if (cardValue == excludedCard1 || cardValue == excludedCard2) {
      continue;
    }
    let normalizedValue = cardValue - 2;
    sum += normalizedValue * Math.pow(13, arrayOfCards.length - i);
    if (arrayOfCards.length - i >= limitCheck) {
      break;
    }
  }

  return sum / normalize;
}

// Before we get into determining if a handName is worth anything, we should identify cards that match by face value.
// We also grab some other metrics within this function.
function analyzeHand(sortedCards) {
  //reset the variables
  let dupCount = 1;
  let seqCount = 1;
  let seqCountMax = 1;
  let maxCardValue = -1;
  let seqMaxValue = -1;
  let cardValue = -1;
  let nextCardValue = -1;
  let duplicates = [];

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
    if (b.dupCount === a.dupCount) {
      return b.cardValue - a.cardValue;
    }
    return b.dupCount - a.dupCount;
  });

  let spades = sortedCards.filter((card) => {
    if (card.suit === SPADES) return true;
  });

  let clubs = sortedCards.filter((card) => {
    if (card.suit === CLUBS) return true;
  });

  let diamonds = sortedCards.filter((card) => {
    if (card.suit === DIAMONDS) return true;
  });

  let hearts = sortedCards.filter((card) => {
    if (card.suit === HEARTS) return true;
  });

  return new HandStats(
    dupCount,
    seqCount,
    seqCountMax,
    maxCardValue,
    seqMaxValue,
    duplicates,
    spades,
    clubs,
    diamonds,
    hearts
  );
}

function checkRoyalFlush(stats) {
  if (royalFlushHelper(stats.spades)) {
    return { handName: "Royal Flush", score: 900, hand: spades.slice(-5) };
  }

  if (royalFlushHelper(stats.clubs)) {
    return { handName: "Royal Flush", score: 900, hand: clubs.slice(-5) };
  }

  if (royalFlushHelper(stats.diamonds)) {
    return { handName: "Royal Flush", score: 900, hand: diamonds.slice(-5) };
  }

  if (royalFlushHelper(stats.hearts)) {
    return { handName: "Royal Flush", score: 900, hand: hearts.slice(-5) };
  }

  return null;
}

function royalFlushHelper(suitedCards) {
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

function checkStraightFlush(stats) {
  let results = null;
  let handName = "";
  let score = 0;
  let hand = [];

  results = straightFlushHelper(stats.spades);
  if (results != null) {
    handName = "Straight Flush";
    score = 800 + (results.highestValue / 14) * 99;
    hand = results.hand;

    return { handName, score, hand };
  }

  results = straightFlushHelper(stats.clubs);
  if (results != null) {
    handName = "Straight Flush";
    score = 800 + (results.highestValue / 14) * 99;
    hand = results.hand;

    return { handName, score, hand };
  }

  results = straightFlushHelper(stats.diamonds);
  if (results != null) {
    handName = "Straight Flush";
    score = 800 + (results.highestValue / 14) * 99;
    hand = results.hand;

    return { handName, score, hand };
  }

  results = straightFlushHelper(stats.hearts);
  if (results != null) {
    handName = "Straight Flush";
    score = 800 + (results.highestValue / 14) * 99;
    hand = results.hand;

    return { handName, score, hand };
  }

  return null;
}

function straightFlushHelper(suitedCards) {
  let counter = 1;
  let counterMax = 1;
  let highestValue = -1;
  let hand = [];

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
  if (counter > 4) {
    hand = suitedCards.filter((card) => {
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
    hand = suitedCards.slice(0, 4).concat(suitedCards[suitedCards.length - 1]);
    return { highestValue, hand };
  }
  return null;
}

function checkFourOfAKind(stats, sortedCards) {
  if (stats.duplicates.length > 0 && stats.duplicates[0].dupCount === 4) {
    let handName = "Four of a Kind";
    let score =
      700 +
      (stats.duplicates[0].cardValue / 14) * 99 +
      evaluateRankByHighestCards(
        sortedCards,
        stats.duplicates[0].cardValue, // leave out the cards included in the Four of a Kind
        -1,
        1 // We only want the single highest card other than the Four of a Kind to be included.
      );

    let highCard = sortedCards
      .filter((card) => {
        if (card.numericValue != stats.duplicates[0].cardValue) return true;
      })
      .slice(-1);
    let hand = sortedCards
      .filter((card) => {
        if (card.numericValue === stats.duplicates[0].cardValue) return true;
      })
      .concat(highCard);
    return { handName, score, hand };
  }
  return null;
}

function checkFullHouse(stats, sortedCards) {
  const duplicates = stats.duplicates;
  let handName = "";
  let score = 0;
  let hand = [];

  //Second Edge Case: Two sets of Three of a Kind. Take the best three of a kind, the other becomes a pair.
  if (
    duplicates.length > 1 &&
    duplicates[0].dupCount === 3 &&
    duplicates[1].dupCount === 3
  ) {
    handName = "Full House";

    let score =
      600 + duplicates[0].cardValue * 7 + duplicates[1].cardValue / 14;

    let tempTriple = sortedCards.filter((card) => {
      if (card.numericValue === duplicates[0].cardValue) {
        return true;
      }
    });

    let tempPair = sortedCards.filter((card) => {
      if (card.numericValue === duplicates[1].cardValue) {
        return true;
      }
    });

    hand = tempTriple.concat(tempPair.slice(-2));

    return { handName, score, hand };
  }

  //Finally, check for a normal Full House situation
  if (
    duplicates.length > 1 &&
    duplicates[0].dupCount === 3 &&
    duplicates[1].dupCount === 2
  ) {
    handName = "Full House";
    score = 600 + duplicates[0].cardValue * 7 + duplicates[1].cardValue / 14;
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
    return { handName, score, hand };
  }
  return null;
}

function checkFlush(stats) {
  let handName = "";
  let score = 0;
  let hand = [];
  if (stats.spades.length > 4) {
    handName = "Flush";
    score = 500 + evaluateRankByHighestCards(stats.spades.slice(-5));
    hand = stats.spades.slice(-5);
    return { handName, score, hand };
  }

  if (stats.clubs.length > 4) {
    handName = "Flush";
    score = 500 + evaluateRankByHighestCards(stats.clubs.slice(-5));
    hand = stats.clubs.slice(-5);
    return { handName, score, hand };
  }

  if (stats.diamonds.length > 4) {
    handName = "Flush";
    score = 500 + evaluateRankByHighestCards(stats.diamonds.slice(-5));
    hand = stats.diamonds.slice(-5);
    return { handName, score, hand };
  }

  if (stats.hearts.length > 4) {
    handName = "Flush";
    score = 500 + evaluateRankByHighestCards(stats.hearts.slice(-5));
    hand = stats.hearts.slice(-5);
    return { handName, score, hand };
  }
  return null;
}

function checkStraight(stats, sortedCards) {
  if (stats.seqCountMax >= 5) {
    let handName = "Straight";
    let score = 400 + (stats.seqMaxValue / 14) * 99;
    let hand = sortedCards.filter((card) => {
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
    let hand = sortedCards.filter((card) => {
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

function checkThreeOfAKind(stats, sortedCards) {
  if (stats.duplicates.length === 1 && stats.duplicates[0].dupCount === 3) {
    let handName = "Three of a Kind";
    let score =
      300 +
      stats.duplicates[0].cardValue * 5 +
      evaluateRankByHighestCards(
        sortedCards,
        stats.duplicates[0].cardValue,
        -1,
        2 // We only want to two highest cards other than the triple
      );

    let tempTriple = sortedCards.filter((card) => {
      if (card.numericValue === stats.duplicates[0].cardValue) {
        return true;
      }
    });
    let tempTwo = sortedCards.filter((card) => {
      if (card.numericValue != stats.duplicates[0].cardValue) {
        return true;
      }
    });

    let hand = tempTriple.concat(tempTwo.slice(-2));

    return { handName, score, hand };
  }
  return null;
}

function checkTwoPair(stats, sortedCards) {
  if (stats.duplicates.length > 1) {
    let handName = "Two Pair";
    let score =
      200 +
      stats.duplicates[0].cardValue * 2 +
      stats.duplicates[1].cardValue +
      evaluateRankByHighestCards(
        sortedCards,
        stats.duplicates[0].cardValue, // exclude first pair
        stats.duplicates[1].cardValue, // exclude second pair
        1 // only get the next highest card
      );

    let tempPairs = sortedCards.filter((card) => {
      if (
        card.numericValue === stats.duplicates[0].cardValue ||
        card.numericValue === stats.duplicates[1].cardValue
      ) {
        return true;
      }
    });

    let hand = tempPairs.concat(
      sortedCards
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

function checkPair(stats, sortedCards) {
  if (stats.duplicates.length > 0) {
    let handName = "Pair";
    let score =
      100 +
      stats.duplicates[0].cardValue * 5 +
      evaluateRankByHighestCards(
        sortedCards,
        stats.duplicates[0].cardValue,
        -1,
        3
      );
    let temp = sortedCards.filter((card) => {
      if (card.numericValue === stats.duplicates[0].cardValue) {
        return true;
      }
    });
    let temp2 = sortedCards.filter((card) => {
      if (card.numericValue != stats.duplicates[0].cardValue) {
        return true;
      }
    });
    let hand = temp.concat(temp2.slice(-3));
    return { handName, score, hand };
  }
}
