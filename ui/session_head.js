"use strict";

import { RaisingRule } from "/models/game_rules.js";
import Session from "/models/session.js";

export default class SessionHead {
  /** @param {{ attrs: { model: Session } }} param The session model to use. */
  view({ attrs: { model } }) {
    return m("section.session_head", [
      m("h3", "Satzeinstellungen"),
      m("section.session-head-names", [
        m("h4", "Teamnamen"),
        m("label", [
          "Nam von eana",
          m("input", {
            placeholder: "Se",
            value: model.theirTeam,
            oninput: (e) => model.theirTeam = e.target.value,
          }),
        ]),
        m("label", [
          "Nam von ins",
          m("input", {
            placeholder: "Mia",
            value: model.ourTeam,
            oninput: (e) => model.ourTeam = e.target.value,
          }),
        ]),
      ]),
      m("section.session-head-base", [
        m("h4", "Grundregln"),
        m("label", [
          "Punkte zum gwinna",
          m("input", {
            placeholder: "mindestns 1",
            type: "number",
            value: model.rules.goal,
            oninput: (e) => {
              let num = parseInt(e.target.value);
              if (!isNaN(num) && num >= 1)
                model.rules.goal = num;
              else
                alert("Es Punkteziel muas a Nummer größer als null sein.");
            },
          }),
        ]),
      ]),
      m("section.session-head-raising", [
        m("h4", "Erhöhn"),
        m("label", [
          m("input", {
            type: "radio",
            checked: model.rules.raising === RaisingRule.UnlessStricken,
            oninput: () => model.rules.raising = RaisingRule.UnlessStricken,
          }),
          "Außa wenn gstrichn",
        ]),
        m("label", [
          m("input", {
            type: "radio",
            checked: model.rules.raising === RaisingRule.UntilEnough,
            oninput: () => model.rules.raising = RaisingRule.UntilEnough,
          }),
          "Bis es langt",
        ]),
      ]),
    ])
  }
}
