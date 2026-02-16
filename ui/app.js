"use strict";

import Session from "../models/session.js";
import SessionView from "./session.js";
import WbDb from "../data/db.js";
import SessionRepo from "../data/session_repo.js";

export default class App {
  #session = null;

  constructor() {
    let db = WbDb.get();
    if (db.open)
      this.#dbReady();
    else
      db.addEventListener(WbDb.EVENT_CHANGE, this.#dbReady.bind(this));
  }

  async #dbReady() {
    let sessions = await SessionRepo.getAll();
    if (sessions.length === 0) {
      this.#session = new Session();
      SessionRepo.put(this.#session);
    } else
      this.#session = sessions[0];

    m.redraw();
  }

  view() {
    if (this.#session === null) {
      return m("p", "Warte auf Datenbank.");
    }

    return m(SessionView, { model: this.#session });
  }
}
