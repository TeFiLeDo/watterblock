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

    return m("section.current-round", [
      m("span.current-points", `${model.points}`),
      m("button.they-raise",
        {
          onclick: () => model.raise(Team.They),
          disabled: !model.canRaise(Team.They),
        },
        "se erhöhn",
      ),
      m("button.we-raise",
        {
          onclick: () => model.raise(Team.We),
          disabled: !model.canRaise(Team.We),
        },
        "mia erhöhn",
      ),
      m("button.they-win",
        {
          onclick: () => {
            model.winner = Team.They;
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          },
          disabled: model.decided,
        },
        "se habn gwonnen",
      ),
      m("button.we-win",
        {
          onclick: () => {
            model.winner = Team.We;
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          },
          disabled: model.decided,
        },
        "mia habn gwonnen",
      ),
    ]);
  }
}
