"use strict";

import { RaisingRule } from "/models/game_rules.js";
import Session from "/models/session.js";

export default class SessionHead {
  /** @param {{ attrs: { model: Session } }} param The session model to use. */
  view({ attrs: { model } }) {
    return m("section.session-head", [
      m("h3", "Satzeinstellungen"),
      m("section.session-head-names", [
        m("h4", "Teamnamen"),
        m("label.field", [
          m("span.label", "Nam von eana"),
          m("input", {
            placeholder: "Se",
            value: model.theirTeam,
            oninput: (e) => model.theirTeam = e.target.value,
          }),
        ]),
        m("label.field", [
          m("span.label", "Nam von ins"),
          m("input", {
            placeholder: "Mia",
            value: model.ourTeam,
            oninput: (e) => model.ourTeam = e.target.value,
          }),
        ]),
      ]),
      m("section.session-head-base", [
        m("h4", "Grundregln"),
        m("label.field", [
          m("span.label", "Punkte zum gwinna"),
          m("input", {
            placeholder: "mindestns 1",
            type: "number",
            value: model.rules.goal,
            onchange: (e) => {
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
        m("label.field", [
          m("input", {
            type: "radio",
            checked: model.rules.raising === RaisingRule.UnlessStricken,
            oninput: () => model.rules.raising = RaisingRule.UnlessStricken,
          }),
          m("span.label", "Außa wenn gstrichn"),
          m("span.description", [
            "Di Spiela kennen di Punkte erhöhn, so viel wia's wolln, außa " +
            "wenn's scho gstrichn sen.",
            m("br"),
            m("em", "So steht's in di Regln von da Tirola Wattagmeinschaft"),
          ]),
        ]),
        m("label.field", [
          m("input", {
            type: "radio",
            checked: model.rules.raising === RaisingRule.UntilEnough,
            oninput: () => model.rules.raising = RaisingRule.UntilEnough,
          }),
          m("span.label", "Bis es langt"),
          m("span.description", [
            "Di Spiela kennen so lang di Punkte erhöhn, bis se mit am Sieg " +
            "in da Rundn es ganze Spiel gwonnen hättn.",
          ])
        ]),
      ]),
    ])
  }
}
