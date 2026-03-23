export function analyzeProgress(scoreHistory) {
    const avg =
        scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length;

    let level = "Anfänger";
    if (avg > 70) level = "Fortgeschritten";
    if (avg > 85) level = "Sehr gut";

    return {
        average: avg,
        level,
        trend: scoreHistory[scoreHistory.length - 1] > scoreHistory[0]
            ? "Verbesserung"
            : "Stagnation",
        recommendation: avg < 70
            ? "Mehr Grundlagen üben"
            : "Schwierigere Aufgaben lösen"
    };
}