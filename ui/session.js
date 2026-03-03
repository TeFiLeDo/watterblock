"use strict";

import Session from "/models/session.js";
import GameView from "/ui/game.js";
import RoundView from "/ui/round.js";
import SessionHead from "/ui/session_head.js";

export default class SessionView {
  #headOpen = false;

  /** @param {{ attrs: { model: Session } }} param The session model to use. */
  view({ attrs: { model } }) {

    let res = model.result;

    return m("article.session-view", [
      m(".session-view-header", [
        m("h2", "Satz"),
        m(
          "button",
          { onclick: () => this.#headOpen = !this.#headOpen },
          "Regln"
        ),
      ]),
      ( model.games.length === 0 && model.currentGame === null)
        ? m(SessionHead, { model })
        : m.fragment([
            this.#headOpen ? m(SessionHead, { model }) : null,
            m("section.record", [
              this.#headOpen ? m("h3", "Mitschrift") : null,
              m("table", [
                m("thead", [
                  m("tr", [
                    m("th", [
                      model.theirTeam ? model.theirTeam : "Se",
                      " ",
                      "•".repeat(res.theirPoints),
                    ]),
                    m("th", [
                      model.ourTeam ? model.ourTeam : "Mia",
                      " ",
                       "•".repeat(res.ourPoints),
                     ]),
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
