import round from "./models/round.test.js";
import roundResult from "./models/round_result.test.js";
import game from "./models/game.test.js";
import session from "./models/session.test.js";

QUnit.module("models", function() {
  round();
  roundResult();
  game();
  session();
});
