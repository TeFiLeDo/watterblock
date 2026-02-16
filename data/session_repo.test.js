"use strict";

import { Team } from "../models/round.js";
import Session from "../models/session.js";
import WbDb from "./db.js";
import SessionRepo from "./session_repo.js";

/** The instance used for the current test.
 *
 * Put test instances of `WbDb` into this variable. If it is used, the
 * connection is automatically closed after the test is done. That in turn
 * means that the database can then be deleted immediately, thus speeding up
 * the next test.
 *
 * @type {WbDb}
 */
let inst = null;

/** Wait for the `WbDb.EVENT_CHANGE` to be fired on `instance`.
 *
 * Uses the `inst` global variable if no `instance` parameter is passed.
 *
 * @param {WbDb=} instance The instance to wait on.
 */
function waitForChange(instance) {
  return new Promise(function(resolve) {
    (instance ?? inst).addEventListener(WbDb.EVENT_CHANGE, function() {
      resolve();
    });
  });
}

export default function() {
  QUnit.module("session_repo", function(hooks) {

    // delete test database before each test
    hooks.beforeEach(function() {
      return new Promise(function(resolve) {
        let req = indexedDB.deleteDatabase(WbDb.DB_NAME_TEST);
        req.onsuccess = function() {
          resolve();
        };
      });
    });

    // close db after each test
    hooks.afterEach(function() {
      if (inst !== null)
        if (inst.open)
          inst.db.close();
      inst = null;
    });

    QUnit.test("cannot call constructor", function(assert) {
      assert.throws(
        function() { new SessionRepo(); },
        new TypeError("SessionRepo cannot be constructed"));
    });

    QUnit.test("initially no sessions", async function(assert) {
      inst = WbDb.get(true);
      await waitForChange(inst);
      let sessions = await SessionRepo.getAll(inst);
      assert.strictEqual(sessions.length, 0, "no sessions");
    });

    QUnit.test("store single session", async function(assert) {
      inst = WbDb.get(true);
      let req = waitForChange(inst);

      let session = new Session();
      session.ourTeam = "This is us!";
      session.theirTeam = "This is them!";
      session.goal = 2;
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      session.anotherGame();
      assert.strictEqual(session.id, null, "no initial session id");

      await req;
      let id = await SessionRepo.put(session, inst);
      assert.strictEqual(session.id, id, "session id has been updated");

      let sessions = await SessionRepo.getAll(inst);
      assert.strictEqual(sessions.length, 1, "one stored session");
      assert.deepEqual(
        sessions[0].toStruct(), session.toStruct(), "sessions match");
    });

    QUnit.test("store two sessions", async function(assert) {
      inst = WbDb.get(true);
      let req =  waitForChange(inst);

      let first = new Session();
      first.ourTeam = "Team A";
      first.theirTeam = "Team 1";
      first.goal = 2;
      first.anotherGame();
      first.currentGame.currentRound.winner = Team.We;
      first.anotherGame();

      let second = new Session();
      second.ourTeam = "Team B";
      second.theirTeam = "Team 2";
      second.goal = 3;
      second.anotherGame();
      second.currentGame.currentRound.raise(Team.We);
      second.currentGame.currentRound.winner = Team.They;

      await req;

      let putFirst = SessionRepo.put(first, inst);
      let putSecond = SessionRepo.put(second, inst);
      await Promise.all([putFirst, putSecond]);

      let sessions = await SessionRepo.getAll(inst);
      assert.strictEqual(sessions.length, 2, "two sessions stored");
      assert.notStrictEqual(sessions[0].id, sessions[1].id, "IDs don't match");

      for (let session of sessions) {
        let expected = null;
        if (session.id === first.id) {
          expected = first.toStruct();
        } else if (session.id === second.id) {
          expected = second.toStruct();
        }

        assert.deepEqual(session.toStruct(), expected, "sessions match");
      }
    });

    QUnit.test("new session reacts to changes", async function(assert) {
      inst = WbDb.get(true);
      await waitForChange(inst);

      let session = new Session();
      let id = await SessionRepo.put(session, inst);
      assert.strictEqual(session.id, id, "session id has been updated");

      session.ourTeam = "This is us!";
      session.theirTeam = "This is them!";
      session.goal = 2;
      session.anotherGame();
      session.currentGame.currentRound.winner = Team.We;
      console.log("too late");

      // give the change events a chance to execute
      await new Promise((resolve) => setTimeout(resolve, 10));

      let sessions = await SessionRepo.getAll(inst);
      assert.strictEqual(sessions.length, 1, "exactly one stored session");
      assert.deepEqual(
        sessions[0].toStruct(), session.toStruct(), "sessions match");
    });
  });
}
