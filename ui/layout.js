"use strict";

import WbDb from "/data/db.js";

export default class Layout {
  #db = WbDb.get();
  #dbErrorsHandled = false;

  constructor() {
    // set up event handler once db opens
    this.#db.addEventListener(WbDb.EVENT_CHANGE, () => {
      if (!this.#dbErrorsHandled) {
        this.#db.addEventListener("error", this.#handleDbError.bind(this));
        this.#dbErrorsHandled = true;
      }
      m.redraw();
    });

    // set up event handler if db is already open
    if (this.#db.open && !this.#dbErrorsHandled) {
      this.#db.addEventListener("error", this.#handleDbError.bind(this));
      this.#dbErrorsHandled = true;
    }
  }

  #handleDbError(error) {
    console.error("database error", error);
  }

  view({ children, attrs: { backHref }}) {
    if (this.#db.failed)
      return m(".wb-splash", [
        m("h1", ["Watterblock", m("br"), "geht nit"]),
        m("p", [
          "Di Spieldatnbank kann nit aufgmacht werdn. Des is fast sicha a ",
          "Fehla im Kod. Meld di doch bitte bei ",
          m("a", { href: "mailto:tfld@tfld.dev" }, "tfld@tfld.dev"), " und ",
          "gib ma bscheid, damit i des repariern kann.",
        ]),
      ]);

    if (this.#db.blocked)
      return m(".wb-splash", [
        m("h1", ["Watterblock", m("br"), "muss warten"]),
        m("p", [
          "Di Spieldatnbank muas bessa gmacht werdn. Des geht aba nit, solang ",
          "da Block no in am andern Tab offn is."
        ]),
        m("p", "Bitte mach alle andern Watterblock-Tabs zua oda lad si nei!"),
      ]);

    if (!this.#db.open)
      return m(".wb-splash", [
        m(".spinner"),
        m("h1", "Watterblock"),
        m("p", "Geduld, i mach grad di Datnbank auf…"),
      ]);

    return m.fragment([
      m("header.header._alternate._apply", [
        backHref
          ? m(m.route.Link, { href: backHref },
              m("span.material-symbols-outlined", "arrow_back"),
            )
          : null,
        m("h1.spacer", m(m.route.Link, { href: "/" }, "Watterblock")),
        m(m.route.Link, { href: "/info" },
          m("span.material-symbols-outlined", "info"),
        ),
      ]),
      m("main.main", children),
    ]);
  }
}
