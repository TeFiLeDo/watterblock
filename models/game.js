"use strict";

import { Round, Team } from "./round.js";
import RoundResult from "./round_result.js";

/** A single game of watten.
 *
 * A game consists of several rounds, and continues until either team reaches
 * a points goal.
 *
 * This class keeps track of individual rounds and their results, and sets up
 * new ones until the game is finished. It also has a `results` property, that
 * calculates who won and how many points they earned.
 */
export default class Game extends EventTarget {
  /** The event triggered when the game is finished. */
  static finishedEvent = "gameFinished";

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

  /** How many points a team needs to win. */
  #goal = 11;

  /** Get how many points are needed to win. */
  get goal() {
    return this.#goal;
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
    if (value === undefined || typeof value === "number") {
      if (typeof value === "number")
        this.#goal = value;

      if (this.#goal < 1)
        throw new RangeError("goal must be at least 1");

      this.#currentRound = new Round(this.#goal, this.#goal);
      this.#currentRound.addEventListener(
        Round.winEvent, this.#boundRoundFinishedHandler);
    } else if (typeof value === "object") {
      this.#fromStruct(value);
    } else {
      throw new TypeError("unknown form of Game constructor");
    }
  }

  /** Get the results of the game. */
  get result() {
    let ourPoints = 0;
    let theirPoints = 0;
    let tailor = null;
    const tailorGoal = this.#goal - 2;

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

    let weWon = ourPoints >= this.goal;
    let theyWon = theirPoints >= this.goal;
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
    } else if (tailor !== null && winner === tailor) {
      points = 2;
    } else {
      points = 1;
    }

    return {winner, points, ourPoints, theirPoints};
  }

  /** Handle it when the current round is finished. */
  #handleRoundFinished() {
    this.#currentRound.removeEventListener(
      Round.winEvent, this.#boundRoundFinishedHandler);
    this.#rounds.push(
      new RoundResult(this.#currentRound.points, this.#currentRound.winner));
    this.#currentRound = null;

    let result = this.result;

    if (result.winner === null) {
      this.#currentRound = new Round(
        Math.max(this.#goal - result.ourPoints, 2),
        Math.max(this.#goal - result.theirPoints, 2));
      this.#currentRound.addEventListener(
        Round.winEvent, this.#boundRoundFinishedHandler);
    } else {
      this.dispatchEvent(new CustomEvent(Game.finishedEvent));
    }
  }

  #boundRoundFinishedHandler = this.#handleRoundFinished.bind(this);

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
      goal: this.#goal,
      rounds: this.#rounds.map((r) => r.toStruct()),
      currentRound:
        this.#currentRound !== null ? this.#currentRound.toStruct() : null,
    };
  }

  /** Read in an object created by `Game.toStruct` */
  #fromStruct(value) {
    if (typeof value !== "object")
      throw new TypeError("struct must be an object");

    if (typeof value.goal !== "number")
      throw new TypeError("struct must contain goal as number");
    if (!Number.isInteger(value.goal) || value.goal < 1)
      throw new RangeError("struct must contain goal >= 1 as integer");
    this.#goal = value.goal;

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
      else
        this.#currentRound = new Round(value.currentRound);
    } else if (value.currentRound !== null)
      throw new Error(
        "struct of finished game must not contain current round");
  }
}
