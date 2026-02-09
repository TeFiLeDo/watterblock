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
      if (!("points" in value))
        throw new TypeError("missing points in deserialization object");
      if (typeof value.points !== "number")
        throw new TypeEror("points in deserialization object must be number");
      this.#points = value.points;

      if (!("winner" in value))
        throw new TypeError("missing winner in deserialization object");
      if (value.winner !== Team.We && value.winner !== Team.They)
        throw new TypeError("winner in deserialization object not real team");
      this.#winner = value.winner;
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

  /** Export needed data for JSON serialization. */
  toJSON() {
    return {
      points: this.#points,
      winner: this.#winner,
    };
  }
}
