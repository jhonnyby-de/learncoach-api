import { generateLearningPlan } from "../lib/planner.js";
import { validateFields } from "../lib/validator.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const error = validateFields(["subject", "level", "goal"], req.body);
  if (error) return res.status(400).json({ error });

  const { subject, level, goal } = req.body;

  const plan = generateLearningPlan(subject, level, goal);

  res.status(200).json({
    success: true,
    goal,
    plan
  });
}