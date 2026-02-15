"use strict";

import round from "./models/round.test.js";
import roundResult from "./models/round_result.test.js";
import game from "./models/game.test.js";
import session from "./models/session.test.js";

import db from "./data/db.test.js";

QUnit.module("models", function() {
  round();
  roundResult();
  game();
  session();
});

QUnit.module("data", function() {
  db();
});
