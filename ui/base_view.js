"use strict";

import Session from "/models/session.js";
import SessionRepo from "/data/session_repo.js";
import SessionList from "/ui/session_list.js";
import SessionView from "/ui/session.js";

export default class BaseView {
  #model = new BaseViewModel();

  oninit() {
    this.#model.loadAllSessions();
  }

  view(vnode) {
    if (vnode.attrs.newSession)
      this.#model.newSession();
    else
      this.#model.current = vnode.attrs.session;

    if (this.#model.current !== null)
      return m(SessionView, { model: this.#model.current });

    if (this.#model.sessions !== null)
      return m(SessionList, {
        models: this.#model.sessions,
        onSelect: (session) => this.#model.current = session,
      });

    return m("p", "Wart kurz, i lad grad die Spiele…");
  }
}

class BaseViewModel {
  #current = null;
  #currentLoading = null;

  get current() {
    return this.#current;
  }

  #setCurrent(value) {
    if (this.#current !== null)
      this.#current.removeEventListener(
        Session.EVENT_CHANGE, this.#handleCurrentUpdate);
    if (value !== null)
      value.addEventListener(Session.EVENT_CHANGE, this.#handleCurrentUpdate);
    this.#current = value;
  }

  set current(value) {
    if (value instanceof Session) {
      this.#setCurrent(value);
      this.#currentLoading = null;

    } else if (typeof value === "number") {
      if (value === this.#current?.id || value === this.#currentLoading)
        return;
      this.#currentLoading = value;
      SessionRepo
        .get(value)
        .then((s) => {
          if (this.#currentLoading === s?.id)
            this.#setCurrent(s);
        })
        .catch((e) => {
          console.error("failed to load session: ", e);
        })
        .finally(() => {
          m.redraw();
          if (this.#currentLoading === value)
            this.#currentLoading = null;
        });

    } else if (value === null) {
      if (this.#current === null)
        return;
      this.#setCurrent(null);
      this.#currentLoading = null;

    } else {
      throw new TypeError("current session must be session or id or null");
    }
  }

  get currentLoading() {
    return this.#currentLoading !== null;
  }

  static #newSessionMarker = Symbol("new session loading");

  newSession() {
    if (this.#currentLoading === BaseViewModel.#newSessionMarker)
      return;

    this.#currentLoading = BaseViewModel.#newSessionMarker;

    let session = new Session();
    SessionRepo
      .put(session)
      .then(() => {
        if (this.#currentLoading === BaseViewModel.#newSessionMarker) {
          this.#setCurrent(session);
          this.#sessions.splice(0, 0, session);
          m.route.set("/", { session: session.id }, { replace: true });
        }
      })
      .catch((e) => {
        console.error("failed to create new session: ", e);
        if (this.#currentLoading === BaseViewModel.#newSessionMarker)
          m.route.set(
            "/",
            { session: this.#current?.id ?? undefined },
            { replace: true });
        else
          m.redraw();
      })
      .finally(() => {
        if (this.#currentLoading === BaseViewModel.#newSessionMarker)
          this.#currentLoading = null;
      });
  }

  #sessions = null;
  #sessionsLoading = false;

  get sessions() {
    return this.#sessions;
  }

  loadAllSessions() {
    if (this.#sessionsLoading)
      return;

    this.#sessionsLoading = true;
    SessionRepo
      .getAllFromNewest()
      .then(s => this.#sessions = s)
      .finally(() => {
        this.#sessionsLoading = false;
        m.redraw();
      });
  }

  #handleCurrentUpdate = (e) => {
    if (this.#current !== e.target || this.#current === this.#sessions[0]) {
      e.target.removeEventListener(
        Session.EVENT_CHANGE, this.#handleCurrentUpdate);
      return;
    }

    if (this.#current?.id === this.#sessions[0]?.id) {
      e.target.removeEventListener(
        Session.EVENT_CHANGE, this.#handleCurrentUpdate);
      this.#sessions[0] = this.#current;
      return;
    }

    this.loadAllSessions();
  };

}
