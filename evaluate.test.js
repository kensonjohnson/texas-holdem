import checkPlayerHand, {
  analyzeHand,
  checkRoyalFlush,
  royalFlushHelper,
  checkStraightFlush,
  checkFourOfAKind,
  checkFullHouse,
  checkFlush,
  checkStraight,
  checkThreeOfAKind,
  checkTwoPair,
  checkPair,
} from "./evaluate.js";
import Card from "./card.js";

describe("checkPlayerHand()", () => {
  const suits = ["H", "C", "S", "D"];
  const faceValues = [
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
    "A",
  ];

  // Check for all four suits of a Royal Flush
  test("Check all combinations of Royal Flush", () => {
    suits.forEach((suit) => {
      const testPlayerHand = [new Card(suit, "T"), new Card(suit, "A")];
      const testTableCards = [
        new Card(suit, "2"),
        new Card(suit, "6"),
        new Card(suit, "J"),
        new Card(suit, "Q"),
        new Card(suit, "K"),
      ];

      const results = checkPlayerHand(testPlayerHand, testTableCards);
      expect(results).not.toBeNull;
      expect(results.score).toBe(900);
      expect(results.handName).toBe("Royal Flush");
    });
  });

  // Check all versions of a Straight Flush
  test("Check all combinations of Straight Flush", () => {
    suits.forEach((suit) => {
      for (let i = 0; i < faceValues.length - 5; i++) {
        // To simulate the player having the final card needed, one card is off suit in the player's hand
        const testPlayerHand = [
          new Card(suit === "D" ? "H" : "D", "2"),
          new Card(suit, faceValues[i]),
        ];
        // To simulate the player having the final card needed, one card is off suit on the table
        const testTableCards = [
          new Card(suit, faceValues[i + 1]),
          new Card(suit === "D" ? "H" : "D", "6"),
          new Card(suit, faceValues[i + 2]),
          new Card(suit, faceValues[i + 3]),
          new Card(suit, faceValues[i + 4]),
        ];

        const results = checkPlayerHand(testPlayerHand, testTableCards);
        expect(results.score).toBeGreaterThanOrEqual(800);
        expect(results.score).toBeLessThan(900);
        expect(results.handName).toBe("Straight Flush");
      }
    });
  });

  // Check all versions of a Four of a Kind
  test("Check all combinations of Four of a Kind", () => {
    faceValues.forEach((faceValue) => {
      // We simulate the player having some of the cards needed, and the rest on the table
      const testPlayerHand = [
        new Card("H", faceValue),
        new Card("S", faceValue),
      ];
      const testTableCards = [
        new Card("S", faceValue === "2" ? "3" : "2"), // Filler Card
        new Card("C", faceValue === "4" ? "3" : "4"), // Filler Card
        new Card("D", faceValue === "6" ? "5" : "6"), // Filler Card
        new Card("C", faceValue),
        new Card("D", faceValue),
      ];

      const results = checkPlayerHand(testPlayerHand, testTableCards);
      expect(results).not.toBeNull;
      expect(results.score).toBeGreaterThanOrEqual(700);
      expect(results.score).toBeLessThan(800);
      expect(results.handName).toBe("Four of a Kind");
    });
  });

  // Check all versions of a Full House
  test("Check all combinations of Full House", () => {
    faceValues.forEach((tripleValue) => {
      // We simulate the player having some of the cards needed, and the rest on the table
      for (let i = 1; i < faceValues.length - 1; i++) {
        if (tripleValue === faceValues[i]) {
          continue;
        }

        let fillerCard1;
        let fillerCard2;

        if (tripleValue === "2") {
          fillerCard1 = new Card("C", faceValues[i] === "3" ? "4" : "3");
        } else if (faceValues[i] === "2") {
          fillerCard1 = new Card("C", tripleValue === "3" ? "4" : "3");
        } else {
          fillerCard1 = new Card("C", "2");
        }

        if (tripleValue === "2") {
          fillerCard2 = new Card("H", faceValues[i] === "3" ? "4" : "3");
        } else if (faceValues[i] === "2") {
          fillerCard2 = new Card("H", tripleValue === "3" ? "4" : "3");
        } else {
          fillerCard2 = new Card("H", "2");
        }

        const testPlayerHand = [
          new Card("H", tripleValue),
          new Card("D", faceValues[i]),
        ];
        const testTableCards = [
          new Card("S", faceValues[i]),
          new Card("C", tripleValue),
          new Card("D", tripleValue),
          fillerCard1,
          fillerCard2,
        ];

        const results = checkPlayerHand(testPlayerHand, testTableCards);
        expect(results).not.toBeNull;
        expect(results.score).toBeGreaterThanOrEqual(600);
        expect(results.score).toBeLessThan(700);
        expect(results.handName).toBe("Full House");
      }
    });
  });
});

// test("Analyze Hand", () => {
//   const testPlayerHand = [new Card("H", "T"), new Card("H", "A")];
//   const testTableCards = [
//     new Card("H", "2"),
//     new Card("H", "6"),
//     new Card("H", "7"),
//     new Card("H", "8"),
//     new Card("H", "9"),
//   ];
//   const handData = analyzeHand(testPlayerHand, testTableCards);
//   expect(handData).not.toBeNull;
//   expect(handData.duplicates).toEqual([]); // The test hand has no duplicates.
//   expect(handData.seqCountMax).toBe(5); // The test hand has exactly 5 cards that appear in sequential order
// });

// test("Analyze Hand 2", () => {
//   const testPlayerHand = [new Card("H", "T"), new Card("H", "A")];
//   const testTableCards = [
//     new Card("H", "2"),
//     new Card("H", "6"),
//     new Card("H", "7"),
//     new Card("H", "8"),
//     new Card("C", "A"),
//   ];
//   const handData = analyzeHand(testPlayerHand, testTableCards);
//   expect(handData).not.toBeNull;
//   expect(handData.seqCountMax).toBe(3); // The test hand has exactly 3 cards that appear in sequential order
//   expect(handData.duplicates).toEqual([{ cardValue: 14, duplicateCount: 2 }]); // The test hand has no duplicates.
// });

// test("Check Royal Flush", () => {
//   const testPlayerHand = [new Card("C", "T"), new Card("C", "A")];
//   const testTableCards = [
//     new Card("S", "2"),
//     new Card("H", "6"),
//     new Card("C", "J"),
//     new Card("C", "Q"),
//     new Card("C", "K"),
//   ];
//   const handData = analyzeHand(testPlayerHand, testTableCards);
//   expect(handData).not.toBeNull;
//   const results = checkRoyalFlush(handData);
//   expect(results.score).toBe(900);
//   expect(results.handName).toBe("Royal Flush");
// });

// test("A hand of would return true from royalFlushHelper", () => {
//   const testHand = [
//     new Card("C", "2"),
//     new Card("C", "6"),
//     new Card("C", "T"),
//     new Card("C", "J"),
//     new Card("C", "Q"),
//     new Card("C", "K"),
//     new Card("C", "A"),
//   ];
//   expect(royalFlushHelper(testHand)).toBe(true);
// });

// test("A Straight Flush using 6H, 7H, 8H, 9H, TH", () => {
//   const testPlayerHand = [new Card("H", "T"), new Card("H", "A")];
//   const testTableCards = [
//     new Card("H", "2"),
//     new Card("H", "6"),
//     new Card("H", "7"),
//     new Card("H", "8"),
//     new Card("H", "9"),
//   ];
//   const handData = analyzeHand(testPlayerHand, testTableCards);
//   expect(handData).not.toBeNull;
//   const results = checkStraightFlush(handData);
//   expect(results).not.toBeNull;
//   expect(results.score).toBeGreaterThanOrEqual(800);
//   expect(results.score).toBeLessThan(900);
//   expect(results.handName).toBe("Straight Flush");
// });

// test("A Four of a Kind using 6H, 6S, 6C, 6D", () => {
//   const testPlayerHand = [new Card("H", "6"), new Card("H", "A")];
//   const testTableCards = [
//     new Card("S", "6"),
//     new Card("C", "6"),
//     new Card("D", "6"),
//     new Card("H", "8"),
//     new Card("H", "9"),
//   ];
//   const handData = analyzeHand(testPlayerHand, testTableCards);
//   expect(handData).not.toBeNull;
//   const results = checkFourOfAKind(handData);
//   expect(results).not.toBeNull;
//   expect(results.score).toBeGreaterThanOrEqual(700);
//   expect(results.score).toBeLessThan(800);
//   expect(results.handName).toBe("Four of a Kind");
// });

// test("A Full House using 8H, 8S, QC, QD, QS", () => {
//   const testPlayerHand = [new Card("H", "8"), new Card("S", "Q")];
//   const testTableCards = [
//     new Card("S", "8"),
//     new Card("C", "6"),
//     new Card("D", "Q"),
//     new Card("H", "8"),
//     new Card("C", "Q"),
//   ];
//   const handData = analyzeHand(testPlayerHand, testTableCards);
//   expect(handData).not.toBeNull;
//   const results = checkFullHouse(handData);
//   expect(results).not.toBeNull;
//   expect(results.score).toBeGreaterThanOrEqual(600);
//   expect(results.score).toBeLessThan(700);
//   expect(results.handName).toBe("Full House");
// });

test("A Flush using 2S, 4S, 6S, 8S, TS", () => {
  const testPlayerHand = [new Card("S", "8"), new Card("H", "Q")];
  const testTableCards = [
    new Card("S", "4"),
    new Card("S", "6"),
    new Card("S", "2"),
    new Card("S", "T"),
    new Card("C", "Q"),
  ];
  const handData = analyzeHand(testPlayerHand, testTableCards);
  expect(handData).not.toBeNull;
  const results = checkFlush(handData);
  expect(results).not.toBeNull;
  expect(results.score).toBeGreaterThanOrEqual(500);
  expect(results.score).toBeLessThan(600);
  expect(results.handName).toBe("Flush");
});

test("A Straight using 3S, 4H, 5C, 6D, 7S", () => {
  const testPlayerHand = [new Card("S", "Q"), new Card("S", "7")];
  const testTableCards = [
    new Card("H", "4"),
    new Card("S", "3"),
    new Card("D", "6"),
    new Card("S", "T"),
    new Card("C", "5"),
  ];
  const handData = analyzeHand(testPlayerHand, testTableCards);
  expect(handData).not.toBeNull;
  const results = checkStraight(handData);
  expect(results).not.toBeNull;
  expect(results.score).toBeGreaterThanOrEqual(400);
  expect(results.score).toBeLessThan(500);
  expect(results.handName).toBe("Straight");
});

test("A Three of a Kind using 9S, 9H, 9C", () => {
  const testPlayerHand = [new Card("H", "9"), new Card("S", "9")];
  const testTableCards = [
    new Card("H", "4"),
    new Card("S", "3"),
    new Card("D", "6"),
    new Card("C", "9"),
    new Card("C", "5"),
  ];
  const handData = analyzeHand(testPlayerHand, testTableCards);
  expect(handData).not.toBeNull;
  const results = checkThreeOfAKind(handData);
  expect(results).not.toBeNull;
  expect(results.score).toBeGreaterThanOrEqual(300);
  expect(results.score).toBeLessThan(400);
  expect(results.handName).toBe("Three of a Kind");
});

test("A Two Pair using 3S, 3H, TC, TD", () => {
  const testPlayerHand = [new Card("S", "3"), new Card("S", "7")];
  const testTableCards = [
    new Card("H", "4"),
    new Card("H", "3"),
    new Card("D", "T"),
    new Card("C", "T"),
    new Card("C", "5"),
  ];
  const handData = analyzeHand(testPlayerHand, testTableCards);
  expect(handData).not.toBeNull;
  const results = checkTwoPair(handData);
  expect(results).not.toBeNull;
  expect(results.score).toBeGreaterThanOrEqual(200);
  expect(results.score).toBeLessThan(300);
  expect(results.handName).toBe("Two Pair");
});

test("A Two Pair using KS, KH", () => {
  const testPlayerHand = [new Card("S", "K"), new Card("S", "7")];
  const testTableCards = [
    new Card("H", "K"),
    new Card("H", "3"),
    new Card("D", "T"),
    new Card("C", "2"),
    new Card("C", "5"),
  ];
  const handData = analyzeHand(testPlayerHand, testTableCards);
  expect(handData).not.toBeNull;
  const results = checkPair(handData);
  expect(results).not.toBeNull;
  expect(results.score).toBeGreaterThanOrEqual(100);
  expect(results.score).toBeLessThan(200);
  expect(results.handName).toBe("Pair");
});
