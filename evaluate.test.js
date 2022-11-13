import {
  royalFlushHelper,
  checkStraightFlush,
  analyzeHand,
} from "./evaluate.js";
import Card from "./card.js";

test("A hand of AC, KC, QC, JC, TC would return true", () => {
  const testHand = [
    new Card("C", "2"),
    new Card("C", "6"),
    new Card("C", "T"),
    new Card("C", "J"),
    new Card("C", "Q"),
    new Card("C", "K"),
    new Card("C", "A"),
  ];
  expect(royalFlushHelper(testHand)).toBe(true);
});

test("Analyze Hand", () => {
  const testPlayerHand = [new Card("H", "T"), new Card("H", "A")];
  const testTableCards = [
    new Card("H", "2"),
    new Card("H", "6"),
    new Card("H", "7"),
    new Card("H", "8"),
    new Card("H", "9"),
  ];
  const handData = analyzeHand(testPlayerHand, testTableCards);
  expect(handData).not.toBeNull;
  expect(handData.duplicates).toEqual([]);
  expect(handData.seqCountMax).toBe(5);
});

test("A Straight Flush of 6H, 7H, 8H, 9H, TH", () => {
  const testPlayerHand = [new Card("H", "T"), new Card("H", "A")];
  const testTableCards = [
    new Card("H", "2"),
    new Card("H", "6"),
    new Card("H", "7"),
    new Card("H", "8"),
    new Card("H", "9"),
  ];
  const handData = analyzeHand(testPlayerHand, testTableCards);
  expect(handData).not.toBeNull;
  console.log(handData.sortedHearts);
  const results = checkStraightFlush(handData);
  expect(results).not.toBeNull;
  expect(results.score).toBeGreaterThanOrEqual(800);
  expect(results.score).toBeLessThan(900);
  expect(results.handName).toBe("Straight Flush");
});
