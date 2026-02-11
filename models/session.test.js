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

    QUnit.test("serialization - new session", function(assert) {
      let session = new Session();
      let json = session.toJSON();

      assert.deepEqual(
        json,
        {
          goal: 11,
          ourTeam: "",
          theirTeam: "",
          games: [],
          currentGame: null,
        },
        "correct serialization");
    });

    QUnit.test("serialization - finished & unfinished game", function(assert) {
      let session = new Session();
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      for (
        let i = 0;
        session.currentGame !== null && i < session.currentGame.goal;
        i += 2
      )
        session.currentGame.currentRound.winner = Team.They;

      session.goal = 15;
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.They;
      for (
        let i = 0;
        session.currentGame !== null && i < session.currentGame.goal - 2;
        i += 2
      )
        session.currentGame.currentRound.winner = Team.We;

      session.goal = 5;
      session.ourTeam = "This is us!";
      session.theirTeam = "This is them!";

      let json = session.toJSON();
      json.games = [];
      for (let i = 0; i < session.games.length; i++)
        json.games.push(session.games[i].toJSON());
      json.currentGame = session.currentGame.toJSON();

      assert.deepEqual(
        json,
        {
          goal: 5,
          ourTeam: "This is us!",
          theirTeam: "This is them!",
          games: [
            session.games[0].toJSON(),
          ],
          currentGame: session.currentGame.toJSON(),
        },
        "correct serialization");
      assert.strictEqual(json.games[0].goal, 11, "first goal");
      assert.strictEqual(json.currentGame.goal, 15, "second goal");
    });

    QUnit.test("deserialization - new session", function(assert) {
      let game = new Game();
      let json = {
        goal: 11,
        ourTeam: "",
        theirTeam: "",
        games: [],
        currentGame: game.toJSON(),
      };
      json.currentGame.currentRound = game.currentRound.toJSON();

      let session = new Session(json);
      assert.strictEqual(session.goal, 11, "goal");
      assert.strictEqual(session.ourTeam, "", "our team name");
      assert.strictEqual(session.theirTeam, "", "their team name");
      assert.strictEqual(session.games.length, 0, "no past games");
      assert.deepEqual(session.currentGame.toJSON(), game.toJSON());
    });

    QUnit.test("deserialization - un- and finished games", function(assert) {
      let finished = new Game(2);
      finished.currentRound.winner = Team.We;

      let unfinished = new Game(3);
      unfinished.currentRound.winner = Team.They;

      let json = {
        goal: 4,
        ourTeam: "This is us!",
        theirTeam: "This is them!",
        games: [finished],
        currentGame: unfinished,
      };
      let deso = JSON.parse(JSON.stringify(json));
      let session = new Session(deso);

      assert.strictEqual(session.goal, 4, "goal");
      assert.strictEqual(session.ourTeam, "This is us!", "our team name");
      assert.strictEqual(session.theirTeam, "This is them!", "their team");
      assert.strictEqual(session.games.length, 1, "one past game");
      assert.deepEqual(
        session.games[0].toJSON(), finished.toJSON(), "finished game");
      assert.notStrictEqual(session.currentGame, null, "unfinished game here");
      assert.deepEqual(
        session.currentGame.toJSON(), unfinished.toJSON(), "unfinished game");
    });

    QUnit.test("deserialization - invalid", function(assert) {
      let deso = {};
      assert.throws(function() { new Session(deso); }, "no goal");

      deso.goal = "11";
      assert.throws(function() { new Session(deso); }, "string goal");

      deso.goal = 11;
      assert.throws(function() { new Session(deso); }, "no ourTeam");

      deso.ourTeam = 11;
      assert.throws(function() { new Session(deso); }, "number ourTeam");

      deso.ourTeam = "";
      assert.throws(function() { new Session(deso); }, "no theirTeam");

      deso.theirTeam = 11;
      assert.throws(function() { new Session(deso); }, "number theirTeam");

      deso.theirTeam = "";
      assert.throws(function() { new Session(deso); }, "no games");

      deso.games = null;
      assert.throws(function() { new Session(deso); }, "null games");

      deso.games = [];
      assert.throws(function() { new Session(deso); }, "no currentGame");

      deso.currentGame = {
        goal: 3,
        rounds: [{ winner: Team.They, points: 3 }],
        currentRound: null,
      };
      assert.throws(function() { new Session(deso); }, "finished currentGame");

      deso.currentGame = null;
      new Session(deso);

      deso.games = [{
        goal: 3,
        rounds: [{ winner: Team.They, points: 2}],
        currentRound: (new Round(3, 2)).toJSON(),
      }];
      assert.throws(function() { new Session(deso); }, "unfinished past");
    });
  });
}
