"use strict";

import { Round, Team } from "/models/round.js";
import RoundResult from "/models/round_result.js";
import Game from "/models/game.js";
import GameRules, { RaisingRule } from "./game_rules.js";

export default function() {
  QUnit.module("game", function() {
    QUnit.test("default construction", function(assert) {
      let game = new Game();
      assert.strictEqual(game.rounds.length, 0, "no past rounds");
      assert.strictEqual(game.rules.goal, 11, "default goal");
      assert.strictEqual(
        game.rules.raising, RaisingRule.UnlessStricken, "default raising rule");
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

    QUnit.test("invalid constructor", function(assert) {
      assert.throws(
        function() {new Game("nope", "absolutely", "not"); },
        new TypeError("unknown form of Game constructor"));
    });

    QUnit.test("with non-default rules", function(assert) {
      let rules = new GameRules();
      rules.goal = 15;
      rules.raising = RaisingRule.UntilEnough;
      let game = new Game(rules);
      assert.strictEqual(game.rounds.length, 0, "no past rounds");
      assert.equal(game.rules.goal, 15, "higher goal");
      assert.equal(game.rules.raising, RaisingRule.UntilEnough, "raising rule");
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

    QUnit.test("rules stay static after construction", function(assert) {
      let rules = new GameRules();
      rules.goal = 15;

      let game = new Game(rules);
      assert.strictEqual(game.rules.goal, 15, "correct goal");

      rules.goal = 17;
      assert.strictEqual(game.rules.goal, 15, "games rules didn't change");
      assert.notStrictEqual(game.rules.goal, rules.goal, "goals are different");
    });

    QUnit.test("single round played", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We;

      assert.equal(game.rounds.length, 1, "one round played");
      assert.false(game.decided, "game is not decided");
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
      assert.false(game.decided, "game is not decided");
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
      assert.true(game.decided, "game is decided");
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

    QUnit.test("regular victory after near tailor", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We; // 2
      game.currentRound.winner = Team.We; // 4
      game.currentRound.winner = Team.We; // 6
      game.currentRound.winner = Team.We; // 8
      game.currentRound.winner = Team.We; // 10
      game.currentRound.winner = Team.They; // 2
      game.currentRound.winner = Team.We; // 12

      assert.equal(game.rounds.length, 7, "seven rounds played");
      assert.true(game.decided, "no further rounds");
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
      let rules = new GameRules();
      rules.goal = 3;
      let game = new Game(rules);
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

    QUnit.test("raising rules effect - unless stricken", function(assert) {
      let rules = new GameRules();
      rules.goal = 3;
      rules.raising = RaisingRule.UnlessStricken;

      let game = new Game(rules);
      game.currentRound.raise(Team.We);
      game.currentRound.raise(Team.They);
      assert.notStrictEqual(game.currentRound, null, "round still going");

      game = new Game(rules);
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.They);
      assert.notStrictEqual(game.currentRound, null, "round still going");
      game.currentRound.raise(Team.We);
      assert.strictEqual(game.currentRound, null, "round ended");
    });

    QUnit.test("raising rules effect - until enough", function(assert) {
      let rules = new GameRules();
      rules.goal = 3;
      rules.raising = RaisingRule.UntilEnough;

      let game = new Game(rules);
      game.currentRound.raise(Team.We);
      game.currentRound.raise(Team.They);
      assert.strictEqual(game.currentRound, null, "round ended");
    });

    QUnit.test("round change triggers event", function(assert) {
      let rules = new GameRules();
      rules.goal = 3;
      let game = new Game();
      game.addEventListener(Game.EVENT_CHANGE, function() {
        assert.step("event");
      });
      game.currentRound.raise(Team.We);
      game.currentRound.winner = Team.They;
      assert.verifySteps(["event", "event"], "events were triggered");
    });

    QUnit.test("toStruct - unfinished", function(assert) {
      let game = new Game();
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.They);
      game.currentRound.winner = Team.They;
      game.currentRound.raise(Team.We);
      let struct = game.toStruct();

      let expected = {
        rules: game.rules.toStruct(),
        rounds: game.rounds.map((r) => r.toStruct()),
        currentRound: game.currentRound.toStruct(),
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("toStruct - finished", function(assert) {
      let rules = new GameRules();
      rules.goal = 3;
      let game = new Game(rules);
      game.currentRound.winner = Team.We;
      game.currentRound.raise(Team.They);
      game.currentRound.winner = Team.They;
      let struct = game.toStruct();

      let expected = {
        rules: game.rules.toStruct(),
        rounds: game.rounds.map((r) => r.toStruct()),
        currentRound: null,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("fromStruct - current", function(assert) {
      let rules = new GameRules();
      rules.goal = 4;
      let orig = new Game(rules);
      orig.currentRound.raise(Team.We);

      let copy = new Game(orig.toStruct());
      assert.deepEqual(copy.rules, orig.rules, "rules match");
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

      doIt(
        "no goal", new TypeError("struct must contain either rules or goal"));
      struct.goal = "3";
      doIt(
        "string goal",
        new TypeError("if struct contains goal, it must be a number"));
      struct.goal = Math.PI;
      doIt(
        "non-int goal",
        new RangeError("if struct contains goal, must be integer >= 1"));
      struct.goal = 0;
      doIt(
        "small goal",
        new RangeError("if struct contains goal, must be integer >= 1"));
      struct.goal = 3;

      struct.rules = "";
      doIt(
        "rules and goal",
        new TypeError("struct cannot contain both rules and goal"));
      delete struct.goal;
      doIt(
        "string rules",
        new TypeError("if struct contains rules, they must be an object"));
      let rules = new GameRules();
      rules.goal = 3;
      struct.rules = rules;

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

    // data for the version import tests
    let round1 = new RoundResult(2, Team.We);
    let round2 = new RoundResult(3, Team.They);
    let current = new Round(2, 3);
    let rules = new GameRules();
    rules.goal = 3;
    rules.raising = RaisingRule.UntilEnough;

    QUnit.test.each(
      "fromStruct - unfinished",
      {
        v1: {
          goal: 3,
          rounds: [ round1.toStruct() ],
          currentRound: current.toStruct(),
        },
        v2: {
          rules: rules.toStruct(),
          rounds: [ round1.toStruct() ],
          currentRound: current.toStruct(),
        },
      },
      function(assert, input) {
        let game = new Game(input);
        let expeted = {
          rules: rules.toStruct(),
          rounds: [ round1.toStruct() ],
          currentRound: current.toStruct(),
        };
        assert.deepEqual(game.toStruct(), expeted, "reexport matches");
      }
    );

    QUnit.test.each(
      "fromStruct - finished",
      {
        v1: {
          goal: 3,
          rounds: [ round1.toStruct(), round2.toStruct() ],
          currentRound: null,
        },
        v2: {
          rules: rules.toStruct(),
          rounds: [ round1.toStruct(), round2.toStruct() ],
          currentRound: null,
        },
      },
      function(assert, input) {
        let game = new Game(input);
        let expeted = {
          rules: rules.toStruct(),
          rounds: [ round1.toStruct(), round2.toStruct() ],
          currentRound: null,
        };
        assert.deepEqual(game.toStruct(), expeted, "reexport matches");
      }
    );
  });
}
