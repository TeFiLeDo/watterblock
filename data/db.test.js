"use strict";

// Please note that the singleton behavior of the `WbDb` class in production
// can currently not be tested. The actual singleton cannot be used because
// that would mean opening the database, and potentially performing a
// transaction that is not yet finished, potentially leading to data loss.
// Setting up a second singleton instance for testing is possible, but would
// not actually test the production variant.

import { Round } from "../models/round.js";
import WbDb from "./db.js";

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
  QUnit.module("db", function(hooks) {

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
        function() { new WbDb(); },
        new TypeError("WbDb may not be constructed externally"));

      assert.throws(
        function() { new WbDb(true); },
        new TypeError("WbDb may not be constructed externally"));

      assert.throws(
        function() { new WbDb(true, 1); },
        new TypeError("WbDb may not be constructed externally"));
    });

    QUnit.test("open db", async function(assert) {
      inst = WbDb.get(true);
      await waitForChange();

      assert.false(inst.blocked, "not blocked");
      assert.false(inst.failed, "not failed");
      assert.true(inst.open, "is open");
      assert.notStrictEqual(inst.db, null, "getting db succeeds");
      assert.strictEqual(inst.db.version, WbDb.DB_VERSION, "correct version");
    });

    QUnit.test.if(
      "cleanup works",
      // not yet baseline widely available, should be in November 2026
      // TODO: check in November 2026, make unconditional if possible then
      "databases" in indexedDB,
      async function(assert) {
        let dbs = await indexedDB.databases();
        assert.true(
          dbs.every(({name}) => name !== WbDb.DB_NAME_TEST),
          "no testing db");
      });

    QUnit.test("opening is blocked", async function(assert) {
      let first = WbDb.get(true, 1);
      await waitForChange(first);
      assert.true(first.open, "first instance opened");
      assert.strictEqual(first.db.version, 1, "first instance is version 1");

      inst = WbDb.get(true, 2);
      await waitForChange();
      assert.true(inst.blocked, "second instance blocked");
      assert.false(inst.open, "second instance not open");
      assert.false(inst.failed, "second instance not failed");

      first.db.close();
      await waitForChange();
      assert.false(inst.blocked, "second instance not blocked");
      assert.true(inst.open, "second instance open");
      assert.false(inst.failed, "second instance not failed");
      assert.strictEqual(inst.db.version, 2, "second instance is version 2");
    });

    QUnit.test("opening fails", async function(assert) {
      let first = WbDb.get(true, 2);
      await waitForChange(first);
      assert.true(first.open, "first instance opened");
      assert.strictEqual(first.db.version, 2, "first instance is version 2");
      first.db.close();

      let second = WbDb.get(true, 1)
      await waitForChange(second);
      if (second.blocked)
        await waitForChange(second);

      assert.false(second.blocked, "second instance not blocked");
      assert.false(second.open, "second instance not open");
      assert.true(second.failed, "second instance failed");
    });

    QUnit.test("schema version 1", async function(assert) {
      inst = WbDb.get(true, 1);
      await waitForChange();
      assert.true(inst.open, "db is opened");
      assert.strictEqual(inst.db.version, 1, "db is version 1");

      let osn = inst.db.objectStoreNames;
      assert.strictEqual(osn.length, 1, "correct number of object stores");
      assert.true(osn.contains(WbDb.OS_SESSIONS), "contains sessions");

      let trans = inst.db.transaction(osn);
      let sessions = trans.objectStore(WbDb.OS_SESSIONS);
      assert.strictEqual(sessions.keyPath, "id", "sessions keyPath");
      assert.true(sessions.autoIncrement, "sessions autoIncrement");
      assert.strictEqual(sessions.indexNames.length, 0, "sessions no indexes");
    });
  });
}
