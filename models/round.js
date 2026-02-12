"use strict";

/** A specific team.
 * @enum {number}
 */
export const Team = Object.freeze({
  /** The "we" team, from the perspective of the score keeper. */
  We: 1,
  /** The "they" team, from the perspective of the score keeper. */
  They: 2,

  /** Check if the passed value is a team.
   *
   * @param {Team} team The team to check.
   * @returns Whether the value is a team.
   */
  isTeam(team) {
    return (team === Team.We) || (team === Team.They);
  }
});

/** A single round of watten.
 *
 * A game consists of multiple rounds, for each of which points can be won.
 * Rounds are mostly independet from each other. The only bleedover is how
 * often each team can raise the points available.
 *
 * This class is specifically meant to represent the current round, and is not
 * ideal for storing past results.
 *
 * This project is not concerned with creating an online version of the game,
 * the aim is to create a convenient score keeping system. Therefore this class
 * only implements the raising mechanics, and no actual game play.
 */
export class Round extends EventTarget {
  /** The event triggered when the round is won. */
  static winEvent= "roundWon";

  /** The maximum the "we" team may raise to. */
  #ourLimit = 11;
  /** The maximum the "they" team may raise to. */
  #theirLimit = 11;

  constructor(value, theyLimit) {
    super();

    if (value === undefined && theyLimit === undefined) {
    } else if (typeof value === "number" && typeof theyLimit === "number") {
      if (value < this.#points)
        throw new RangeError("`ourLimit` must be larger than default points");
      if (theyLimit < this.#points)
        throw new RangeError(
          "`theirLimit` must be larger than default points");
      this.#ourLimit = value;
      this.#theirLimit = theyLimit;
    } else if (typeof value === "object" && theyLimit === undefined) {
      this.#fromStruct(value);
    } else {
      throw new TypeError("unknown form for Round constructor");
    }
  }

  /** How many points the game is worth. */
  #points = 2;

  /** Get how many points the current game is worth. */
  get points() {
    return this.#points;
  }

  /** Which team raised last.
   * @type {?Team}
   */
  #raisedLast = null;

  /** Who won the round.
   * @type {?Team}
   */
  #winner = null;

  /** Get the winner of the round.
   *
   * @returns {?Team} The winning team, or `null` if the round is not yet
   * decided.
   */
  get winner() {
    return this.#winner;
  }

  /** Set the winner of the round.
   *
   * @param {Team} team The team that won the round.
   */
  set winner(team) {
    if (team !== Team.We && team !== Team.They)
      throw new TypeError("only actual teams can win");
    if (this.decided)
      throw new Error("decided round cannot be won again");

    this.#winner = team;
    this.dispatchEvent(new CustomEvent(Round.winEvent));
  }

  /** Check whether the round has been decided. */
  get decided() {
    return this.#winner !== null;
  }

  /** Check whether a team can raise.
   *
   * Note that this only checks if the team can raise. It does not check
   * whether the team may raise.
   *
   * @param {Team} team The team to check for.
   * @returns {boolean} Whether the team can raise.
   */
  canRaise(team) {
    if (team !== Team.We && team !== Team.They)
      throw new TypeError("only actual teams can raise");
    return !this.decided && this.#raisedLast !== team;
  }

  /** A team raises the points.
   *
   * Does nothing if the team cannot raise. Ends the round if a team raises
   * that may not do so. Raises the points otherwise.
   *
   * @param {Team} team The team that wishes to raise.
   */
  raise(team) {
    if (team !== Team.We && team !== Team.They)
      throw new TypeError("only actual teams can raise");

    if (!this.canRaise(team)) return;

    if (team === Team.We && this.points >= this.#ourLimit) {
      this.winner = Team.They;
      return;
    }

    if (team === Team.They && this.points >= this.#theirLimit) {
      this.winner = Team.We;
      return;
    }

    this.#raisedLast = team;
    this.#points += 1;
  }

  /** Export the data of this `Round` as a plain JS object with fields.
   *
   * The internals of the returned object are not stabilized, even if they are
   * visible. It should be treated as opaque.
   *
   * There are only two stabile uses of the object:
   * 1. It can be passed to the `Round` constructor as a single argument. The
   *    constructor will then create a behaviourally identical instance to the
   *    one from which the object was created. This is guaranteed to be
   *    backwards compatible, i.e. a revised version of this class can still
   *    use the objects created by an older version.
   * 2. It can be stored using IndexedDB.
   */
  toStruct() {
    return {
      points: this.#points,
      raisedLast: this.#raisedLast,
      winner: this.#winner,
      ourLimit: this.#ourLimit,
      theirLimit: this.#theirLimit,
    }
  }

  /** Read in an object created by `Round.toStruct` */
  #fromStruct(value) {
    if (typeof value !== "object")
      throw new TypeError("struct must be an object");

    if (typeof value.points !== "number")
      throw new TypeError("struct must contain points as number");
    if (!Number.isInteger(value.points) || value.points < 2)
      throw new RangeError("struct must contain points >= 2 as integer");
    this.#points = value.points;

    if (!("raisedLast" in value))
      throw new TypeError("struct must contain raisedLast");
    if (value.raisedLast !== null && !Team.isTeam(value.raisedLast))
      throw new TypeError("struct must contain raisedLast as Team or null");
    this.#raisedLast = value.raisedLast;

    if (!("winner" in value))
      throw new TypeError("struct must contain winner");
    if (value.winner !== null && !Team.isTeam(value.winner))
      throw new TypeError("struct must contain winner as Team or null");
    this.#winner = value.winner;

    if (typeof value.ourLimit !== "number")
      throw new TypeError("struct must contain ourLimit as number");
    if (!Number.isInteger(value.ourLimit) || value.ourLimit < 2)
      throw new RangeError("struct must contain ourLimit >= 2 as integer");
    this.#ourLimit = value.ourLimit;

    if (typeof value.theirLimit !== "number")
      throw new TypeError("struct must contain theirLimit as number");
    if (!Number.isInteger(value.theirLimit) || value.theirLimit < 2)
      throw new RangeError("struct must contain theirLimit >= 2 as integer");
    this.#theirLimit = value.theirLimit;
  }
}
