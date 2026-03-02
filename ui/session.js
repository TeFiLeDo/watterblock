"use strict";

import Session from "/models/session.js";
import GameView from "/ui/game.js";
import RoundView from "/ui/round.js";
import SessionHead from "/ui/session_head.js";

export default class SessionView {
  /** @param {{ attrs: { model: Session } }} param The session model to use. */
  view({ attrs: { model } }) {

    let res = model.result;

    return m("article.session-view", [
      m(m.route.Link, { href: "/", selector: "button" }, "Zruck"),
      ( model.games.length === 0 && model.currentGame === null)
        ? m(SessionHead, { model })
        : m.fragment([
            m("details", [
              m("summary", "Einstellungen"),
              m(SessionHead, { model }),
            ]),
            m("section.record", [
              m("h3", "Mitschrift"),
              m("table", [
                m("thead", [
                  m("tr", [
                    m("th", ["se", " ", "•".repeat(res.theirPoints)]),
                    m("th", ["mia", " ", "•".repeat(res.ourPoints)]),
                  ]),
                ]),
                model.games.map((g) => m(GameView, { model: g })),
                model.currentGame !== null
                  ? m(GameView, { model: model.currentGame })
                  : null,
              ])
            ]),
      ]),
      m(".spacer"),
      model.currentGame !== null
        ? model.currentGame.currentRound !== null
          ? m(RoundView, { model: model.currentGame.currentRound })
          : null
        : m(".continue", [
            m("button",
              {
                onclick: () => {
                  model.anotherGame();
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                },
              },
              "no a spiel"),
          ]),
    ]);
  }
}
