"use strict";

import Session from "../models/session.js";
import GameView from "./game.js";

export default class SessionView {
  /** @param {{ attrs: { model: Session } }} param The session model to use. */
  view({ attrs: { model, onDeselect } }) {
    return m("article", [
      m("button", { onclick: () => onDeselect() }, "Zruck"),
      model.games.map((g) => m(GameView, { model: g })),
      model.currentGame !== null
        ? m(GameView, { model: model.currentGame })
        : m("button", { onclick: () => model.anotherGame() }, "no a spiel"),
    ]);
  }
}
