"use strict";

import Session from "/models/session.js";

export default class SessionList {
  /** @param {{ attrs: { models: Session[] } }} param The sessions to show. */
  view({attrs: { models, onSelect } }) {
    return m("section.wb-session-list", [
      m("ol", [
        models.map((s) => m("li.item._alternate._apply", [
          m("span.theirname", s.theirTeam !== "" ? s.theirTeam : "Se"),
          m("span.ourname", s.ourTeam !== "" ? s.ourTeam : "Mia"),
          m("span.theirpoints", "•".repeat(s.result.theirPoints)),
          m("span.ourpoints", "•".repeat(s.result.ourPoints)),
          m("div.actions",
            m(
              m.route.Link,
              {
                href: "/",
                selector: "button.wb-button.-slim._positioned",
                params: { session: s.id },
                onclick: () => onSelect(s),
              },
              "spieln",
            ),
          ),
        ])),
      ]),
      m("footer.wb-box._sticky-bottom._alternate._apply",
        m(m.route.Link, {
          href: "/",
          selector: "button.wb-button._positioned",
          options: {
            state: { newSession: true },
          },
        }, "Neia Satz"),
      ),
    ]);
  }
}
