import assert from "node:assert/strict";
import test from "node:test";

import { learningLanguage, localizedLearningLevel } from "./learning-copy.ts";

test("profile and dashboard level names follow the selected language", () => {
  assert.equal(localizedLearningLevel("هيثم", learningLanguage("en")), "Hatchling");
  assert.equal(localizedLearningLevel("عُقاب ذهبي", learningLanguage("fr")), "Aigle d’or");
  assert.equal(localizedLearningLevel("مُحلّق", learningLanguage("es")), "Águila en vuelo");
  assert.equal(localizedLearningLevel("هيثم", learningLanguage("ar-EG")), "هيثم");
});
