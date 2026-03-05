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

    return m("article.wb-session-view", [
      ( model.games.length === 0 && model.currentGame === null)
        ? m(".spacer", m(SessionHead, { model }))
        : m.fragment([
            m("header.header", [
              m("h2._positioned", "Satz"),
              m(
                "button.wb-button._positioned",
                { onclick: () => this.#headOpen = !this.#headOpen },
                "Regln"
              ),
            ]),

            this.#headOpen
              ? m("._alternate._apply.wb-box", m(SessionHead, { model }))
              : null,

            m("section.spacer", [
              this.#headOpen ? m("h3._positioned-top", "Mitschrift") : null,
              m("table.results", [
                m("thead._sticky-top._apply", [
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

      m(".wb-box._alternate._apply._sticky-bottom", [
        model.currentGame !== null
          && model.currentGame.currentRound !== null
          ? m(RoundView, { model: model.currentGame.currentRound })
          : m(
              "button.wb-button._positioned",
              {
                onclick: () => {
                  model.anotherGame();
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                },
              },
              "no a spiel"
            ),
      ]),
    ]);
  }
}
