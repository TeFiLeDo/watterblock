"use strict";

import Session from "../models/session.js";
import WbDb from "../data/db.js";
import SessionRepo from "../data/session_repo.js";
import SessionList from "./session_list.js";

export default class App {
  #sessions = [];

  constructor() {
    let db = WbDb.get();
    if (db.open)
      this.#dbReady();
    else
      db.addEventListener(WbDb.EVENT_CHANGE, this.#dbReady.bind(this));
  }

  async #dbReady() {
    this.#sessions = await SessionRepo.getAll();
    m.redraw();
  }

  view() {
    return m(SessionList, {
      models: this.#sessions,
      onSelect: (key) => console.log("selected", key),
      onNew: () => console.log("new"),
    });
  }
}
