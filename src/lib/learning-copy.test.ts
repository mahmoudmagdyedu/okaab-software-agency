import assert from "node:assert/strict";
import test from "node:test";

import { learningLanguage, localizedLearningLevel } from "./learning-copy.ts";

test("profile and dashboard level names follow the selected language", () => {
  assert.equal(learningLanguage("ar-EG"), "ar");
  assert.equal(localizedLearningLevel("مبتدئ", learningLanguage("ar-EG")), "مبتدئ");
  assert.equal(localizedLearningLevel("مبتدئ", learningLanguage("en")), "Beginner");
  assert.equal(localizedLearningLevel("مبتدئ", learningLanguage("fr")), "Débutant");
  assert.equal(localizedLearningLevel("مبتدئ", learningLanguage("es")), "Principiante");
  assert.equal(localizedLearningLevel("عُقاب ذهبي", learningLanguage("fr")), "Aigle d’or");
  assert.equal(localizedLearningLevel("مُحلّق", learningLanguage("es")), "Águila en vuelo");
});
