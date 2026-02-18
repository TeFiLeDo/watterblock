"use strict";

import Session from "../models/session.js";
import GameView from "./game.js";
import RoundView from "./round.js";

export default class SessionView {
  /** @param {{ attrs: { model: Session } }} param The session model to use. */
  view({ attrs: { model, onDeselect } }) {

    let res = model.result;

    return m("article", {
      class: ["session-view"],
    }, [
      m("button", { onclick: () => onDeselect() }, "Zruck"),
      m("table", [
        m("thead", [
          m("tr", [
            m("th", "se"), m("th", "mia"),
          ]),
          m("tr", [
            m("td", "•".repeat(res.theirPoints)),
            m("td", "•".repeat(res.ourPoints)),
          ]),
        ]),
        model.games.map((g) => m(GameView, { model: g })),
        model.currentGame !== null
          ? m(GameView, { model: model.currentGame })
          : null,
      ]),
      model.currentGame !== null
        ? model.currentGame.currentRound !== null
          ? m(RoundView, { model: model.currentGame.currentRound })
          : null
        : m("button", { onclick: () => model.anotherGame() }, "no a spiel"),
    ]);
  }
}
