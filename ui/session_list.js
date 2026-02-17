"use strict";

import Session from "../models/session.js";

export default class SessionList {
  /** @param {{ attrs: { models: Session[] } }} param The sessions to show. */
  view({attrs: { models, onSelect, onNew } }) {
    return m("section", [
      m("button", { onclick: () => onNew() }, "Neie Session"),
      m("ol", [
        models.map((s) => m("li", [
          m("button", { onclick: () => onSelect(s.id) }, [
            m("p", s.ourTeam !== "" ? s.ourTeam : "Unbnannts Team"),
            m("p", s.theirTeam !== "" ? s.theirTeam : "Unbnannts Team"),
            m("p", "•".repeat(s.result.ourPoints)),
            m("p", "•".repeat(s.result.theirPoints)),
          ])
        ]))
      ])
    ]);
  }
}
