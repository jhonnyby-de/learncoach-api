import { analyzeProgress } from "../lib/analyzer.js";

export default function handler(req, res) {
  const { scores } = req.body;

  if (!scores || !Array.isArray(scores)) {
    return res.status(400).json({ error: "Scores must be array" });
  }

  const result = analyzeProgress(scores);

  res.status(200).json(result);
}