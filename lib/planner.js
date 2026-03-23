export function generateLearningPlan(subject, level, goal) {
    const basePlans = {
        Mathe: ["Algebra", "Geometrie", "Stochastik"],
        Englisch: ["Vokabeln", "Grammatik", "Lesen"],
        Deutsch: ["Rechtschreibung", "Texte schreiben", "Analyse"]
    };

    const topics = basePlans[subject] || ["Grundlagen", "Übungen", "Tests"];

    return topics.map((topic, index) => ({
        day: index + 1,
        topic,
        task: `${topic} auf ${level} Niveau üben`,
        duration: "20-30 Minuten"
    }));
}