"use strict";

import { Round, Team } from "./round.js";
import RoundResult from "./round_result.js";
import Game from "./game.js";

QUnit.module("models", function() {
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
      assert.deepEqual(
        game.rounds[0].toJSON(),
        { points: 2, winner: Team.We},
        "first round correct");
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
      assert.deepEqual(
        game.rounds[1].toJSON(),
        { points: 3, winner: Team.They},
        "second round correct");
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

    QUnit.test("serialization - unfinished", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.They);
      game.currentRound.winner = Team.They;
      game.currentRound.raise(Team.We);

      let json = game.toJSON();
      json.currentRound = json.currentRound.toJSON();
      for (let i = 0; i < json.rounds.length; i++)
        json.rounds[i] = json.rounds[i].toJSON();

      assert.deepEqual(
        json,
        {
          goal: 11,
          rounds: [
            { points: 2, winner: Team.We },
            { points: 3, winner: Team.They },
          ],
          currentRound: {
            points: 3,
            raisedLast: Team.We,
            winner: null,
            weLimit: 9,
            theyLimit: 8,
          },
        },
        "serialized data"
      );
    });

    QUnit.test("serialization - finished", function(assert) {
      let game = new Game(3);
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.They);
      game.currentRound.winner = Team.They;

      let json = game.toJSON();
      for (let i = 0; i < json.rounds.length; i++)
        json.rounds[i] = json.rounds[i].toJSON();

      assert.deepEqual(
        json,
        {
          goal: 3,
          rounds: [
            { points: 2, winner: Team.We },
            { points: 3, winner: Team.They },
          ],
          currentRound: null,
        },
        "serialized data"
      );
    });

    QUnit.test("deserialize - unfinished", function(assert) {
      let currentRound = new Round(2, 3);
      currentRound.raise(Team.They);

      let game = new Game({
        goal: 3,
        rounds: [{ winner: Team.We, points: 2 }],
        currentRound: currentRound.toJSON(),
      });

      assert.strictEqual(game.goal, 3, "goal");
      assert.strictEqual(game.rounds.length, 1, "one round played");
      assert.deepEqual(
        game.rounds[0].toJSON(),
        { winner: Team.We, points: 2 },
        "correct past round");
      assert.deepEqual(
        game.currentRound.toJSON(),
        currentRound.toJSON(),
        "correct current round");
      assert.deepEqual(
        game.result,
        {
          winner: null,
          points: 0,
          ourPoints: 2,
          theirPoints: 0,
        },
        "intermediate results");
    });

    QUnit.test("deserialize - finished", function(assert) {
      let game = new Game({
        goal: 3,
        rounds: [{ winner: Team.They, points: 3 }],
        currentRound: null,
      });

      assert.strictEqual(game.goal, 3, "goal");
      assert.strictEqual(game.rounds.length, 1, "one round played");
      assert.deepEqual(
        game.rounds[0].toJSON(),
        { winner: Team.They, points: 3 },
        "correct past round");
      assert.strictEqual(game.currentRound, null, "no current round");
      assert.deepEqual(
        game.result,
        {
          winner: Team.They,
          points: 2,
          ourPoints: 0,
          theirPoints: 3,
        },
        "final results");
    });

    QUnit.test("deserialize - invalid", function(assert) {
      let deso = {};
      assert.throws(function() { new Game(deso); }, "no goal");

      deso.goal = "5";
      assert.throws(function() { new Game(deso); }, "string goal");

      deso.goal = 5;
      assert.throws(function() { new Game(deso); }, "no rounds");

      deso.rounds = ["nonono"];
      assert.throws(function() { new Game(deso); }, "string rounds");

      deso.rounds = [];
      assert.throws(function() { new Game(deso); }, "no currentRound");

      deso.currentRound = null;
      assert.throws(function() { new Game(deso); }, "missing currentRound");

      deso.currentRound = "nonono";
      assert.throws(function() { new Game(deso); }, "broken currentRound");

      deso.rounds = [{ winner: Team.We, points: 5 }];
      deso.currentRound = {
        points: 2,
        raisedLast: Team.They,
        winner: null,
        weLimit: 2,
        theyLimit: 5};
      assert.throws(function() { new Game(deso); }, "unneeded currentRound");

      deso.goal = 11;
      new Game(deso);

      deso.goal = 5;
      deso.currentRound = null;
      new Game(deso);
    });

    QUnit.test("finished event", function(assert) {
      let game = new Game(2);
      game.addEventListener(Game.finishedEvent, function() {
        assert.step("event");
      });
      game.currentRound.winner = Team.They;
      assert.verifySteps(["event"], "event was triggered");
    });
  });
});
