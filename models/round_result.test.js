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

    QUnit.test("serialization", function(assert) {
      let rr = new RoundResult(3, Team.They);
      assert.deepEqual(
        rr.toJSON(),
        {
          points: 3,
          winner: Team.They,
        },
        "correct serialization object",
      );
    });

    QUnit.test("deserialization", function(assert) {
      let rr = new RoundResult({
        points: 4,
        winner: Team.We,
      });
      assert.strictEqual(rr.points, 4, "correct points");
      assert.strictEqual(rr.winner, Team.We, "correct winner");
    });

    QUnit.test("invalid deserialization", function(assert) {
      let deso = {};
      assert.throws(function() { new RoundResult(deso); }, "no points");

      deso.points = "5";
      assert.throws(function() { new RoundResult(deso); }, "string points");

      deso.points = 5;
      assert.throws(function() { new RoundResult(deso); }, "no winner");

      deso.winner = "Team.They";
      assert.throws(function() { new RoundResult(deso); }, "string winner");

      deso.winner = Team.They;
      new RoundResult(deso);
    });
  });
}
