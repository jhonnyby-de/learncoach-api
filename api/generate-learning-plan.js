import { generateLearningPlan } from '../lib/planner.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topics, levels, days } = req.body;

  if (!Array.isArray(topics) || typeof days !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const plan = generateLearningPlan(topics, levels, days);

  res.status(200).json({
    success: true,
    plan
  });
}
