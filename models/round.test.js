"use strict";

import { Round, Team } from "./round.js";

export default function() {
  QUnit.module("round", function() {
    QUnit.test("setup", function(assert) {
      let round = new Round();
      assert.strictEqual(round.points, 2, "initial points");
      assert.strictEqual(round.winner, null, "no initial winner");
      assert.false(round.decided, "initially undecided");
      assert.true(round.canRaise(Team.We), "we initially can raise");
      assert.true(round.canRaise(Team.They), "they initially can raise");
    });

    QUnit.test("invalid constructor", function(assert) {
      assert.throws(
        function() {new Round("nope", "absolutely", "not"); },
        new TypeError("unknown form of Round constructor"));
    });

    QUnit.test("immediate victory", function(assert) {
      let round = new Round();
      round.winner = Team.We;
      assert.strictEqual(round.points, 2, "initial points");
      assert.true(round.decided, "there is a winner");
      assert.strictEqual(round.winner, Team.We, "correct winner");
      assert.false(round.canRaise(Team.We), "cannot raise finished game");
      assert.false(round.canRaise(Team.They), "cannot raise finished game");
    });

    QUnit.test("multiple victories", function(assert) {
      let round = new Round();
      round.winner = Team.They;
      assert.throws(
        function() { round.winner = Team.We; },
        new Error("decided round cannot be won again"),
        "victory cannot be stolen");
    });

    QUnit.test("single raise", function(assert) {
      let round = new Round();
      round.raise(Team.We);
      assert.strictEqual(round.points, 3, "raised points");
      assert.false(round.canRaise(Team.We), "raising team cannot raise");
      assert.true(round.canRaise(Team.They), "other team can raise");
    });

    QUnit.test("double raise", function(assert) {
      let round = new Round();
      round.raise(Team.We);
      round.raise(Team.They);
      assert.strictEqual(round.points, 4, "raised points");
      assert.true(round.canRaise(Team.We), "first raiser can raise");
      assert.false(round.canRaise(Team.They), "second raiser cannot raise");
    });

    QUnit.test("raise to eleven and above", function(assert) {
      let round = new Round();
      round.raise(Team.We); // 3
      round.raise(Team.They); // 4
      round.raise(Team.We); // 5
      round.raise(Team.They); // 6
      round.raise(Team.We); // 7
      round.raise(Team.They); // 8
      round.raise(Team.We); // 9

      round.raise(Team.They); // 10
      assert.strictEqual(round.points, 10, "points before limit are reached");
      assert.false(round.decided, "round is not decided before limit");

      round.raise(Team.We); // 11
      assert.strictEqual(round.points, 11, "points limit is reached");
      assert.false(round.decided, "round is not decidid at limit");

      round.raise(Team.They); // 12
      assert.strictEqual(round.points, 11, "no invalid raise");
      assert.true(round.decided, "round is decided");
      assert.strictEqual(round.winner, Team.We, "we team won");
      assert.false(round.canRaise(Team.We), "winner cannot raise");
      assert.false(round.canRaise(Team.They), "looser cannot raise");
    });

    QUnit.test("raise to lower limit and above", function(assert) {
      let round = new Round(3, 4);
      round.raise(Team.We); // 3
      assert.strictEqual(round.points, 3, "our points limit is reached");
      assert.false(round.decided, "round is not decidid at our limit");

      round.raise(Team.They); // 4
      assert.strictEqual(round.points, 4, "their points limit is reached");
      assert.false(round.decided, "round is not decidid at their limit");

      round.raise(Team.We); // 5
      assert.strictEqual(round.points, 4, "no invalid raise");
      assert.true(round.decided, "round is decided");
      assert.strictEqual(round.winner, Team.They, "they team won");
      assert.false(round.canRaise(Team.We), "looser cannot raise");
      assert.false(round.canRaise(Team.They), "winner cannot raise");
    });

    QUnit.test("victory causes event", function(assert) {
      let round = new Round();
      round.addEventListener(Round.winEvent, function() {
        assert.step("event");
      });
      round.winner = Team.We;
      assert.verifySteps(["event"], "event was triggered");
    });

    QUnit.test("toStruct - unfinished", function(assert) {
      let round = new Round();
      let struct = round.toStruct();

      let expected = {
        points: 2,
        raisedLast: null,
        winner: null,
        ourLimit: 11,
        theirLimit: 11,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("toStruct - finished", function(assert) {
      let round = new Round(4, 3);
      round.raise(Team.We);
      round.raise(Team.They);
      let struct = round.toStruct();

      let expected = {
        points: 3,
        raisedLast: Team.We,
        winner: Team.We,
        ourLimit: 4,
        theirLimit: 3,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("fromStruct - current", function(assert) {
      let orig = new Round(3, 3);
      orig.raise(Team.We);

      let copy = new Round(orig.toStruct());
      assert.strictEqual(copy.points, orig.points, "points match");
      assert.strictEqual(
        copy.canRaise(Team.We),
        orig.canRaise(Team.We),
        "can we raise matches");
      assert.strictEqual(
        copy.canRaise(Team.They),
        orig.canRaise(Team.They),
        "can they raise matches");

      orig.winner = Team.They;
      copy = new Round(orig.toStruct());
      assert.strictEqual(copy.winner, orig.winner, "winners match");
    });

    QUnit.test("fromStruct - invalid", function(assert) {
      let struct = {};
      function doIt(message, error) {
        assert.throws(function() { new Round(struct); }, error, message);
      }

      doIt("no points", new TypeError("struct must contain points as number"));
      struct.points = "2";
      doIt(
        "string points",
        new TypeError("struct must contain points as number"));
      struct.points = 1.5;
      doIt(
        "non-int points",
        new RangeError("struct must contain points >= 2 as integer"));
      struct.points = 1;
      doIt(
        "small points",
        new RangeError("struct must contain points >= 2 as integer"));
      struct.points = 2;

      doIt("no raisedLast", new TypeError("struct must contain raisedLast"));
      struct.raisedLast = "we";
      doIt(
        "string raisedLast",
        new TypeError("struct must contain raisedLast as Team or null"));
      struct.raisedLast = -1;
      doIt(
        "raisedLast not actual team",
        new TypeError("struct must contain raisedLast as Team or null"));
      struct.raisedLast = null;

      doIt("no winner", new TypeError("struct must contain winner"));
      struct.winner = "they";
      doIt(
        "string winner",
        new TypeError("struct must contain winner as Team or null"));
      struct.winner = -1;
      doIt(
        "winner not actual team",
        new TypeError("struct must contain winner as Team or null"));
      struct.winner = null;

      doIt(
        "no ourLimit",
        new TypeError("struct must contain ourLimit as number"));
      struct.ourLimit = "11";
      doIt(
        "string ourLimit",
        new TypeError("struct must contain ourLimit as number"));
      struct.ourLimit = 1;
      doIt(
        "small ourLimit",
        new RangeError("struct must contain ourLimit >= 2 as integer"));
      struct.ourLimit = 11;

      doIt(
        "no theirLimit",
        new TypeError("struct must contain theirLimit as number"));
      struct.theirLimit = "11";
      doIt(
        "string theirLimit",
        new TypeError("struct must contain theirLimit as number"));
      struct.theirLimit = 1;
      doIt(
        "small theirLimit",
        new RangeError("struct must contain theirLimit >= 2 as integer"));
      struct.theirLimit = 11;

      new Round(struct);
    });

    // Data Import Tests
    // =================
    //
    // The tests named "fromStruct - vXX - XXXXX" are there to ensure that
    // future versions of the `Round` class still can correctly read in the
    // structural data exported by earlier versions. This is needed to ensure
    // that the data remains usable.
    //
    // These tests work by importing an old structural object, and then
    // exporting a new one. The new one should match with how the current
    // implementation would represent the same state.
    //
    // Therefore you should not modify the `struct` variables. Instead adjust
    // the `expected` variable, to make sure the reexported data matches what
    // is now correct.

    QUnit.test("fromStruct - v1 - unfinished", function(assert) {
      let struct = {
        points: 2,
        raisedLast: null,
        winner: null,
        ourLimit: 11,
        theirLimit: 11,
      };
      let round = new Round(struct);

      let expected = {
        points: 2,
        raisedLast: null,
        winner: null,
        ourLimit: 11,
        theirLimit: 11,
      };
      assert.deepEqual(round.toStruct(), expected, "reexport matches");
    });

    QUnit.test("fromStruct - v1 - finished", function(assert) {
      let struct = {
        points: 3,
        raisedLast: Team.We,
        winner: Team.We,
        ourLimit: 4,
        theirLimit: 3
      };
      let round = new Round(struct);

      let expected = {
        points: 3,
        raisedLast: Team.We,
        winner: Team.We,
        ourLimit: 4,
        theirLimit: 3
      };
      assert.deepEqual(round.toStruct(), expected, "reexport matches");
    });
  });
}
