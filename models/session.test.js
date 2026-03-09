"use strict";

import { Team } from "/models/round.js";
import Game from "/models/game.js";
import Session from "/models/session.js";
import GameRules, { RaisingRule } from "/models/game_rules.js";

export default function() {
  QUnit.module("session", function() {
    QUnit.test("initial state", function(assert) {
      let now = new Date();
      let session = new Session();
      assert.strictEqual(session.rules.goal, 11, "initial goal");
      assert.strictEqual(
        session.rules.raising, RaisingRule.UnlessStricken, "initial raising");
      assert.strictEqual(session.games.length, 0, "no finished games");
      assert.strictEqual(session.currentGame, null, "no game in progress");
      assert.deepEqual(
        session.result,
        { ourPoints: 0, theirPoints: 0 },
        "initially no points");
      assert.strictEqual(session.ourTeam, "", "our team name");
      assert.strictEqual(session.theirTeam, "", "their team name");
      assert.true(session.created >= now, "was created after start");
      assert.true(
        session.created >= session.updated, "updated at or after creation");
    });

    QUnit.test("invalid constructor", function(assert) {
      assert.throws(
        function() {new Session("nope", "absolutely", "not"); },
        new TypeError("unknown form of Session constructor"));
    });

    QUnit.test("changing rules triggers change event", function(assert) {
      let session = new Session();
      session.addEventListener(Session.EVENT_CHANGE, function() {
        assert.step("event");
      });

      assert.notStrictEqual(session.rules.goal, 3, "not already new goal");
      session.rules.goal = 3;
      assert.strictEqual(session.rules.goal, 3, "new goal");

      assert.notStrictEqual(
        session.rules.raising,
        RaisingRule.UntilEnough,
        "not already new raising rule");
      session.rules.raising = RaisingRule.UntilEnough;
      assert.strictEqual(
        session.rules.raising, RaisingRule.UntilEnough, "new raising rule");

      assert.verifySteps(["event", "event"], "event happened twice");
      assert.true(session.updated >= session.created, "was updated");
    });

    QUnit.test("start game", function(assert) {
      let session = new Session();
      session.anotherGame();
      assert.notStrictEqual(session.currentGame, null, "game in progress");
    });

    QUnit.test("session rule change doesn't affect games", function(assert) {
      let session = new Session();
      session.anotherGame();
      session.rules.goal = 7;
      assert.notStrictEqual(
        session.currentGame.rules.goal,
        session.rules.goal,
        "game rules have been copied",
      );
    });

    QUnit.test("single game finished", function(assert) {
      let session = new Session();
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      for (let i = 0; i < session.rules.goal; i += 2)
        session.currentGame.currentRound.winner = Team.They;

      assert.strictEqual(session.games.length, 1, "single game");
      assert.deepEqual(
        session.games[0].result,
        {
          winner: Team.They,
          points: 1,
          ourPoints: 2,
          theirPoints: 12,
        });
      assert.strictEqual(session.currentGame, null, "no game in progress");
      assert.deepEqual(
        session.result,
        { ourPoints: 1, theirPoints: 0 },
        "one point for losing team");
    });

    QUnit.test("two games finished", function(assert) {
      let session = new Session();
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      for (let i = 0; i < session.rules.goal; i += 2)
        session.currentGame.currentRound.winner = Team.They;
      session.anotherGame();
      for (let i = 0; i < session.rules.goal; i += 2)
        session.currentGame.currentRound.winner = Team.We;

      assert.strictEqual(session.games.length, 2, "two games")
      assert.deepEqual(
        session.games[1].result,
        {
          winner: Team.We,
          points: 2,
          ourPoints: 12,
          theirPoints: 0,
        });
      assert.strictEqual(session.currentGame, null, "no game in progress");
      assert.deepEqual(
        session.result,
        { ourPoints: 1, theirPoints: 2 },
        "one point for losing team");
    });

    QUnit.test("new game doesn't overwrite existing", function(assert) {
      let session = new Session();
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      assert.notStrictEqual(session.currentGame, null, "ongoing game");

      session.anotherGame();
      assert.deepEqual(
        session.currentGame.result,
        {
          winner: null,
          points: 0,
          ourPoints: 2,
          theirPoints: 0,
        },
        "initial game still current");
    });

    QUnit.test("game addition triggers change event", function(assert) {
      let session = new Session();
      session.addEventListener(Session.EVENT_CHANGE, function() {
        assert.step("event");
      });
      session.anotherGame();
      assert.verifySteps(["event"], "event was triggered");
      assert.true(session.updated >= session.created, "was updated");
    });

    QUnit.test("game change triggers change event", function(assert) {
      let session = new Session();
      session.anotherGame();
      session.addEventListener(Session.EVENT_CHANGE, function() {
        assert.step("event");
      });
      session.currentGame.currentRound.raise(Team.They);
      assert.verifySteps(["event"], "event was triggered");
      assert.true(session.updated >= session.created, "was updated");
    });

    QUnit.test("setting ID", function(assert){
      let session = new Session();
      assert.strictEqual(session.id, null, "initially no id");
      session.addEventListener(Session.EVENT_CHANGE, function() {
        assert.step("event");
      });

      session.id = 18;
      assert.strictEqual(session.id, 18, "correct id");
      assert.verifySteps([], "no event happened");
    });

    QUnit.test("setting our team", function(assert){
      let session = new Session();
      assert.strictEqual(session.ourTeam, "", "initially no ourTeam");
      session.addEventListener(Session.EVENT_CHANGE, function() {
        assert.step("event");
      });

      session.ourTeam = "This is us!";
      assert.strictEqual(session.ourTeam, "This is us!", "correct ourTeam");
      assert.verifySteps(["event"], "event happened");
      assert.true(session.updated >= session.created, "was updated");
    });

    QUnit.test("setting their team", function(assert){
      let session = new Session();
      assert.strictEqual(session.theirTeam, "", "initially no theirTeam");
      session.addEventListener(Session.EVENT_CHANGE, function() {
        assert.step("event");
      });

      session.theirTeam = "This is them!";
      assert.strictEqual(
        session.theirTeam, "This is them!", "correct theirTeam");
      assert.verifySteps(["event"], "event happened");
      assert.true(session.updated >= session.created, "was updated");
    });

    QUnit.test("toStruct - new session", function(assert) {
      let session = new Session();
      let struct = session.toStruct();

      let expected = {
        rules: session.rules.toStruct(),
        ourTeam: "",
        theirTeam: "",
        games: [],
        currentGame: null,
        created: session.created,
        updated: session.updated,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("toStruct - finished & unfinished game", function(assert) {
      let session = new Session();
      session.goal = 3;
      session.anotherGame();
      session.currentGame.currentRound.raise(Team.We);
      session.currentGame.currentRound.winner = Team.They;
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      session.id = 15;
      session.ourTeam = "This is us!";
      session.theirTeam = "This is them!";
      let struct = session.toStruct();

      let expected = {
        id: 15,
        rules: session.rules.toStruct(),
        ourTeam: "This is us!",
        theirTeam: "This is them!",
        games: session.games.map(g => g.toStruct()),
        currentGame: session.currentGame.toStruct(),
        created: session.created,
        updated: session.updated,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("fromStruct - current", function(assert) {
      let orig = new Session();
      orig.rules.goal = 3;
      orig.rules.raising = RaisingRule.UntilEnough;
      orig.ourTeam = "This is us!";
      orig.theirTeam = "This is them!";

      let copy = new Session(orig.toStruct());
      assert.strictEqual(copy.id, orig.id, "IDs match");
      assert.strictEqual(copy.id, null, "copy ID is null");
      assert.strictEqual(copy.rules.goal, orig.rules.goal, "goals match");
      assert.strictEqual(
        copy.rules.raising, orig.rules.raising, "raising rule matches");
      assert.strictEqual(copy.ourTeam, orig.ourTeam, "our teams match");
      assert.strictEqual(copy.theirTeam, orig.theirTeam, "their teams match");
      assert.strictEqual(
        copy.games.length, orig.games.length, "amount of past games");
      assert.strictEqual(
        copy.currentGame, orig.currentGame, "no current games");
      assert.deepEqual(copy.result, orig.result, "results match");
      assert.strictEqual(copy.created, orig.created, "same creation time");
      assert.strictEqual(copy.updated, orig.updated, "same update time");

      orig.anotherGame();
      orig.id = 15;
      orig.currentGame.currentRound.raise(Team.They);
      orig.currentGame.currentRound.winner = Team.We;
      orig.anotherGame();
      orig.currentGame.currentRound.winner = Team.They;

      copy = new Session(orig.toStruct());
      assert.strictEqual(copy.id, orig.id, "IDs match");
      assert.strictEqual(copy.id, 15, "copy ID is correct");
      assert.strictEqual(copy.games.length, 1, "single past game");
      assert.strictEqual(
        copy.games.length, orig.games.length, "amount of past games");
      assert.deepEqual(
        copy.games[0].toStruct(), orig.games[0].toStruct(), "past game");
      assert.deepEqual(
        copy.currentGame.toStruct(),
        orig.currentGame.toStruct(),
        "current game");
      assert.deepEqual(copy.result, orig.result, "results match");
      assert.strictEqual(copy.created, orig.created, "same creation time");
      assert.strictEqual(copy.updated, orig.updated, "same update time");
    });

    QUnit.test("fromStruct - invalid", function(assert) {
      let struct = {};
      function doIt(message, error) {
        assert.throws(function() { new Session(struct); }, error, message);
      }

      let rules = new GameRules();
      rules.goal = 3;
      let unfinished = new Game(rules);
      unfinished.currentRound.winner = Team.We;
      let finished = new Game(rules);
      finished.currentRound.raise(Team.We);
      finished.currentRound.winner = Team.They;

      struct.id = "nope";
      doIt(
        "string id",
        new TypeError("if struct contains id, then it must be a number"));
      struct.id = 1.1;
      doIt(
        "float id",
        new RangeError("if struct contains id, then it must be an integer"));
      struct.id = undefined;
      doIt(
        "undefined id",
        new TypeError("if struct contains id, then it must be a number"));
      delete struct.id;

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
      struct.rules = rules;

      doIt(
        "no ourTeam", new TypeError("struct must contain ourTeam as string"));
      struct.ourTeam = 5;
      doIt(
        "number ourTeam",
        new TypeError("struct must contain ourTeam as string"));
      struct.ourTeam = "";

      doIt(
        "no theirTeam",
        new TypeError("struct must contain theirTeam as string"));
      struct.theirTeam = 6;
      doIt(
        "number theirTeam",
        new TypeError("struct must contain theirTeam as string"));
      struct.theirTeam = "";

      doIt("no games", new TypeError("struct must contain games"));
      struct.games = "nope";
      doIt(
        "string games", new TypeError("struct must contain games as array"));
      struct.games = ["nope", "again"];
      doIt(
        "string array games",
        new TypeError("unknown form of Game constructor"));
      struct.games = [unfinished.toStruct()];
      doIt(
        "unfinished game in games", new Error("past games must be finished"));
      struct.games = [finished.toStruct()];

      doIt(
        "no currentGame",
        new TypeError("struct must contain currentGame as object"));
      struct.currentGame = "nope";
      doIt(
        "string currentGame",
        new TypeError("struct must contain currentGame as object"));
      struct.currentGame = finished.toStruct();
      doIt(
        "finished currentGame",
        new Error("currentGame in struct must not be finished"));
      struct.currentGame = unfinished.toStruct();

      struct.created = "2026-02-26T22:00:00";
      doIt(
        "string created",
        new TypeError("if struct contains creation time, it must be a date"));
      struct.created = new Date(struct.created);
      struct.updated = "2026-02-26T22:00:00";
      doIt(
        "string updated",
        new TypeError("if struct contains update time, it must be a date"));
      struct.updated = new Date(struct.updated);

      new Session(struct);

      struct.games = [];
      struct.currentGame = null;
      new Session(struct);
    });

    // data for the version import tests
    let rules = new GameRules();
    rules.goal = 3;
    rules.raising = RaisingRule.UntilEnough;
    let finished = new Game(rules);
    finished.currentRound.raise(Team.We);
    finished.currentRound.winner = Team.They;
    let unfinished = new Game(rules);
    unfinished.currentRound.winner = Team.We;

    QUnit.test.each(
      "fromStruct - new session",
      {
        v1: {
          goal: 3,
          ourTeam: "",
          theirTeam: "",
          games: [],
          currentGame: null,
        },
        v2: {
          id: 23,
          goal: 3,
          ourTeam: "",
          theirTeam: "",
          games: [],
          currentGame: null,
        },
        v3: {
          id: 23,
          goal: 3,
          ourTeam: "",
          theirTeam: "",
          games: [],
          currentGame: null,
          created: new Date("2026-02-26T20:05:00"),
          updated: new Date("2026-02-26T20:05:00"),
        },
        v4: {
          id: 23,
          rules: rules.toStruct(),
          ourTeam: "",
          theirTeam: "",
          games: [],
          currentGame: null,
          created: new Date("2026-02-26T20:05:00"),
          updated: new Date("2026-02-26T20:05:00"),
        },
      },
      function(assert, input) {
        let session = new Session(input);
        let expected = {
          rules: rules.toStruct(),
          ourTeam: "",
          theirTeam: "",
          games: [],
          currentGame: null,
          created: new Date("2026-02-26T22:00:00"),
          updated: new Date("2026-02-26T22:00:00"),
        };
        if ("id" in input)
          expected.id = input.id;
        if ("created" in input)
          expected.created = new Date(input.created);
        if ("updated" in input)
          expected.updated = new Date(input.updated);
        assert.deepEqual(session.toStruct(), expected, "reexport matches");
      }
    );

    QUnit.test.each(
      "fromStruct - finished & unfinished",
      {
        v1: {
          goal: 3,
          ourTeam: "This is us!",
          theirTeam: "This is them!",
          games: [ finished.toStruct() ],
          currentGame: unfinished.toStruct(),
        },
        v2: {
          id: 17,
          goal: 3,
          ourTeam: "This is us!",
          theirTeam: "This is them!",
          games: [ finished.toStruct() ],
          currentGame: unfinished.toStruct(),
        },
        v3: {
          id: 17,
          goal: 3,
          ourTeam: "This is us!",
          theirTeam: "This is them!",
          games: [ finished.toStruct() ],
          currentGame: unfinished.toStruct(),
          created: new Date("2026-02-26T20:05:00"),
          updated: new Date("2026-02-26T20:05:00"),
        },
        v4: {
          id: 17,
          rules: rules.toStruct(),
          ourTeam: "This is us!",
          theirTeam: "This is them!",
          games: [ finished.toStruct() ],
          currentGame: unfinished.toStruct(),
          created: new Date("2026-02-26T20:05:00"),
          updated: new Date("2026-02-26T20:05:00"),
        },
      },
      function(assert, input) {
        let session = new Session(input);
        let expected = {
          rules: rules.toStruct(),
          ourTeam: "This is us!",
          theirTeam: "This is them!",
          games: [ finished.toStruct() ],
          currentGame: unfinished.toStruct(),
          created: new Date("2026-02-26T22:00:00"),
          updated: new Date("2026-02-26T22:00:00"),
        };
        if ("id" in input)
          expected.id = input.id;
        if ("created" in input)
          expected.created = new Date(input.created);
        if ("updated" in input)
          expected.updated = new Date(input.updated);
        assert.deepEqual(session.toStruct(), expected, "reexport matches");
      }
    );
  });
}
