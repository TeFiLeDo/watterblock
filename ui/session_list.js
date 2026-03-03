"use strict";

import Session from "/models/session.js";

export default class SessionList {
  /** @param {{ attrs: { models: Session[] } }} param The sessions to show. */
  view({attrs: { models, onSelect } }) {
    return m("section", [
      m(m.route.Link, {
        href: "/",
        selector: "button",
        options: {
          state: { newSession: true },
        },
      }, "Neie Session"),
      m("ol", [
        models.map((s) => m("li", [
          m(
            m.route.Link,
            {
              href: "/",
              selector: "button",
              params: { session: s.id },
              onclick: () => onSelect(s),
            },
            [
              m("p", "•".repeat(s.result.theirPoints)),
              m("p", s.theirTeam !== "" ? s.theirTeam : "Se"),
              m("p", s.ourTeam !== "" ? s.ourTeam : "Mia"),
              m("p", "•".repeat(s.result.ourPoints)),
            ],
          ),
        ]))
      ])
    ]);
  }
}
