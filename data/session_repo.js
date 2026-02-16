"use strict";

import Session from "../models/session.js";
import WbDb from "./db.js";

/** A transaction or known type that can be turned into a transaction.
 * @typedef {IDBTransaction|IDBDatabase|WbDb=} Transactable
 *
 * 1. If the transactable is a transaction already, it shall be used directy.
 *    No validation of the accessible object stores or mode should be done, the
 *    creator is responsible for ensuring correctness of those.
 * 2. If the transactable is a database, a transaction with the provided stores
 *    shall be started on it.
 * 3. If the transactable is an instance of `WbDb`, a transaction shall be
 *    started on its database.
 * 4. Otherwise a transaction shall be started on the main `WbDb` instance.
 */

/** Transform a `Transactable` into a transaction.
 *
 * @param {Transactable} value The `Transactable` to turn into a transaction.
 * @param {string[]} stores
 * The object stores to acquire if the transaction has to be started.
 * @param {IDBTransactionMode=} mode The transaction mode to use.
 * @returns {IDBTransaction} A usable transaction.
 */
function toTransaction(value, stores, mode) {
  if (value === undefined)
    value = WbDb.get();
  if (value instanceof WbDb)
    value = value.db;
  if (value instanceof IDBDatabase)
    value = value.transaction(stores, mode);
  if (!(value instanceof IDBTransaction))
    throw new TypeError("transaction must be or become a IDBTransaction");
  return value;
}

/** Turn a request into a promise.
 *
 * The promise fulfills if the request succeeds, and rejects if it fails.
 *
 * @param {IDBRequest} request The request to wrap.
 * @returns A promise linked to the request.
 */
function requestToPromise(request) {
  return new Promise(function(resolve, reject) {
    request.onsuccess = (req) => resolve(req.target.result);
    request.onerror = reject;
  });
}

/** Collection of static function to interact with stored sessions. */
export default class SessionRepo {
  constructor() {
    throw new TypeError("SessionRepo cannot be constructed");
  }

  /** Put a session into the repository.
   *
   * If the passed session has no `id` set, the newly stored ID will be
   * inserted back into it.
   *
   * @param {Session} session The session to store.
   * @param {Transactable} transaction A transaction to use.
   *
   * @returns {Promise<number>} A promise containing the ID of the add session.
   */
  static put(session, transaction) {
    if (!(session instanceof Session))
      throw new TypeError("session to put in must be an actual Session");

    transaction = toTransaction(transaction, [WbDb.OS_SESSIONS], "readwrite");
    let sessions = transaction.objectStore(WbDb.OS_SESSIONS);

    let struct = session.toStruct();
    let req = requestToPromise(sessions.put(struct));

    // promise with which the session object can be altered
    let alt = req;

    // add id to original object if it is new
    if (session.id === null)
      alt = alt.then((id) => session.id = id);

    // add change listener t oobject.
    alt.then(() => { if (session[SessionRepo.#marker] === undefined) {
      session.addEventListener(
        Session.EVENT_CHANGE, SessionRepo.#handleChange);
      session[SessionRepo.#marker] = transaction.db;
    }});

    // make sure alt is handled first
    return req.then(res => res);
  }

  /** Get all sessions in the repository.
   *
   * @param {Transactable} transaction A transaction to use.
   *
   * @returns {Promise<Session[]>} A promise containing the stored sessions.
   */
  static async getAll(transaction) {
    transaction = toTransaction(transaction, [WbDb.OS_SESSIONS], "readonly");
    let sessions = transaction.objectStore(WbDb.OS_SESSIONS);

    sessions = await requestToPromise(sessions.getAll());
    return sessions.map(function(session) {
      let res = new Session(session);
      res.addEventListener(Session.EVENT_CHANGE, SessionRepo.#handleChange);
      res[SessionRepo.#marker] = transaction.db;
      return res;
    });
  }

  /** The symbol used to attach needed data to sessions. */
  static #marker = Symbol("data/session_store");

  /** Handle the Session.EVENT_CHANGE event, by storing the changed session in
   * the DB.
   */
  static async #handleChange() {
    if (!(this instanceof Session))
      throw new TypeError("session to put in must be an actual Session");
    SessionRepo.put(this, this[SessionRepo.#marker]);
  }
}
