"use strict";

import { Round, Team } from "./round.js";

export default class RoundResult {
  /** How many points the round was worth.
   * @type {number}
   */
  #points;
  /** Who wan the round.
   * @type {Team}
   */
  #winner;

  constructor(value, winner) {
    if (typeof value === "number"
      && (winner === Team.We || winner === Team.They))
    {
      this.#points = value;
      this.#winner = winner;
    } else if (typeof value === "object" && winner === undefined) {
      this.#fromStruct(value);
    } else {
      throw new TypeError("unknown form for RoundResult constructor");
    }
  }

  /** Get the points the round was worth. */
  get points() {
    return this.#points;
  }

  /** Get the winner of the round.
   *
   * @returns {Team} The winner of the round.
   */
  get winner() {
    return this.#winner;
  }

  /** Export the data of this `RoundResult` as a plain JS object with fields.
   *
   * The internals of the returned object are not stabilized, even if they are
   * visible. It should be treated as opaque.
   *
   * There are only two stabile uses of the object:
   * 1. It can be passed to the `RoundResult` constructor as a single argument.
   *    The constructor will then create a behaviourally identical instance to
   *    the one from which the object was created. This is guaranteed to be
   *    backwards compatible, i.e. a revised version of this class can still
   *    use the objects created by an older version.
   * 2. It can be stored using IndexedDB.
   */
  toStruct() {
    return {
      points: this.#points,
      winner: this.#winner,
    }
  }

  /** Read in an object created by `RoundResult.toStruct` */
  #fromStruct(value) {
    if (typeof value !== "object")
      throw new TypeError("struct must be an object");

    if (typeof value.points !== "number")
      throw new TypeError("struct must contain points as number");
    if (!Number.isInteger(value.points) || value.points < 2)
      throw new RangeError("struct must contain points >= 2 as integer");
    this.#points = value.points;

    if (!("winner" in value))
      throw new TypeError("struct must contain winner");
    if (!Team.isTeam(value.winner))
      throw new TypeError("struct must contain winner as Team");
    this.#winner = value.winner;
  }
}
