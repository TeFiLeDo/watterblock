"use strict";

import { Round, Team } from "./round.js";
import Game from "./game.js";
import Session from "./session.js";

export default function() {
  QUnit.module("session", function() {
    QUnit.test("initial state", function(assert) {
      let session = new Session();
      assert.strictEqual(session.goal, 11, "initial goal");
      assert.strictEqual(session.games.length, 0, "no finished games");
      assert.strictEqual(session.currentGame, null, "no game in progress");
      assert.deepEqual(
        session.result,
        { ourPoints: 0, theirPoints: 0 },
        "initially no points");
      assert.strictEqual(session.ourTeam, "", "our team name");
      assert.strictEqual(session.theirTeam, "", "their team name");
    });

    QUnit.test("set goal", function(assert) {
      let session = new Session();
      assert.strictEqual(session.goal, 11, "initial goal");
      session.goal = 3;
      assert.strictEqual(session.goal, 3, "changed goal");
      assert.throws(function() { session.goal = 0; }, "invalid goal");
    });

    QUnit.test("start game", function(assert) {
      let session = new Session();
      session.anotherGame();
      assert.notStrictEqual(session.currentGame, null, "game in progress");
    });

    QUnit.test("single game finished", function(assert) {
      let session = new Session();
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      for (let i = 0; i < session.goal; i += 2)
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
      for (let i = 0; i < session.goal; i += 2)
        session.currentGame.currentRound.winner = Team.They;
      session.anotherGame();
      for (let i = 0; i < session.goal; i += 2)
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

    QUnit.test("toStruct - new session", function(assert) {
      let session = new Session();
      let struct = session.toStruct();

      let expected = {
        goal: 11,
        ourTeam: "",
        theirTeam: "",
        games: [],
        currentGame: null,
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
      session.ourTeam = "This is us!";
      session.theirTeam = "This is them!";
      let struct = session.toStruct();

      let finished = new Game(3);
      finished.currentRound.raise(Team.We);
      finished.currentRound.winner = Team.They;
      let unfinished = new Game(3);
      unfinished.currentRound.winner = Team.We;
      let expected = {
        goal: 3,
        ourTeam: "This is us!",
        theirTeam: "This is them!",
        games: [ finished.toStruct() ],
        currentGame: unfinished.toStruct()
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("fromStruct - current", function(assert) {
      let orig = new Session();
      orig.goal = 3;
      orig.ourTeam = "This is us!";
      orig.theirTeam = "This is them!";

      let copy = new Session(orig.toStruct());
      assert.strictEqual(copy.goal, orig.goal, "goals match");
      assert.strictEqual(copy.ourTeam, orig.ourTeam, "our teams match");
      assert.strictEqual(copy.theirTeam, orig.theirTeam, "their teams match");
      assert.strictEqual(
        copy.games.length, orig.games.length, "amount of past games");
      assert.strictEqual(
        copy.currentGame, orig.currentGame, "no current games");
      assert.deepEqual(copy.result, orig.result, "results match");

      orig.anotherGame();
      orig.currentGame.currentRound.raise(Team.They);
      orig.currentGame.currentRound.winner = Team.We;
      orig.anotherGame();
      orig.currentGame.currentRound.winner = Team.They;

      copy = new Session(orig.toStruct());
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
    });

    QUnit.test("fromStruct - invalid", function(assert) {
      let struct = {};
      function doIt(message) {
        assert.throws(function() { new Session(struct); }, message);
      }

      let unfinished = new Game(3);
      unfinished.currentRound.winner = Team.We;
      let finished = new Game(3);
      finished.currentRound.raise(Team.We);
      finished.currentRound.winner = Team.They;

      doIt("no goal");
      struct.goal = "3";
      doIt("string goal");
      struct.goal = Math.PI;
      doIt("non-int goal");
      struct.goal = 0;
      doIt("small goal");
      struct.goal = 3;

      doIt("no ourTeam");
      struct.ourTeam = 5;
      doIt("number ourTeam");
      struct.ourTeam = "";

      doIt("no theirTeam");
      struct.theirTeam = 6;
      doIt("number theirTeam");
      struct.theirTeam = "";

      doIt("no games");
      struct.games = "nope";
      doIt("string games");
      struct.games = ["nope", "again"];
      doIt("string array games");
      struct.games = [unfinished.toStruct()];
      doIt("unfinished game in games");
      struct.games = [finished.toStruct()];

      doIt("no currentGame");
      struct.currentGame = "nope";
      doIt("string currentGame");
      struct.currentGame = finished.toStruct();
      doIt("finished currentGame");
      struct.currentGame = unfinished.toStruct();

      new Session(struct);

      struct.games = [];
      struct.currentGame = null;
      new Session(struct);
    });

    // Data Import Tests
    // =================
    //
    // The tests named "fromStruct - vXX - XXXXX" are there to ensure that
    // future versions of the `Session` class still can correctly read in the
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

    QUnit.test("fromStruct - v1 - new session", function(assert) {
      let struct = {
        goal: 3,
        ourTeam: "",
        theirTeam: "",
        games: [],
        currentGame: null,
      };
      let session = new Session(struct);

      let expected = {
        goal: 3,
        ourTeam: "",
        theirTeam: "",
        games: [],
        currentGame: null,
      };
      assert.deepEqual(session.toStruct(), expected, "reexport matches");
    });

    QUnit.test("fromStruct - v1 - finished & unfinished", function(assert) {
      let finished = new Game(3);
      finished.currentRound.raise(Team.We);
      finished.currentRound.winner = Team.They;
      let unfinished = new Game(3);
      unfinished.currentRound.winner = Team.We;

      let struct = {
        goal: 3,
        ourTeam: "This is us!",
        theirTeam: "This is them!",
        games: [ finished.toStruct() ],
        currentGame: unfinished.toStruct(),
      };
      let session = new Session(struct);

      let expected = {
        goal: 3,
        ourTeam: "This is us!",
        theirTeam: "This is them!",
        games: [ finished.toStruct() ],
        currentGame: unfinished.toStruct(),
      };
      assert.deepEqual(session.toStruct(), expected, "reexport matches");
    });
  });
}
