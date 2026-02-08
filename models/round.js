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
export class Round {
  /** The maximum the "we" team may raise to. */
  #weLimit = 11;
  /** The maximum the "they" team may raise to. */
  #theyLimit = 11;

  constructor(weLimit, theyLimit) {
    if (weLimit !== undefined && weLimit !== null) {
      if (typeof weLimit !== "number")
        throw new TypeError("if specified, `weLimit` must be a number");
      if (weLimit < this.#points)
        throw new RangeError("`weLimit` must be larger than default points");
      this.#weLimit = weLimit;
    }

    if (theyLimit !== undefined && theyLimit !== null) {
      if (typeof theyLimit !== "number")
        throw new TypeError("if specified, `theyLimit` must be a number");
      if (theyLimit < this.#points)
        throw new RangeError("`theyLimit` must be larger than default points");
      this.#theyLimit = theyLimit;
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
      this.#winner = Team.They;
      return;
    }

    if (team === Team.They && this.points >= this.#theyLimit) {
      this.#winner = Team.We;
      return;
    }

    this.#raisedLast = team;
    this.#points += 1;
  }
}
