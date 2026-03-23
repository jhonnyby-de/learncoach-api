export function generateLearningPlan(topics, levels, days) {
  const plan = {};

  // Beispielhafte Logik: Verteilung der Themen über die Tage
  const topicsPerDay = Math.ceil(topics.length / days);

  for (let i = 0; i < days; i++) {
    plan[`Day ${i + 1}`] = topics.slice(i * topicsPerDay, (i + 1) * topicsPerDay);
  }

  return plan;
}

export { generateLearningPlan };
  function generateLearningPlan(topics, levels, days) {
    // Logik zur Erstellung des Lernplans
    const plan = {};

    // Beispielhafte Logik: Verteilung der Themen über die Tage
    const topicsPerDay = Math.ceil(topics.length / days);

    return topics.map((topic, index) => ({
        day: index + 1,
        topic,
        task: `${topic} auf ${level} Niveau üben`,
        duration: "20-30 Minuten"
    }));
}