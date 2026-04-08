export function generateLearningPlan(topics, levels, days) {
  if (!Array.isArray(topics) || days <= 0) {
    return {};
  }

  const topicsPerDay = Math.ceil(topics.length / days);
  const plan = {};

  for (let i = 0; i < days; i++) {
    const dayTopics = topics.slice(i * topicsPerDay, (i + 1) * topicsPerDay);
    plan[`Day ${i + 1}`] = dayTopics.map((topic, idx) => ({
      topic,
      level: levels?.[topic] || 'mittel',
      task: `${topic} auf ${levels?.[topic] || 'mittel'} Niveau üben`,
      duration: "20-30 Minuten"
    }));
  }

  return plan;
}