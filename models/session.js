"use strict";

import Game from "./game.js";
import { Team } from "./round.js";

/** A session of Watten.
 *
 * A session consists of several games, and can be continued for as long as the
 * players want to.
 *
 * This class keeps track of various games and offers the functionality to
 * start new ones. It also has a `result` property, that calculates the current
 * points totals.
 *
 * Note that game points are punitive, players want to avoid earning them.
 * Sessions are also self contained, there is no higher construct they are a
 * part of.
 */
export default class Session {
  /** The ID of this session. */
  id = null;

  /** The amout of points at which individual games are won.
   *
   * Only applies to new games.
   */
  #goal = 11;

  /** Get the goal for new games. */
  get goal() {
    return this.#goal;
  }

  /** Set the goal for new games. */
  set goal(value) {
    if (typeof value !== "number")
      throw new TypeError("goal must be a number");
    if (!Number.isInteger(value) || value < 1)
      throw new RangeError("goal must be integer >= 1");
    this.#goal = value;
  }

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
        Game.EVENT_CHANGE, this.#boundHandleGameChange);
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

  /** Handle changes to the current game. */
  #handleGameChange() {
    if (this.#currentGame.decided) {
      this.#currentGame.removeEventListener(
        Game.EVENT_CHANGE, this.#boundHandleGameChange);
      this.#games.push(this.#currentGame);
      this.#currentGame = null;
    }
  }

  /** #handleGameChange, but bound to this instance. */
  #boundHandleGameChange = this.#handleGameChange.bind(this);

  constructor(value) {
    if (value === undefined) {
    } else if (typeof value === "object") {
      this.#fromStruct(value);
    } else {
      throw new TypeError("unknown form of Session constructor");
    }
  }

  /** Export the data of this `Session` as a plain JS object with fields.
   *
   * The internals of the returned object are not stabilized, even if they are
   * visible. It should be treated as opaque.
   *
   * There are only two stabile uses of the object:
   * 1. It can be passed to the `Session` constructor as a single argument. The
   *    constructor will then create a behaviourally identical instance to the
   *    one from which the object was created. This is guaranteed to be
   *    backwards compatible, i.e. a revised version of this class can still
   *    use the objects created by an older version.
   * 2. It can be stored using IndexedDB.
   */
  toStruct() {
    let res = {
      goal: this.#goal,
      ourTeam: this.ourTeam,
      theirTeam: this.theirTeam,
      games: this.#games.map((g) => g.toStruct()),
      currentGame:
        this.#currentGame !== null ? this.#currentGame.toStruct() : null,
    };

    if (this.id !== null)
      res.id = this.id;

    return res;
  }

  /** Read in an object created by `Session.toStruct` */
  #fromStruct(value) {
    if (typeof value !== "object")
      throw new TypeError("struct must be an object");

    if ("id" in value) {
      if (typeof value.id !== "number")
        throw new TypeError("if struct contains id, then it must be a number");
      if (!Number.isInteger(value.id))
        throw new RangeError(
          "if struct contains id, then it must be an integer");
      this.id = value.id;
    }

    if (typeof value.goal !== "number")
      throw new TypeError("struct must contain goal as number");
    if (!Number.isInteger(value.goal) || value.goal < 1)
      throw new RangeError("struct must contain goal >= 1 as integer");
    this.#goal = value.goal;

    if (typeof value.ourTeam !== "string")
      throw new TypeError("struct must contain ourTeam as string");
    this.ourTeam = value.ourTeam;

    if (typeof value.theirTeam !== "string")
      throw new TypeError("struct must contain theirTeam as string");
    this.theirTeam = value.theirTeam;

    if (!("games" in value))
      throw new TypeError("struct must contain games");
    if (!Array.isArray(value.games))
      throw new TypeError("struct must contain games as array");
    this.#games = value.games.map((g) => new Game(g));
    for (let g of this.#games)
      if (g.result.winner === null)
        throw new Error("past games must be finished");

    if (typeof value.currentGame !== "object")
      throw new TypeError("struct must contain currentGame as object");
    if (value.currentGame !== null) {
      this.#currentGame = new Game(value.currentGame);
      if (this.#currentGame.result.winner !== null)
        throw new Error("currentGame in struct must not be finished");
    }
  }
}
