import { COMPASS_QUESTIONS } from "../src/lib/compass/questions.ts";
import { buildAnswer, computeCompassResults } from "../src/lib/compass/scoring.ts";

const answers = COMPASS_QUESTIONS.filter((q) => q.type !== "optionalText").map(
  (q) => {
    if (q.type === "scale1to10") return buildAnswer(q.id, ["5"], [5]);
    const opt = q.options[0];
    if (q.type === "multiChoice") {
      return buildAnswer(q.id, [opt.label], [opt.value]);
    }
    return buildAnswer(q.id, [opt.label], [opt.value]);
  }
);

const results = computeCompassResults(answers);
const assessment = {
  answers,
  results,
  completedAt: results.completedAt,
  version: "compass-v2",
};

const port = process.env.PORT || "3000";
const res = await fetch(`http://localhost:${port}/api/blueprint`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ assessment, userId: "test-user-123" }),
});

console.log("status", res.status);
const body = await res.json();
if (!res.ok) {
  console.error("error", body.error);
  process.exit(1);
}
console.log("archetype", body.blueprint?.archetype);
console.log("persisted", body.persisted);
