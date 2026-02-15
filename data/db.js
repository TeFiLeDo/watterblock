"use strict";

/** A wrapper around an IndexedDB.
 *
 * This wrapper handles the following tasks:
 * 1. Open the connection to the database.
 * 2. Transform the events of that request into a form more suitable for UI.
 * 3. Manage the DB schema (object stores, indexes, migrations, …).
 *
 * In production this also behaves as a singleton, while allowing multiple
 * instances specifically for testing.
 */
export default class WbDb extends EventTarget {
  /** The name of the event fired when the state changes. */
  static get EVENT_CHANGE() { return "change"; }

  /** The name of the `IDBDatabase`. */
  static get DB_NAME() { return "watterblock"; }
  /** The name of the test `IDBDatabase`. */
  static get DB_NAME_TEST() { return "test-watterblock"; }
  /** The currently correct DB version. */
  static get DB_VERSION() { return 1; }

  /** The name of the `IDBObjectStore` for `Session`s. */
  static get OS_SESSIONS() { return "sessions"; }

  /** Whether the WbDb constructor may be called. */
  static #mayConstruct = false;
  /** The single instance of this class.
   * @type {?WbDb} */
  static #instance = null;

  constructor(testing, version) {
    if (!WbDb.#mayConstruct) {
      throw new TypeError("WbDb may not be constructed externally");
    }
    WbDb.#mayConstruct = false;

    super();

    let req = indexedDB.open(
      testing ? WbDb.DB_NAME_TEST : WbDb.DB_NAME,
      testing ? version : WbDb.DB_VERSION);
    req.addEventListener("blocked", this.#handleBlocked.bind(this));
    req.addEventListener("upgradeneeded", this.#handleUpgrade.bind(this));
    req.addEventListener("error", this.#handleError.bind(this));
    req.addEventListener("success", this.#handleSuccess.bind(this));
  }

  /** Get an instance of `WbDb`.
   *
   * If `testing` is `true`, a oneof instance is created, that connects to a
   * testing database. In that case `version` can be used to set the database
   * up for a specific version, so it can be tested.
   *
   * Otherwise all calls return the same instance.
   *
   * @param {boolean=} testing Whether to open a regular or testing connection.
   * @param {number=} version The version to open a testing connection for.
   */
  static get(testing, version) {
    if (testing) {
      WbDb.#mayConstruct = true;
      return new WbDb(true, version ?? WbDb.DB_VERSION);
    }

    if (WbDb.#instance === null) {
      WbDb.#mayConstruct = true;
      WbDb.#instance = new WbDb();
    }

    return WbDb.#instance;
  }

  /** The actual IndexedDB.
   * @type{?IDBDatabase}
   */
  #db = null;
  /** Whether the opening of the DB is currently blocked. */
  #blocked = false;
  /** Whether opening the DB has failed. */
  #failed = false;

  /** Get the actual database. */
  get db() {
    if (this.#db === null)
      throw new Error("WbDb is not yet open");

    return this.#db;
  }

  /** Shorthand for `WbDb.get().db()`; */
  static getDb() {
    return WbDb.get().db();
  }

  /** Check whether the database opening has been blocked. */
  get blocked() {
    return this.#blocked;
  }

  /** Check whether the database is opened yet. */
  get open() {
    return this.#db !== null;
  }

  /** Check whether opening the database has failed. */
  get failed() {
    return this.#failed;
  }

  /** Handle the `blocked` event for opening the DB.
   * @param {IDBVersionChangeEvent} event The actual event.
   */
  #handleBlocked(event) {
    this.#blocked = true;
    this.dispatchEvent(new CustomEvent(WbDb.EVENT_CHANGE));
  }

  /** Handle the `upgradeneeded` event from opening the DB.
   * @param {IDBVersionChangeEvent} event The actual event.
   */
  #handleUpgrade(event) {
    let {
      oldVersion: old,
      newVersion: now,
      target: { result: db, transaction: trans },
    } = event;

    if (old < 1 && now >= 1)
      this.#version1(db, trans);
  }

  /** Handle the `error` event from opening the DB.
   * @param {Event} event The actual event.
   */
  #handleError(event) {
    this.#failed = true;
    this.dispatchEvent(new CustomEvent(WbDb.EVENT_CHANGE));
  }

  /** Handle the `success` event from opening the DB.
   * @param {Event} event The actual event.
   */
  #handleSuccess(event) {
    this.#blocked = false;
    this.#db = event.target.result;
    this.dispatchEvent(new CustomEvent(WbDb.EVENT_CHANGE));
  }

  /** Do the migration for db version 1.
   * @param {IDBDatabase} db The db to upgrade.
   * @param {IDBTransaction} trans The db transaction.
   */
  #version1(db, trans) {
    db.createObjectStore(WbDb.OS_SESSIONS, {
      keyPath: "id",
      autoIncrement: true,
    });
  }
}
