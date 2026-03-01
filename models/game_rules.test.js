"use strict";

import GameRules, { RaisingRule } from "/models/game_rules.js";

export default function() {
  QUnit.module("game_rules", function() {
    QUnit.test("default constructor", function(assert) {
      let rules = new GameRules();
      assert.strictEqual(rules.goal, 11, "initial goal");
      assert.strictEqual(
        rules.raising, RaisingRule.UnlessStricken, "initial raising rule");
    });

    QUnit.test("copy constructor", function(assert) {
      let first = new GameRules();
      first.goal = 5;
      first.raising = RaisingRule.UntilEnough;

      let second = new GameRules(first);
      assert.strictEqual(second.goal, first.goal, "copied goal");
      assert.strictEqual(second.raising, first.raising, "copied raising rule");
    });

    QUnit.test("invalid constructor", function(assert) {
      assert.throws(
        function() { new GameRules("nope"); },
        new TypeError("unknown form of GameRules constructor"));
    });

    QUnit.test("setting goal", function(assert) {
      let rules = new GameRules();
      rules.addEventListener(
        GameRules.EVENT_CHANGE, () => assert.step("change"));

      rules.goal = 15;
      assert.strictEqual(rules.goal, 15, "correct goal");
      assert.verifySteps(["change"], "change triggered");

      assert.throws(
        () => rules.goal = true,
        new TypeError("goal must be an integer value"),
        "bool goal");

      assert.throws(
        () => rules.goal = 0,
        new RangeError("goal must be at least one"),
        "zero goal");

      assert.throws(
        () => rules.goal = -15,
        new RangeError("goal must be at least one"),
        "negative goal");

      rules.goal = 1;
      assert.strictEqual(rules.goal, 1, "one goal");
      assert.verifySteps(["change"], "change triggered");
    });

    QUnit.test("setting raising rule", function(assert) {
      let rules = new GameRules();
      rules.addEventListener(
        GameRules.EVENT_CHANGE, () => assert.step("change"));

      rules.raising = RaisingRule.UntilEnough;
      assert.strictEqual(
        rules.raising, RaisingRule.UntilEnough, "until enough");
      assert.verifySteps(["change"], "change triggered");

      rules.raising = RaisingRule.UnlessStricken;
      assert.strictEqual(
        rules.raising, RaisingRule.UnlessStricken, "unless sticken");
      assert.verifySteps(["change"], "change triggered");

      assert.throws(
        () => rules.raising = 5,
        new TypeError("raising rule must be actual raising rule"),
        "integer raising rule");

      assert.throws(
        () => rules.raising = true,
        new TypeError("raising rule must be actual raising rule"),
        "boolean raising rule");
    });

    QUnit.test.each(
      "raisingLimit - unless stricken",
      [
        { rule: RaisingRule.UnlessStricken, goal: 2, points: 0, limit: 2 },
        { rule: RaisingRule.UnlessStricken, goal: 3, points: 0 },
        { rule: RaisingRule.UnlessStricken, goal: 11, points: 0 },
        { rule: RaisingRule.UnlessStricken, goal: 11, points: 2 },
        { rule: RaisingRule.UnlessStricken, goal: 11, points: 9, limit: 2 },
        { rule: RaisingRule.UnlessStricken, goal: 11, points: 11, limit: 2 },
        { rule: RaisingRule.UnlessStricken, goal: 11, points: 13, limit: 2 },
        { rule: RaisingRule.UntilEnough, goal: 2, points: 0, limit: 2 },
        { rule: RaisingRule.UntilEnough, goal: 11, points: 0, limit: 11 },
        { rule: RaisingRule.UntilEnough, goal: 11, points: 2, limit: 9 },
        { rule: RaisingRule.UntilEnough, goal: 11, points: 9, limit: 2 },
        { rule: RaisingRule.UntilEnough, goal: 11, points: 11, limit: 2 },
        { rule: RaisingRule.UntilEnough, goal: 11, points: 13, limit: 2 },
      ],
      function(assert, input) {
        let rules = new GameRules();
        rules.goal = input.goal;
        rules.raising = input.rule;
        assert.strictEqual(
          rules.raisingLimit(input.points),
          input.limit ?? Number.MAX_SAFE_INTEGER,
          "correct limit");
      }
    );

    QUnit.test("toStruct", function(assert) {
      let rules = new GameRules();
      let struct = rules.toStruct();

      let expected = {
        goal: 11,
        raising: RaisingRule.UnlessStricken,
      };

      assert.deepEqual(struct, expected, "successfull structurizing");
    });

    QUnit.test.each(
      "fromStruct",
      {
        "v1": { goal: 15, raising: RaisingRule.UntilEnough },
      },
      function(assert, input) {
        let rules = new GameRules(input);
        let expected = {
          goal: 15,
          raising: RaisingRule.UntilEnough,
        };
        assert.deepEqual(rules.toStruct(), expected, "reexport matches");
      }
    );

    QUnit.test.each(
      "invalid fromStruct",
      {
        "no goal": {
          struct: { },
          error: new TypeError("struct must contain goal as number"),
        },
        "boolean goal": {
          struct: { goal: true },
          error: new TypeError("struct must contain goal as number"),
        },
        "non-integer goal": {
          struct: { goal: 1.5 },
          error: new RangeError("struct must contain goal >= 1 as integer"),
        },
        "zero goal": {
          struct: { goal: 0 },
          error: new RangeError("struct must contain goal >= 1 as integer"),
        },
        "negative goal": {
          struct: { goal: -15 },
          error: new RangeError("struct must contain goal >= 1 as integer"),
        },
        "no raising rule": {
          struct: { goal: 2 },
          error: new TypeError("struct must contain valid raising rule"),
        },
        "boolean raising rule": {
          struct: { goal: 2, raising: true },
          error: new TypeError("struct must contain valid raising rule"),
        },
        "integer raising rule": {
          struct: { goal: 2, raising: 5 },
          error: new TypeError("struct must contain valid raising rule"),
        },
      },
      function(assert, input) {
        assert.throws(
          () => new GameRules(input.struct), input.error, "correct error");
      }
    )
  });
}
