"use strict";

/** A specific team.
 * @enum {number}
 */
export const Team = Object.freeze({
  /** The "we" team, from the perspective of the score keeper. */
  We: 1,
  /** The "they" team, from the perspective of the score keeper. */
  They: 2,
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
  /** The maximum the "we" team may raise to. */
  #weLimit = 11;
  /** The maximum the "they" team may raise to. */
  #theyLimit = 11;

  constructor(value, theyLimit) {
    super();

    if (value === undefined && theyLimit === undefined) {
    } else if (typeof value === "number" && typeof theyLimit === "number") {
      if (value < this.#points)
        throw new RangeError("`weLimit` must be larger than default points");
      if (theyLimit < this.#points)
        throw new RangeError("`theyLimit` must be larger than default points");
      this.#weLimit = value;
      this.#theyLimit = theyLimit;
    } else if (typeof value === "object" && theyLimit === undefined) {
      if (!("points" in value))
        throw new TypeError("missing points in deserialization object");
      if (typeof value.points !== "number")
        throw new TypeError("points in deserialization object must be number");
      this.#points = value.points;

      if (!("raisedLast" in value))
        throw new TypeError("missing raisedLast in deserialization object");
      if (value.raisedLast !== Team.We
        && value.raisedLast !== Team.They
        && value.raisedLast !== null)
      {
        throw new TypeError(
          "team raising last must be an actual team in deserialization object"
        );
      }
      this.#raisedLast = value.raisedLast;

      if (!("winner" in value))
        throw new TypeError("missing winner in deserialization object");
      if (value.winner !== Team.We
        && value.winner !== Team.They
        && value.winner !== null)
      {
        throw new TypeError(
          "winning team must be an actual team in deserialization object");
      }
      this.#winner = value.winner;

      if (!("weLimit" in value))
        throw new TypeError("missing weLimit in deserialization object");
      if (typeof value.weLimit !== "number")
        throw new TypeError(
          "weLimit in deserialization object must be a number");
      this.#weLimit = value.weLimit;

      if (!("theyLimit" in value))
        throw new TypeError("missing theyLimit in deserialization object");
      if (typeof value.theyLimit !== "number")
        throw new TypeError(
          "theyLimit in deserialization object must be a number");
      this.#theyLimit = value.theyLimit;
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

  /** Check whether the round has been decided. */
  get decided() {
    return this.#winner !== null;
  }

  static victoryEvent = "roundWon";

  /** A team has won the round.
   *
   * @param {Team} team The team that won the round.
   */
  won(team) {
    if (team !== Team.We && team !== Team.They)
      throw new TypeError("only actual teams can win");
    if (this.decided)
      throw new Error("decided round cannot be won again");

    this.#winner = team;
    this.dispatchEvent(new CustomEvent(Round.victoryEvent));
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

    if (team === Team.We && this.points >= this.#weLimit) {
      this.won(Team.They);
      return;
    }

    if (team === Team.They && this.points >= this.#theyLimit) {
      this.won(Team.We);
      return;
    }

    this.#raisedLast = team;
    this.#points += 1;
  }

  /** Export needed data for JSON serialization. */
  toJSON() {
    return {
      points: this.#points,
      raisedLast: this.#raisedLast,
      winner: this.#winner,
      weLimit: this.#weLimit,
      theyLimit: this.#theyLimit,
    };
  }
}
