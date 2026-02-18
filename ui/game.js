"use strict";

import { Team } from "../models/round.js";
import Game from "../models/game.js";
import RoundView from "./round.js";

export default class GameView {
  /** @param {{ attrs: { model: Game } }} param The game model to use. */
  view({ attrs: { model } }) {
    let { winner, points, ourPoints, theirPoints } = model.result;

    let markers = "•".repeat(points);

    return m("[", [
      m("tbody", model.rounds.map(function(round) {
        return m("tr", [
          m("td", round.winner === Team.They ? round.points : ""),
          m("td", round.winner === Team.We ? round.points : ""),
        ]);
      })),
      (!model.decided)
        ? m("tfoot", [
            m("tr", [
              m("th", theirPoints), m("th", ourPoints),
           ]),
          ])
        : null,
    ]);
  }
}
