export function recommendNextTopic(weakTopics = []) {
    if (weakTopics.length === 0) {
        return "Wiederhole allgemeine Grundlagen";
    }

    return `Fokussiere dich auf: ${weakTopics.join(", ")}`;
}