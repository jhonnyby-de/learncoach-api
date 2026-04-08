// ============================================
// AI COACH API
// GET /api/coach/daily-tip - Get personalized daily tip
// POST /api/coach/summarize - Summarize study session
// ============================================

import mockDB from '../../data/mock-db.js';
import knowledgeDB from '../../data/knowledge-database.js';

const dailyTips = {
  motivation: [
    "Jeder kleine Schritt bringt dich näher an dein Ziel. Du machst das großartig!",
    "Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden.",
    "Glaube an dich selbst - du hast bereits so viel geschafft!",
    "Lernen ist wie Sporttraining für dein Gehirn. Je mehr du übst, desto stärker wirst du.",
    "Heute eine Stunde lernen, morgen eine Note besser. Das lohnt sich!",
    "Deine Zukunft beginnt mit den Entscheidungen, die du heute triffst.",
    "Rückschläge sind nur Chancen, noch besser zurückzukommen."
  ],
  technique: [
    "Probiere heute die Pomodoro-Technik: 25 Minuten Fokus, dann 5 Minuten Pause.",
    "Nutze aktives Wiederholen: Erkläre das Thema, als würdest du es einem Freund beibringen.",
    "Visuelle Lernmethoden helfen: Zeichne Mindmaps oder Diagramme zu deinem Thema.",
    "Mache kurze Pausen alle 45-60 Minuten - dein Gehirn braucht Erholung!",
    "Lerne in verschiedenen Umgebungen - das verbessert die Erinnerung.",
    "Schlaf ist wichtig für das Lernen: 7-8 Stunden optimieren dein Gedächtnis.",
    "Nutze Spaced Repetition: Wiederhole Inhalte in steigenden Abständen."
  ],
  exam: [
    "Prüfungsvorbereitung: Fokussiere dich auf die wichtigsten Themen zuerst.",
    "Alte Klausuren üben ist der beste Weg, um das Prüfungsformat zu verstehen.",
    "Erstelle eine Prüfungs-Cheat-Sheet mit den wichtigsten Formeln.",
    "Simuliere Prüfungsbedingungen beim Üben - Zeitdruck trainieren!",
    "Schlafe vor der Prüfung gut - das ist wichtiger als letztes Büffeln."
  ],
  subject: {
    'Mathematik': [
      "Mathe-Tipp: Verstehe das Warum hinter jeder Formel, nicht nur das Wie.",
      "Übe regelmäßig, auch kurze Sessions helfen bei Mathe mehr als seltenes Büffeln.",
      "Zeichne dir komplexe Probleme auf - Visualisierung hilft beim Verständnis."
    ],
    'Deutsch': [
      "Lies täglich 15 Minuten - das verbessert dein Sprachgefühl automatisch.",
      "Notiere unbekannte Wörter und deren Kontext beim Lesen.",
      "Schreibe kurze Zusammenfassungen von Texten - das festigt das Verständnis."
    ],
    'Englisch': [
      "Höre englische Podcasts oder Musik - passives Lernen wirkt Wunder.",
      "Sprich vor dem Spiegel auf Englisch - das trainiert die Aussprache.",
      "Nutze Flashcards für Vokabeln - täglich 10 neue Wörter."
    ],
    'Physik': [
      "Physik lebt von Experimenten: Visualisiere Prozesse mental.",
      "Einheiten immer überprüfen - sie zeigen, ob deine Rechnung stimmt.",
      "Skizzen helfen enorm: Zeichne Kraftvektoren und Diagramme."
    ],
    'Chemie': [
      "Lerne chemische Formeln durch Geschichten und Eselsbrücken.",
      "Verstehe das Periodensystem - es ist das Fundament der Chemie.",
      "Stoffklassen in Gruppen lernen - Gemeinsamkeiten erkennen."
    ],
    'Biologie': [
      "Zeichne Prozesse selbst - das Zellbild im Kopf entsteht durch eigenes Zeichnen.",
      "Vergleiche biologische Systeme mit Alltagssituationen.",
      "Nutze Videos für komplexe Prozesse wie Zellteilung."
    ],
    'Geschichte': [
      "Erstelle Zeitstrahlen - Überblick ist in der Geschichte entscheidend.",
      "Verknüpfe historische Ereignisse mit Ursachen und Folgen.",
      "Lerne durch Geschichten, nicht nur Daten: Wer war beteiligt?"
    ]
  }
};

const coachMessages = {
  summary: [
    "Großartige Session! Du hast {duration} Minuten effektiv genutzt.",
    "Solide Arbeit heute. {duration} Minuten konzentriertes Lernen bringen dich voran.",
    "Beeindruckend! Du bleibst dran und machst Fortschritte.",
    "Gute Disziplin! {duration} Minuten Investition in deine Zukunft."
  ],
  encouragement: [
    "Du bist auf dem richtigen Weg! Weiter so!",
    "Jede Minute zählt - und du hast heute viele gesammelt!",
    "Deine Konstanz wird sich auszahlen. Stolz auf dich!",
    "Du zeigst, dass Lernen eine Gewohnheit sein kann."
  ],
  next_steps: [
    "Morgen wiederholst du das heutige Thema kurz, bevor du weiter machst.",
    "Denk daran: Spaced Repetition verankert das Wissen langfristig.",
    "Ein kurzes Quiz zu {topic} würde das Gelernte festigen.",
    "Bevor du schlafen gehst, rekapituliere mental das Wichtigste von heute."
  ]
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (action === 'daily-tip') {
    return getDailyTip(req, res);
  }

  if (action === 'summarize') {
    return summarizeSession(req, res);
  }

  return res.status(400).json({ error: 'Invalid action' });
}

function getDailyTip(req, res) {
  const userId = req.query.userId || 'user_001';
  const type = req.query.type || 'mixed';
  
  const user = mockDB.getUser(userId);
  const progress = mockDB.getProgress(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate personalized tip
  const tips = [];

  // Add motivation tip
  if (user.streak > 5) {
    tips.push(`🔥 Deine ${user.streak}-Tage Streak ist beeindruckend! ${randomItem(dailyTips.motivation)}`);
  } else {
    tips.push(`💪 ${randomItem(dailyTips.motivation)}`);
  }

  // Add technique tip
  tips.push(`💡 ${randomItem(dailyTips.technique)}`);

  // Add subject-specific tips based on weak areas
  if (user.weakTopics && user.weakTopics.length > 0) {
    const weakTopic = knowledgeDB.getTopicById(user.weakTopics[0]);
    if (weakTopic && dailyTips.subject[weakTopic.subject]) {
      tips.push(`📚 ${randomItem(dailyTips.subject[weakTopic.subject])} (Fokus: ${weakTopic.subject})`);
    }
  }

  // Add exam tip if close to exam season (simulated)
  const today = new Date();
  if (today.getMonth() >= 4 || today.getMonth() <= 6) { // May-July
    tips.push(`📝 ${randomItem(dailyTips.exam)}`);
  }

  // Calculate study stats for context
  const weeklyMinutes = progress?.weeklyStats?.reduce((sum, day) => sum + day.minutes, 0) || 0;
  const dailyAverage = Math.round(weeklyMinutes / 7);

  return res.status(200).json({
    success: true,
    tip: {
      date: today.toISOString().split('T')[0],
      tips: tips,
      personalizedContext: {
        userName: user.name,
        currentStreak: user.streak,
        dailyAverageMinutes: dailyAverage,
        weakSubjects: user.weakTopics?.slice(0, 3).map(id => {
          const topic = knowledgeDB.getTopicById(id);
          return topic?.subject;
        }).filter(Boolean) || [],
        level: user.level,
        xpToNextLevel: 300 - (user.totalXP % 300)
      },
      actionItems: generateActionItems(user, progress)
    }
  });
}

function summarizeSession(req, res) {
  const {
    userId = 'user_001',
    topicId,
    duration,
    performance,
    difficulty
  } = req.body;

  if (!topicId || !duration) {
    return res.status(400).json({ error: 'topicId and duration required' });
  }

  const topic = knowledgeDB.getTopicById(topicId);
  const user = mockDB.getUser(userId);

  if (!topic || !user) {
    return res.status(404).json({ error: 'Topic or user not found' });
  }

  // Generate personalized summary
  const summary = {
    session: {
      topic: topic.name,
      subject: topic.subject,
      duration: duration,
      grade: topic.grade,
      complexity: topic.complexity
    },
    feedback: generateFeedback(duration, performance, difficulty, topic),
    encouragement: randomItem(coachMessages.encouragement),
    nextSteps: formatNextSteps(duration, topic),
    stats: {
      totalSessionsToday: Math.floor(Math.random() * 3) + 1,
      totalMinutesToday: duration + Math.floor(Math.random() * 60),
      streak: user.streak,
      xpEarned: Math.floor(duration * 0.8)
    }
  };

  return res.status(200).json({
    success: true,
    summary
  });
}

function generateFeedback(duration, performance, difficulty, topic) {
  let feedback = randomItem(coachMessages.summary).replace('{duration}', duration);

  if (performance === 'excellent') {
    feedback += " Deine Leistung war herausragend - du beherrschst das Thema bereits gut!";
  } else if (performance === 'good') {
    feedback += " Gute Fortschritte. Ein weiterer Durchgang und du hast es drauf!";
  } else if (performance === 'struggling') {
    feedback += " Das Thema ist anspruchsvoll. Nicht aufgeben - mit mehr Übung wird es klick machen!";
  }

  if (difficulty === 'high') {
    feedback += " Besonders beeindruckend, dass du dich an ein komplexes Thema herangewagt hast.";
  }

  if (duration >= 45) {
    feedback += " Längere Sessions zeigen deine Konzentrationsfähigkeit.";
  }

  return feedback;
}

function formatNextSteps(duration, topic) {
  const steps = [randomItem(coachMessages.next_steps).replace('{topic}', topic.name)];

  if (topic.complexity > 7) {
    steps.push("Da dies ein komplexes Thema ist: Wiederhole es morgen noch einmal, bevor du weiter machst.");
  }

  if (topic.examRelevance === 'Hoch') {
    steps.push(`Dieses Thema ist prüfungsrelevant in ${topic.subject}. Priorisiere es!`);
  }

  return steps;
}

function generateActionItems(user, progress) {
  const items = [];

  // Check if daily goal met - find today by date instead of hardcoded index
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStats = progress?.weeklyStats?.find(day => day.date === todayStr);
  const todayMinutes = todayStats?.minutes || 0;
  if (todayMinutes < user.dailyGoalMinutes) {
    items.push({
      type: 'goal',
      priority: 'high',
      message: `Noch ${user.dailyGoalMinutes - todayMinutes} Minuten bis zu deinem Tagesziel!`,
      action: 'Starte eine Session'
    });
  }

  // Check upcoming reviews
  if (user.weakTopics && user.weakTopics.length > 0) {
    items.push({
      type: 'review',
      priority: 'medium',
      message: `${user.weakTopics.length} Themen stehen zur Wiederholung an`,
      action: 'Review starten'
    });
  }

  // Suggest quiz if topics completed
  if (user.completedTopics?.length > 0 && user.completedTopics.length % 5 === 0) {
    items.push({
      type: 'quiz',
      priority: 'low',
      message: 'Du hast 5 Themen abgeschlossen - teste dein Wissen!',
      action: 'Quiz starten'
    });
  }

  return items;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
