"use strict";

import Session from "../models/session.js";
import SessionRepo from "../data/session_repo.js";
import SessionList from "./session_list.js";
import SessionView from "./session.js";

export default class Shell {
  /** @type(?Session[]) */
  #sessions = null;
  /** @type(?Session) */
  #currentSession = null;

  constructor() {
    SessionRepo.getAll().then(ls => {
      this.#sessions = ls;
      m.redraw();
    });
  }

  view() {
    if (this.#currentSession !== null)
      return m(SessionView, {
        model: this.#currentSession,
        onDeselect: () => this.#currentSession = null,
      });

    if (this.#sessions !== null)
      return m(SessionList, {
        models: this.#sessions,
        onSelect: async (key) => {
          this.#currentSession = await SessionRepo.get(key) ?? null;
        },
        onNew: async () => {
          let session = new Session();
          await SessionRepo.put(session);
          this.#currentSession = session;
          this.#sessions.splice(0, 0, session);
        }
      });

    return m("p", "Wart kurz, i lad grad die Spiele…");
  }
}
