"use strict";

export default class SafariPersist {
  #safari = navigator.vendor === "Apple Computer, Inc.";
  /** @type {?boolean} */
  #persisted = null;

  oninit() {
    if (this.#safari) {
      try {
        navigator.storage.persisted()
          .then(p => {
            this.#persisted = p;
            m.redraw();
          });
      } catch (error) {
        console.error("failed to determine persistence state: ", error);
      }
    }
  }

  view() {
    if (!this.#safari || this.#persisted !== false)
      return null;

    return m("li.item.-text._alternate._apply", [
      m("p", m("strong", "Obacht, Safari-Nutza!")),
      m("p", [
        "S'isch leida so, dass da Safari manchmoi oanfach von sich aus ",
        "entscheidet Datn z'löschn, de in iam gspeichat sen. Des berifft ",
        "a die Datn vom Watterblock.",
      ]),
      m("p", [
        "Is natürlich eha bled, aba als Webseitn-Entwickla kann ma da leida ",
        "praktisch gar nix machn. Es gibt zwar a Option um des Löschn aus ",
        "z'schaltn, aba bei dea kann Safari oanfach „na“ sagn, wenn es will.",
      ]),
      m("p", [
        "Dea Knopf direkt unta dem Text machat genau des. Kannst probian ",
        "wennst willst. Falls es geht verschwindet de Meldung. Falls nit ",
        "gregst an Fehla anzoagt. Dann bleibt da leida nur mehr Browser ",
        "wechsln oda mit eventuellem Datnverlust z'lebn.",
      ]),
      m("p", m(
        "button.wb-button._positioned",
        { onclick: () => this.#onpersist() },
        "Datn persistieren",
      )),
    ]);
  }

  #onpersist() {
    try {
      navigator.storage.persist().then(p => {
        this.#persisted = p;
        m.redraw();

        if (!p)
          window.alert("Safari hat leida na gsagt.");
      });
    } catch (error) {
      console.error("failed to attempt to persist: ", error);
    }
  }
}
