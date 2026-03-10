"use strict";

import GameRules, { RaisingRule } from "/models/game_rules.js";
import { Round, Team } from "/models/round.js";
import RoundResult from "/models/round_result.js";

/** A single game of watten.
 *
 * A game consists of several rounds, and continues until either team reaches
 * a points goal.
 *
 * This class keeps track of individual rounds and their results, and sets up
 * new ones until the game is finished. It also has a `result` property, that
 * calculates who won and how many points they earned.
 *
 * Note that game points are punitive, players want to avoid earning them.
 */
export default class Game extends EventTarget {
  /** The event triggered when something about the game changes. */
  static get EVENT_CHANGE() { return "wb:game:change"; }

  /** The finished rounds.
   * @type {RoundResult[]}
   */
  #rounds = [];

  /** Get the finished rounds.
   *
   * DO NOT write to the returned object.
   */
  get rounds() {
    return this.#rounds;
  }

  /** The rules of this game. */
  #rules = new GameRules();

  /** Get the rules of this game.
   *
   * Note that this actually returns a copy of the game rules. They cannot be
   * changed, as changing the rules during a game would a) be unfair and b)
   * rather difficult to correctly implement.
   */
  get rules() {
    return new GameRules(this.#rules);
  }

  /** The current round.
   * @type {?Round}
   */
  #currentRound = null;

  /** Get the current round of the game. */
  get currentRound() {
    return this.#currentRound;
  }

  constructor(value) {
    super();
    if (value === undefined || value instanceof GameRules) {
      if (value instanceof GameRules)
        this.#rules = new GameRules(value);

      this.#currentRound = new Round(
        this.#rules.raisingLimit(0), this.#rules.raisingLimit(0));
      this.#currentRound.addEventListener(
        Round.EVENT_CHANGE, this.#boundHandleRoundChange);
    } else if (typeof value === "object") {
      this.#fromStruct(value);
    } else {
      throw new TypeError("unknown form of Game constructor");
    }
  }

  /** Check whether the game is finished. */
  get decided() {
    return this.#currentRound === null;
  }

  /** Get the results of the game. */
  get result() {
    let ourPoints = 0;
    let theirPoints = 0;
    let tailor = null;
    const tailorGoal = this.#rules.goal - 2;

    for (let r of this.#rounds) {
      if (r.winner === Team.We)
        ourPoints += r.points;
      else if (r.winner === Team.They)
        theirPoints += r.points;

      if (tailor === null && (
        (ourPoints >= tailorGoal && theirPoints === 0)
        || (theirPoints >= tailorGoal && ourPoints === 0)))
      {
        tailor = r.winner;
      }
    }

    let weWon = ourPoints >= this.#rules.goal;
    let theyWon = theirPoints >= this.#rules.goal;
    let winner;

    if (!weWon && !theyWon) {
      return {winner: null, points: 0, ourPoints, theirPoints};
    } else if (weWon && theyWon) {
      throw new Error("game with multiple winners");
    } else if (weWon) {
      winner = Team.We;
    } else {
      winner = Team.They;
    }

    let points;
    if (tailor !== null && winner !== tailor) {
      points = 4;
    } else if (
      tailor !== null
      && winner === tailor
      && (ourPoints === 0 || theirPoints === 0)
    ) {
      points = 2;
    } else {
      points = 1;
    }

    return {winner, points, ourPoints, theirPoints};
  }

  /** Handle changes to the current round. */
  #handleRoundChange() {
    if (this.#currentRound.decided) {
      this.#currentRound.removeEventListener(
        Round.EVENT_CHANGE, this.#boundHandleRoundChange);
      this.#rounds.push(
        new RoundResult(this.#currentRound.points, this.#currentRound.winner));
      this.#currentRound = null;

      let result = this.result;

      if (result.winner === null) {
        this.#currentRound = new Round(
          this.#rules.raisingLimit(result.ourPoints),
          this.#rules.raisingLimit(result.theirPoints));
        this.#currentRound.addEventListener(
          Round.EVENT_CHANGE, this.#boundHandleRoundChange);
      }
    }

    this.dispatchEvent(new CustomEvent(Game.EVENT_CHANGE));
  }

  /** #handleRoundChange, but bound to this instance. */
  #boundHandleRoundChange = this.#handleRoundChange.bind(this);

  /** Export the data of this `Game` as a plain JS object with fields.
   *
   * The internals of the returned object are not stabilized, even if they are
   * visible. It should be treated as opaque.
   *
   * There are only two stabile uses of the object:
   * 1. It can be passed to the `Game` constructor as a single argument. The
   *    constructor will then create a behaviourally identical instance to the
   *    one from which the object was created. This is guaranteed to be
   *    backwards compatible, i.e. a revised version of this class can still
   *    use the objects created by an older version.
   * 2. It can be stored using IndexedDB.
   */
  toStruct() {
    return {
      rules: this.#rules.toStruct(),
      rounds: this.#rounds.map((r) => r.toStruct()),
      currentRound:
        this.#currentRound !== null ? this.#currentRound.toStruct() : null,
    };
  }

  /** Read in an object created by `Game.toStruct` */
  #fromStruct(value) {
    if (typeof value !== "object")
      throw new TypeError("struct must be an object");

    if ("goal" in value && "rules" in value)
      throw new TypeError("struct cannot contain both rules and goal");
    else if ("goal" in value) {
      if (typeof value.goal !== "number")
        throw new TypeError("if struct contains goal, it must be a number");
      if (!Number.isInteger(value.goal) || value.goal < 1)
        throw new RangeError("if struct contains goal, must be integer >= 1");
      this.#rules.goal = value.goal;
      this.#rules.raising = RaisingRule.UntilEnough;
    } else if ("rules" in value) {
      if (typeof value.rules !== "object")
        throw new TypeError("if struct contains rules, they must be an object");
      this.#rules = new GameRules(value.rules);
    } else
      throw new TypeError("struct must contain either rules or goal");

    if (!("rounds" in value))
      throw new TypeError("struct must contain rounds");
    if (!Array.isArray(value.rounds))
      throw new TypeError("struct must contain rounds as array");
    this.#rounds = value.rounds.map((r) => new RoundResult(r));

    if (typeof value.currentRound !== "object")
      throw new TypeError("struct must contain currentRound as object");
    if (this.result.winner === null) {
      if (value.currentRound === null)
        throw new Error(
          "struct of ongoing game must contain current round");
      else {
        this.#currentRound = new Round(value.currentRound);
        this.#currentRound.addEventListener(
          Round.EVENT_CHANGE, this.#boundHandleRoundChange);
      }
    } else if (value.currentRound !== null)
      throw new Error(
        "struct of finished game must not contain current round");
  }
}
