"use strict";

import { Round, Team } from "/models/round.js";

export default class RoundView {

  /** @param { { attrs: { model: Round } } } param The round model to use. */
  view({ attrs: { model } }) {
    return m("section.current-round.alter.background", [
      m("h3.positioned", "Rundnschreiba"),
      m("span.current-points", `${model.points}`),
      m("button.they-raise.positioned",
        {
          onclick: () => model.raise(Team.They),
          disabled: !model.canRaise(Team.They),
        },
        "se erhöhn",
      ),
      m("button.we-raise.positioned",
        {
          onclick: () => model.raise(Team.We),
          disabled: !model.canRaise(Team.We),
        },
        "mia erhöhn",
      ),
      m("button.they-win.positioned",
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
      m("button.we-win.positioned",
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
