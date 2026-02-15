"use strict";

import { Round, Team } from "./round.js";
import RoundResult from "./round_result.js";
import Game from "./game.js";

export default function() {
  QUnit.module("game", function() {
    QUnit.test("default construction", function(assert) {
      let game = new Game();
      assert.strictEqual(game.rounds.length, 0, "no past rounds");
      assert.equal(game.goal, 11, "default goal");
      assert.notStrictEqual(game.currentRound, null, "current round there");
      assert.deepEqual(
        game.result,
        {
          winner: null,
          points: 0,
          ourPoints: 0,
          theirPoints: 0
        },
        "initial results",
      );
    });

    QUnit.test("low goal", function(assert) {
      assert.throws(
        function() { new Game(0); },
        new RangeError("goal must be at least 1"),
        "goal must be 1 or higher");
    });

    QUnit.test("higher goal", function(assert) {
      let game = new Game(15);
      assert.strictEqual(game.rounds.length, 0, "no past rounds");
      assert.equal(game.goal, 15, "higher goal");
      assert.notStrictEqual(game.currentRound, null, "current round there");
      assert.deepEqual(
        game.result,
        {
          winner: null,
          points: 0,
          ourPoints: 0,
          theirPoints: 0
        },
        "initial results",
      );
    });

    QUnit.test("single round played", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We;

      assert.equal(game.rounds.length, 1, "one round played");
      assert.strictEqual(game.rounds[0].points, 2, "first round points");
      assert.strictEqual(game.rounds[0].winner, Team.We, "first round winner");
      assert.notStrictEqual(game.currentRound, null, "current round there");
      assert.false(game.currentRound.decided, "current round is not decided");
      assert.deepEqual(
        game.result,
        {
          winner: null,
          points: 0,
          ourPoints: 2,
          theirPoints: 0
        },
        "intermediate results",
      );
    });

    QUnit.test("two rounds played", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.We);
      game.currentRound.winner = Team.They;

      assert.equal(game.rounds.length, 2, "two round played");
      assert.strictEqual(game.rounds[1].points, 3, "second round points");
      assert.strictEqual(
        game.rounds[1].winner, Team.They, "second round winner");
      assert.notStrictEqual(game.currentRound, null, "current round there");
      assert.false(game.currentRound.decided, "current round is not decided");
      assert.deepEqual(
        game.result,
        {
          winner: null,
          points: 0,
          ourPoints: 2,
          theirPoints: 3
        },
        "intermediate results",
      );
    });

    QUnit.test("regular victory", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We; // 2
      game.currentRound.winner = Team.They; // 2
      game.currentRound.winner = Team.We; // 4
      game.currentRound.winner = Team.We; // 6
      game.currentRound.winner = Team.We; // 8
      game.currentRound.winner = Team.We; // 10
      game.currentRound.winner = Team.We; // 12

      assert.equal(game.rounds.length, 7, "seven rounds played");
      assert.strictEqual(game.currentRound, null, "no further rounds");
      assert.deepEqual(
        game.result,
        {
          winner: Team.We,
          points: 1,
          ourPoints: 12,
          theirPoints: 2,
        },
        "final results",
      );
    });

    QUnit.test("tailor victory", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.They; // 2
      game.currentRound.winner = Team.They; // 4
      game.currentRound.winner = Team.They; // 6
      game.currentRound.winner = Team.They; // 8
      game.currentRound.winner = Team.They; // 10
      game.currentRound.winner = Team.They; // 12

      assert.equal(game.rounds.length, 6, "seven rounds played");
      assert.strictEqual(game.currentRound, null, "no further rounds");
      assert.deepEqual(
        game.result,
        {
          winner: Team.They,
          points: 2,
          ourPoints: 0,
          theirPoints: 12,
        },
        "final results",
      );
    });

    QUnit.test("reverse tailor victory", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We; // 2
      game.currentRound.winner = Team.We; // 4
      game.currentRound.winner = Team.We; // 6
      game.currentRound.winner = Team.We; // 8
      game.currentRound.winner = Team.We; // 10
      game.currentRound.winner = Team.They; // 2
      game.currentRound.winner = Team.They; // 4
      game.currentRound.winner = Team.They; // 6
      game.currentRound.winner = Team.They; // 8
      game.currentRound.winner = Team.They; // 10
      game.currentRound.winner = Team.They; // 12

      assert.equal(game.rounds.length, 11, "eleven rounds played");
      assert.strictEqual(game.currentRound, null, "no further rounds");
      assert.deepEqual(
        game.result,
        {
          winner: Team.They,
          points: 4,
          ourPoints: 10,
          theirPoints: 12,
        },
        "final results",
      );
    });

    QUnit.test("reverse tailor victory with low goal", function(assert) {
      let game = new Game(3);
      game.currentRound.winner = Team.They; // 2
      game.currentRound.winner = Team.We; // 2
      game.currentRound.winner = Team.We; // 4

      assert.equal(game.rounds.length, 3, "three rounds played");
      assert.strictEqual(game.currentRound, null, "no further rounds");
      assert.deepEqual(
        game.result,
        {
          winner: Team.We,
          points: 4,
          ourPoints: 4,
          theirPoints: 2,
        },
        "final results",
      );
    });

    QUnit.test("finished event", function(assert) {
      let game = new Game(2);
      game.addEventListener(Game.finishedEvent, function() {
        assert.step("event");
      });
      game.currentRound.winner = Team.They;
      assert.verifySteps(["event"], "event was triggered");
    });

    QUnit.test("toStruct - unfinished", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.They);
      game.currentRound.winner = Team.They;
      game.currentRound.raise(Team.We);
      let struct = game.toStruct();

      let expected = {
        goal: 11,
        rounds: [
          { points: 2, winner: Team.We },
          { points: 3, winner: Team.They },
        ],
        currentRound: {
          points: 3,
          raisedLast: Team.We,
          winner: null,
          ourLimit: 9,
          theirLimit: 8
        },
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("toStruct - finished", function(assert) {
      let game = new Game(3);
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.They);
      game.currentRound.winner = Team.They;
      let struct = game.toStruct();

      let expected = {
        goal: 3,
        rounds: [
          { points: 2, winner: Team.We },
          { points: 3, winner: Team.They },
        ],
        currentRound: null,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("fromStruct - current", function(assert) {
      let orig = new Game(4);
      orig.currentRound.raise(Team.We);

      let copy = new Game(orig.toStruct());
      assert.strictEqual(copy.goal, orig.goal, "goals match");
      assert.strictEqual(
        copy.currentRound.points,
        orig.currentRound.points,
        "current points match");
      assert.strictEqual(
        copy.rounds.length, orig.rounds.length, "rounds match");

      orig.currentRound.winner = Team.We;
      copy = new Game(orig.toStruct());
      assert.strictEqual(
        copy.rounds.length, orig.rounds.length, "rounds match");
      assert.deepEqual(
        copy.rounds[0].toStruct(), orig.rounds[0].toStruct(), "round matches");

      orig.currentRound.winner = Team.We;
      copy = new Game(orig.toStruct());
      assert.deepEqual(copy.result, orig.result, "results match");
    });

    QUnit.test("fromStruct - invalid", function(assert) {
      let struct = {};
      function doIt(message, error) {
        assert.throws(function() { new Game(struct); }, error, message);
      }

      doIt("no goal", new TypeError("struct must contain goal as number"));
      struct.goal = "3";
      doIt("string goal", new TypeError("struct must contain goal as number"));
      struct.goal = Math.PI;
      doIt(
        "non-int goal",
        new RangeError("struct must contain goal >= 1 as integer"));
      struct.goal = 0;
      doIt(
        "small goal",
        new RangeError("struct must contain goal >= 1 as integer"));
      struct.goal = 3;

      doIt("no rounds", new TypeError("struct must contain rounds"));
      struct.rounds = "nope";
      doIt(
        "rounds not array",
        new TypeError("struct must contain rounds as array"));
      struct.rounds = ["nope", "again"];
      doIt(
        "string array rounds",
        new TypeError("unknown form of RoundResult constructor"));
      struct.rounds = [];

      doIt(
        "no currentRound",
        new TypeError("struct must contain currentRound as object"));
      struct.currentRound = "nope";
      doIt(
        "string currentRound",
        new TypeError("struct must contain currentRound as object"));
      struct.currentRound = null;
      doIt(
        "missing currentRound",
        new Error("struct of ongoing game must contain current round"));
      struct.currentRound = new Round().toStruct();
      new Game(struct);

      struct.rounds = [ new RoundResult(3, Team.They).toStruct() ];
      doIt(
        "unneeded currentRound",
        new Error("struct of finished game must not contain current round"));
      struct.currentRound = null;
      new Game(struct);
    });

    // Data Import Tests
    // =================
    //
    // The tests named "fromStruct - vXX - XXXXX" are there to ensure that
    // future versions of the `Game` class still can correctly read in the
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
      let past = new RoundResult(2, Team.We);
      let current = new Round(2, 3);
      current.raise(Team.They);

      let struct = {
        goal: 3,
        rounds: [ past.toStruct() ],
        currentRound: current.toStruct(),
      };
      let game = new Game(struct);

      let expected = {
        goal: 3,
        rounds: [ past.toStruct() ],
        currentRound: current.toStruct(),
      };
      assert.deepEqual(game.toStruct(), expected, "reexport matches");
    });

    QUnit.test("fromStruct - v1 - finished", function(assert) {
      let round1 = new RoundResult(2, Team.We);
      let round2 = new RoundResult(3, Team.They);

      let struct = {
        goal: 3,
        rounds: [ round1.toStruct(), round2.toStruct() ],
        currentRound: null,
      };
      let game = new Game(struct);

      let expected = {
        goal: 3,
        rounds: [ round1.toStruct(), round2.toStruct() ],
        currentRound: null,
      };
      assert.deepEqual(game.toStruct(), expected, "reexport matches");
    });
  });
}
