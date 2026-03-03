"use strict";

import WbDb from "/data/db.js";

export default class Layout {
  #db = WbDb.get();
  #dbErrorsHandled = false;

  constructor() {
    this.#db.addEventListener(WbDb.EVENT_CHANGE, () => {
      if (!this.#dbErrorsHandled) {
        this.#db.addEventListener("error", this.#handleDbError.bind(this));
        this.#dbErrorsHandled = true;
      }
      m.redraw();
    });

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
      return m.fragment([
        m("h1", "Watterblock kann nicht geöffnet werden"),
        m("p", "Die IndexedDB-Verbindung funktioniert gerade nicht"),
      ]);

    if (this.#db.blocked)
      return m.fragment([
        m("h1", "Watterblock muss warten"),
        m("p",
          "Bitte schließe alle anderen Tabs, in denen der Watterblock " +
          "geöffnet ist"
        ),
        m("p", "Die Spieledatenbank muss aktualisiert werden."),
      ]);

    if (!this.#db.open)
      return m("p", "Öffne Datenbank, bitte warten…");

    return m.fragment([
      m("header.layout.alter.background", [
        backHref ? m(m.route.Link, { href: backHref }, "←") : null,
        m("h1", "Watterblock"),
      ]),
      m("main.layout", children),
    ]);
  }
}
