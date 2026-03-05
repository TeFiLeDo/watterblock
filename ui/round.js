"use strict";

import { Round, Team } from "/models/round.js";

export default class RoundView {

  /** @param { { attrs: { model: Round } } } param The round model to use. */
  view({ attrs: { model } }) {
    return m("section.wb-round", [
      m("h3.title._positioned", "Rundnschreiba"),
      m("span.current", `${model.points}`),
      m("button.wb-button.theyraise._positioned",
        {
          onclick: () => model.raise(Team.They),
          disabled: !model.canRaise(Team.They),
        },
        "se erhöhn",
      ),
      m("button.wb-button.weraise._positioned",
        {
          onclick: () => model.raise(Team.We),
          disabled: !model.canRaise(Team.We),
        },
        "mia erhöhn",
      ),
      m("button.wb-button.theywin._positioned",
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
      m("button.wb-button.wewin._positioned",
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
