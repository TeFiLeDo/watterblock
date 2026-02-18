"use strict";

import Session from "../models/session.js";
import GameView from "./game.js";
import RoundView from "./round.js";

export default class SessionView {
  /** @param {{ attrs: { model: Session } }} param The session model to use. */
  view({ attrs: { model, onDeselect } }) {

    let res = model.result;

    return m("article.session-view", [
      m("button", { onclick: () => onDeselect() }, "Zruck"),
      m("table", [
        m("thead", [
          m("tr", [
            m("th", "se"), m("th", "mia"),
          ]),
          m("tr", [
            m("th", "•".repeat(res.theirPoints)),
            m("th", "•".repeat(res.ourPoints)),
          ]),
        ]),
        model.games.map((g) => m(GameView, { model: g })),
        model.currentGame !== null
          ? m(GameView, { model: model.currentGame })
          : null,
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
