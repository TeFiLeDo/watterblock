"use strict";

import Session from "../models/session.js";
import SessionView from "./session.js";

export default class App {
  #session = new Session();

  view() {
    return m(SessionView, { model: this.#session });
  }
}
