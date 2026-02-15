"use strict";

import { Round, Team } from "../models/round.js";

export default class RoundView {

  /** @param { { attrs: { model: Round } } } param The round model to use. */
  view({ attrs: { model } }) {
    let winner = "no koana";
    if (model.winner === Team.We)
      winner = "mia";
    else if (model.winner === Team.They)
      winner = "se";

    return m("section", [
      m("p", `${model.points} Punkte`),
      m("div", [
        m("button",
          {
            onclick: () => model.raise(Team.They),
            disabled: !model.canRaise(Team.They),
          },
          "se erhöhn",
        ),
        m("button",
          {
            onclick: () => model.raise(Team.We),
            disabled: !model.canRaise(Team.We),
          },
          "mia erhöhn",
        ),
      ]),
      m("div", [
        m("button",
          {
            onclick: () => model.winner = Team.They,
            disabled: model.decided,
          },
          "se habn gwonnen",
        ),
        m("button",
          {
            onclick: () => model.winner = Team.We,
            disabled: model.decided,
          },
          "mia habn gwonnen",
        ),
      ]),
    ]);
  }
}
