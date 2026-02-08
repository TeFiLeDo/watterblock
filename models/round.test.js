"use strict";

import { Round, Team } from "./round.js";

QUnit.module("models", function() {
  QUnit.module("round", function() {
    QUnit.test("setup", function(assert) {
      let round = new Round();
      assert.strictEqual(round.points, 2, "initial points");
      assert.strictEqual(round.winner, null, "no initial winner");
      assert.false(round.decided, "initially undecided");
      assert.true(round.canRaise(Team.We), "we initially can raise");
      assert.true(round.canRaise(Team.They), "they initially can raise");
    });

    QUnit.test("immediate victory", function(assert) {
      let round = new Round();
      round.won(Team.We);
      assert.strictEqual(round.points, 2, "initial points");
      assert.true(round.decided, "there is a winner");
      assert.strictEqual(round.winner, Team.We, "correct winner");
      assert.false(round.canRaise(Team.We), "cannot raise finished game");
      assert.false(round.canRaise(Team.They), "cannot raise finished game");
    });

    QUnit.test("multiple victories", function(assert) {
      let round = new Round();
      round.won(Team.They);
      assert.throws(function() {
        round.won(Team.We);
      }, "victory cannot be stolen");
    });

    QUnit.test("single raise", function(assert) {
      let round = new Round();
      round.raise(Team.We);
      assert.strictEqual(round.points, 3, "raised points");
      assert.false(round.canRaise(Team.We), "raising team cannot raise");
      assert.true(round.canRaise(Team.They), "other team can raise");
    });

    QUnit.test("double raise", function(assert) {
      let round = new Round();
      round.raise(Team.We);
      round.raise(Team.They);
      assert.strictEqual(round.points, 4, "raised points");
      assert.true(round.canRaise(Team.We), "first raiser can raise");
      assert.false(round.canRaise(Team.They), "second raiser cannot raise");
    });

    QUnit.test("raise to eleven and above", function(assert) {
      let round = new Round();
      round.raise(Team.We); // 3
      round.raise(Team.They); // 4
      round.raise(Team.We); // 5
      round.raise(Team.They); // 6
      round.raise(Team.We); // 7
      round.raise(Team.They); // 8
      round.raise(Team.We); // 9

      round.raise(Team.They); // 10
      assert.strictEqual(round.points, 10, "points before limit are reached");
      assert.false(round.decided, "round is not decided before limit");

      round.raise(Team.We); // 11
      assert.strictEqual(round.points, 11, "points limit is reached");
      assert.false(round.decided, "round is not decidid at limit");

      round.raise(Team.They); // 12
      assert.strictEqual(round.points, 11, "no invalid raise");
      assert.true(round.decided, "round is decided");
      assert.strictEqual(round.winner, Team.We, "we team won");
      assert.false(round.canRaise(Team.We), "winner cannot raise");
      assert.false(round.canRaise(Team.They), "looser cannot raise");
    });

    QUnit.test("raise to lower limit and above", function(assert) {
      let round = new Round(3, 4);
      round.raise(Team.We); // 3
      assert.strictEqual(round.points, 3, "our points limit is reached");
      assert.false(round.decided, "round is not decidid at our limit");

      round.raise(Team.They); // 4
      assert.strictEqual(round.points, 4, "their points limit is reached");
      assert.false(round.decided, "round is not decidid at their limit");

      round.raise(Team.We); // 5
      assert.strictEqual(round.points, 4, "no invalid raise");
      assert.true(round.decided, "round is decided");
      assert.strictEqual(round.winner, Team.They, "they team won");
      assert.false(round.canRaise(Team.We), "looser cannot raise");
      assert.false(round.canRaise(Team.They), "winner cannot raise");
    });
  });
});
