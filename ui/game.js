"use strict";

import { Team } from "../models/round.js";
import Game from "../models/game.js";
import RoundView from "./round.js";

export default class GameView {
  /** @param {{ attrs: { model: Game } }} param The game model to use. */
  view({ attrs: { model } }) {
    let { winner, points, ourPoints, theirPoints } = model.result;

    let markers = "•".repeat(points);

    return m("section", [
      m("table", [
        m("thead", [
          m("tr", [
            m("th", "se"), m("th", "mia"),
          ]),
          winner !== null
            ? m("tr", [
                m("td", winner === Team.We ? markers : ""),
                m("td", winner === Team.They ? markers : ""),
              ])
            : null,
        ]),
        m("tbody", model.rounds.map(function(round) {
          return m("tr", [
            m("td", round.winner === Team.They ? round.points : ""),
            m("td", round.winner === Team.We ? round.points : ""),
          ]);
        })),
        m("tfoot", [
          m("tr", [
            m("th", theirPoints), m("th", ourPoints),
          ]),
        ]),
      ]),
      (model.currentRound !== null)
        ? m(RoundView, { model: model.currentRound })
        : null,
    ]);
  }
}
