"use strict";

import Session from "/models/session.js";

export default class SessionList {
  /** @param {{ attrs: { models: Session[] } }} param The sessions to show. */
  view({attrs: { models, onSelect, onDelete } }) {
    return m("section.wb-session-list", [
      m("ol", [
        models.length === 0
          ? m("li.item.-text._alternate._apply", "Du hast no koane Sätz…")
          : null,
        models.map((s, i) => m("li.item._alternate._apply", { key: s.id }, [
          m("span.theirname", s.theirTeam !== "" ? s.theirTeam : "Se"),
          m("span.ourname", s.ourTeam !== "" ? s.ourTeam : "Mia"),
          m("span.theirpoints", "•".repeat(s.result.theirPoints)),
          m("span.ourpoints", "•".repeat(s.result.ourPoints)),
          m("div.actions",
            m(
              "button.wb-button.-slim.-icon._positioned",
              {
                onclick: () => {
                  if (window.confirm("Wiillst den Satz wirklich löschn?"))
                    onDelete(s.id, i);
                }
              },
              m("span.material-symbols-outlined", "delete"),
              "löschn"
            ),
            m(
              m.route.Link,
              {
                href: "/",
                selector: "button.wb-button.-slim.-icon._positioned",
                params: { session: s.id },
                onclick: () => onSelect(s),
              },
              m("span.material-symbols-outlined", "playing_cards"),
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
