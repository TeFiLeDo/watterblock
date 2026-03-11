"use strict";

const URL_STORAGE_QUOTA = "https://developer.mozilla.org/de/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria";

export default class Persist {
  #safari = navigator.vendor === "Apple Computer, Inc.";
  /** @type {?boolean} */
  #persisted = null;

  async oninit() {
    this.#persisted = await navigator.storage.persisted();
  }

  view() {
    if (this.#persisted !== false)
      return null;

    return m("li.item.-text._alternate._apply", [
      this.#safari
        ? m.fragment([
          m("p", m("strong", "Obacht, Safari-Nutza!")),
          m("p", [
            "Da Safari löscht manchmal von sich aus deine Spiel-Datn, wennst",
            "füa sein Gschmack z'lang nimma de Seitn aufgmacht hast. ",
            m("a", { href: URL_STORAGE_QUOTA }, "Mea Infos…"),
          ]),
          m("p", [
            "Is natürlich eha bled, aba als Webseitn-Entwickla kann ma da ",
            "leida praktisch gar nix machn. Es gibt zwar a Option um des ",
            "Löschn aus z'schaltn, aba bei dea kann da Safari oanfach „na“ ",
            "sagn, wenn ea will.",
          ]),
          m("p", [
            "Dea Knopf direkt unta dem Text machat genau des. Kannst probian ",
            "wennst willst. Falls es geht verschwindet de Meldung. Falls nit ",
            "gregst an Fehla anzoagt. Dann bleibt da leida nur mehr n Browser ",
            "z'wechsln oda mit eventuellem Datnverlust z'lebn.",
          ]),
        ])
        : m("p", [
          "Ganz seltn, wenn dei Festplattn fast voi is, dann kann's sein, ",
          "dass dei Browser die Spiel-Datn löscht. Wennst des vahindand ",
          "willst, druck den Knopf direkt unta dem Text. ",
          m("a", { href: URL_STORAGE_QUOTA }, "Mea Infos…"),
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
          window.alert(
            this.#safari
              ? "Safari hat leida na gsagt."
              : "Dei Browser hat leida na gsagt."
          );
      });
    } catch (error) {
      console.error("failed to attempt to persist: ", error);
    }
  }
}
