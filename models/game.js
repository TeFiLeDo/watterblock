"use strict";

import { Round, Team } from "./round.js";
import RoundResult from "./round_result.js";

export default class Game {
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
    if (value === undefined || typeof value === "number") {
      if (typeof value === "number")
        this.#goal = value;

      this.#currentRound = new Round(this.#goal, this.#goal);
      this.#currentRound.addEventListener(
        Round.winEvent, this.#boundRoundFinishedHandler);
    } else if (typeof value === "object") {
      if (!("goal" in value))
        throw new TypeError("missing goal in deserialization object");
      if (typeof value.goal !== "number")
        throw new TypeError("goal in deserialization object must be number");
      this.#goal = value.goal;

      if (!("rounds" in value))
        throw new TypeError("missing rounds in deserialization object");
      if (!Array.isArray(value.rounds))
        throw new TypeError("rounds in deserialization object must be array");
      for (let r of value.rounds)
        this.#rounds.push(new RoundResult(r));

      if (!("currentRound" in value))
        throw new TypeError("missing currentRound in deserialization object");
      if (this.result.winner === null)
        this.#currentRound = new Round(value.currentRound);
      else if (value.currentRound !== null)
        throw new TypeError("currentRound in finished game must be null");
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
    }
  }

  #boundRoundFinishedHandler = this.#handleRoundFinished.bind(this);

  /** Export needed data for JSON serialization. */
  toJSON() {
    return {
      goal: this.#goal,
      rounds: this.#rounds,
      currentRound: this.#currentRound,
    };
  }
}
