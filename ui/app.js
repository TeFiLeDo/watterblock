"use strict";

import WbDb from "../data/db.js";
import Shell from "./shell.js";

export default class App {
  #needsHandler = true;

  constructor() {
    WbDb.get().addEventListener(WbDb.EVENT_CHANGE, () => {
      if (this.#needsHandler) {
        WbDb.get().db.addEventListener("error", e => console.log(e));
        this.#needsHandler = false;
      }
      m.redraw();
    });
  }

  view() {
    let db = WbDb.get();

    if (db.failed)
      return m("[", [
        m("h1", "Watterblock kann nicht geöffnet werden"),
        m("p", "Die IndexedDB-Verbindung funktioniert gerade nicht"),
      ]);

    if (db.blocked)
      return m("[", [
        m("h1", "Watterblock muss warten"),
        m("p",
          "Bitte schließe alle anderen Tabs, in denen der Watterblock " +
          "geöffnet ist"
        ),
        m("p", "Die Spieledatenbank muss aktualisiert werden."),
      ]);

    if (!db.open)
      return m("p", "Öffne Datenbank, bitte warten…");

    return m(Shell);
  }
}
