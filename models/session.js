"use strict";

import Game from "./game.js";
import { Team } from "./round.js";

export default class Session {
  /** The amout of points at which individual games are won.
   *
   * Only applies to new games.
   */
  goal = 11;

  /** The name or members of the "we" team. */
  ourTeam = "";

  /** The name or members of the "they" team. */
  theirTeam = "";

  /** The finished games.
   * @type {Game[]}
   */
  #games = [];

  /** Get the finished games.
   *
   * DO NOT write to the returned object.
   */
  get games() {
    return this.#games;
  }

  /** The currently played game.
   * @type {?Game}
   */
  #currentGame = null;

  /** Get the currently played game. */
  get currentGame() {
    return this.#currentGame;
  }

  /** Add another round if there is no current one. */
  anotherGame() {
    if (this.#currentGame === null) {
      this.#currentGame = new Game(this.goal);
      this.#currentGame.addEventListener(
        Game.finishedEvent, this.#boundGameFinishedHandler);
    }
  }

  /** Get the current amouts of points.
   *
   * Note that on this level points are a punishment.
   */
  get result() {
    let ourPoints = 0;
    let theirPoints = 0;

    for (let g of this.#games) {
      let r = g.result;
      if (r.winner === Team.We) {
        theirPoints += r.points;
      } else if (r.winner === Team.They) {
        ourPoints += r.points;
      }
    }

    return { ourPoints, theirPoints };
  }

  /** Handle it when the current game is finished. */
  #gameFinishedHandler() {
    this.#currentGame.removeEventListener(
      Game.finishedEvent, this.#boundGameFinishedHandler);
    this.#games.push(this.#currentGame);
    this.#currentGame = null;
  }

  #boundGameFinishedHandler = this.#gameFinishedHandler.bind(this);

  constructor(value) {
    if (value === undefined) {
    } else if (typeof value === "object") {
      if (!("goal" in value))
        throw new TypeError("missing goal in deserialization object");
      if (typeof value.goal !== "number")
        throw new TypeError("goal in deserialization object must be number");
      this.goal = value.goal;

      if (!("ourTeam" in value))
        throw new TypeError("missing ourTeam in deserialization object");
      if (typeof value.ourTeam !== "string")
        throw new TypeError(
          "ourTeam in deserialization object must be string");
      this.ourTeam = value.ourTeam;

      if (!("theirTeam" in value))
        throw new TypeError("missing theirTeam in deserialization object");
      if (typeof value.theirTeam !== "string")
        throw new TypeError(
          "theirTeam in deserialization object must be string");
      this.theirTeam = value.theirTeam;

      if (!("games" in value))
        throw new TypeError("missing games in deserialization object");
      if (!Array.isArray(value.games))
        throw new TypeError("games in deserialization object must be array");
      for (let g of value.games) {
        let game = new Game (g);
        if (game.result.winner === null)
          throw new TypeError("past game cannot be unfinished");
        this.#games.push(game);
      }

      if (!("currentGame" in value))
        throw new TypeError("missing currentGame in deserialization object");
      if (value.currentGame !== null) {
        this.#currentGame = new Game(value.currentGame);
        if (this.#currentGame.result.winner !== null)
          throw new Error("currentGame cannot be finished");
      }
    } else {
      throw new TypeError("unknown form of Session constructor");
    }
  }

  /** Export needed data for JSON serialization. */
  toJSON() {
    return {
      goal: this.goal,
      ourTeam: this.ourTeam,
      theirTeam: this.theirTeam,
      games: this.#games,
      currentGame: this.#currentGame,
    }
  }
}
