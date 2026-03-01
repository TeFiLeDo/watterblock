"use strict";

/** Rules for how long teams can raise. */
export const RaisingRule = Object.freeze({
  /** Teams can raìse unless they are stricken.
   *
   * This means a team can win until it needs two points or less to win the
   * game. This corresponds to the starting amount of points.
   */
  UnlessStricken: 1,
  /** Teams can raise until they would win the game if they won the round. */
  UntilEnough: 2,

  /** Check if the passed value is a raising rule.
   *
   * @param {RaisingRule} rule The rule to check.
   * @returns {boolean} Whether the value is a raising rule.
   */
  isRaisingRule(rule) {
    return (rule === RaisingRule.UnlessStricken)
      || (rule === RaisingRule.UntilEnough);
  }
});

/** The rules of a specific game. */
export default class GameRules extends EventTarget {
  /** The event triggered when something about the game rules changes. */
  static get EVENT_CHANGE() { return "wb:game_rules:change"};

  /** The points target needed to win a round. */
  #goal = 11;

  /** Get the points target needed to win a round. */
  get goal() {
    return this.#goal;
  }

  /** Set the points target needed to win a round.
   *
   * Must be at least 1.
   */
  set goal(value) {
    if (!Number.isInteger(value))
      throw new TypeError("goal must be an integer value");
    if (value < 1)
      throw new RangeError("goal must be at least one");
    this.#goal = value;
    this.dispatchEvent(new CustomEvent(GameRules.EVENT_CHANGE));
  }

  /** The rules about how long teams can raise. */
  #raising = RaisingRule.UnlessStricken;

  /** Get the rules about how long teams can raise. */
  get raising() {
    return this.#raising;
  }

  /** Set the rules about how long teams can raise. */
  set raising(value) {
    if (!RaisingRule.isRaisingRule(value))
      throw new TypeError("raising rule must be actual raising rule");
    this.#raising = value;
    this.dispatchEvent(new CustomEvent(GameRules.EVENT_CHANGE));
  }

  constructor(value) {
    super();
    if (value === undefined){
    } else if (value instanceof GameRules) {
      this.goal = value.goal;
      this.raising = value.raising;
    } else if (typeof value === "object") {
      this.#fromStruct(value);
    } else {
      throw new TypeError("unknown form of GameRules constructor");
    }
  }

  /** Calculate to what number a team can raise the points.
   *
   * @param {number} currentPoints The teams current points.
   * @returns {number} The target to which the team can raise.
   */
  raisingLimit(currentPoints) {
    if (this.#raising === RaisingRule.UnlessStricken)
      return (currentPoints >= (this.#goal - 2)) ? 2 : Number.MAX_SAFE_INTEGER;
    if (this.#raising === RaisingRule.UntilEnough)
      return Math.max(this.#goal - currentPoints, 2);
    throw new TypeError("unknown raising rule");
  }

  /** Export the data of this `GameRules` as a plain JS object with fields.
   *
   * The internals of the returned object are not stabilized, even if they are
   * visible. It should be treated as opaque.
   *
   * There are only two stabile uses of the object:
   * 1. It can be passed to the `GameRules` constructor as a single argument.
   *    The constructor will then create a behaviourally identical instance to
   *    the one from which the object was created. This is guaranteed to be
   *    backwards compatible, i.e. a revised version of this class can still
   *    use the objects created by an older version.
   * 2. It can be stored using IndexedDB.
   */
  toStruct() {
    return {
      goal: this.#goal,
      raising: this.#raising,
    };
  }

  /** Read in an object created by `GameRules.toStruct` */
  #fromStruct(value) {
    if (typeof value !== "object")
      throw new TypeError("struct must be an object");

    if (typeof value.goal !== "number")
      throw new TypeError("struct must contain goal as number");
    if (!Number.isInteger(value.goal) || value.goal < 1)
      throw new RangeError("struct must contain goal >= 1 as integer");
    this.#goal = value.goal;

    if (!("raising" in value) || !RaisingRule.isRaisingRule(value.raising))
      throw new TypeError("struct must contain valid raising rule");
    this.#raising = value.raising;
  }
}
