"use strict";

import { Team } from "./round.js";
import RoundResult from "./round_result.js";

export default function() {
  QUnit.module("RoundResult", function() {
    QUnit.test("regular construction", function(assert) {
      let rr = new RoundResult(2, Team.We);
      assert.strictEqual(rr.points, 2, "correct points");
      assert.strictEqual(rr.winner, Team.We, "correct winner");
    });

    QUnit.test("toStruct", function(assert) {
      let rr = new RoundResult(2, Team.They);
      let struct = rr.toStruct();

      let expected = {
        points: 2,
        winner: Team.They,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test("fromStruct - current", function(assert) {
      let orig = new RoundResult(3, Team.We);
      let copy = new RoundResult(orig.toStruct());
      assert.strictEqual(copy.points, orig.points, "points match");
      assert.strictEqual(copy.winner, orig.winner, "winners match");
    });

    QUnit.test("fromStruct - invalid", function(assert) {
      let struct = {};
      function doIt(message) {
        assert.throws(function() { new Round(struct); }, message);
      }

      doIt("no points");
      struct.points = "4";
      doIt("string points");
      struct.points = 4.1;
      doIt("non-int points");
      struct.points = 1;
      doIt("small points");
      struct.points = 4;

      doIt("no winner");
      struct.winner = "they";
      doIt("string winner");
      struct.winner = -1;
      doIt("non-team winner");
      struct.winner = Team.They;

      new RoundResult(struct);
    });

    // Data Import Tests
    // =================
    //
    // The tests named "fromStruct - vXX - XXXXX" are there to ensure that
    // future versions of the `RoundResult` class still can correctly read in
    // the structural data exported by earlier versions. This is needed to
    // ensure that the data remains usable.
    //
    // These tests work by importing an old structural object, and then
    // exporting a new one. The new one should match with how the current
    // implementation would represent the same state.
    //
    // Therefore you should not modify the `struct` variables. Instead adjust
    // the `expected` variable, to make sure the reexported data matches what
    // is now correct.

    QUnit.test("fromStruct - v1", function(assert) {
      let struct = {
        points: 4,
        winner: Team.They,
      };
      let rr = new RoundResult(struct);

      let expected = {
        points: 4,
        winner: Team.They,
      };
      assert.deepEqual(rr.toStruct(), expected, "reexport matches");
    });
  });
}
