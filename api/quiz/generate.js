// ============================================
// QUIZ GENERATOR API
// POST /api/quiz/generate - Generate quiz for topics
// POST /api/quiz/submit - Submit quiz answers
// ============================================

import knowledgeDB from '../../data/knowledge-database.js';
import mockDB from '../../data/mock-db.js';

const questionTemplates = {
  Mathematik: [
    { type: 'multiple_choice', template: 'Was ist das Ergebnis von {a} + {b}?', generator: () => ({ a: rand(1, 20), b: rand(1, 20), answer: null }) },
    { type: 'equation', template: 'Löse: {a}x + {b} = {c}', generator: () => ({ a: rand(2, 5), b: rand(1, 10), c: rand(10, 30), answer: null }) },
    { type: 'word_problem', template: 'Ein {object} kostet {price}€. Wie viel kosten {quantity} Stück?', generator: () => ({ object: randomItem(['Stift', 'Buch', 'Apfel']), price: rand(2, 15), quantity: rand(3, 12), answer: null }) }
  ],
  Deutsch: [
    { type: 'grammar', template: 'Welche Wortart ist "{word}"?', generator: () => ({ word: randomItem(['schnell', 'Haus', 'laufen', 'und', 'der']), options: ['Adjektiv', 'Nomen', 'Verb', 'Konjunktion', 'Artikel'], answer: null }) },
    { type: 'spelling', template: 'Wie schreibt man "{word}" richtig?', generator: () => ({ word: randomItem(['Apfel', 'Straße', 'Fahrrad', 'Schule']), options: generateSpellingOptions(), answer: 0 }) },
    { type: 'comprehension', template: 'Was ist die Hauptidee des Textes?', generator: () => ({ text: sampleText(), options: sampleOptions(), answer: 2 }) }
  ],
  Englisch: [
    { type: 'vocabulary', template: 'Was bedeutet "{word}" auf Deutsch?', generator: () => ({ word: randomItem(['apple', 'house', 'beautiful', 'to run']), options: ['Apfel', 'Haus', 'schön', 'rennen'], answer: 0 }) },
    { type: 'grammar', template: 'Wähle die richtige Form: "I {verb} to school every day."', generator: () => ({ verb: 'go', options: ['go', 'goes', 'going', 'went'], answer: 0 }) },
    { type: 'translation', template: 'Übersetze: "{german}"', generator: () => ({ german: 'Ich gehe zur Schule', answer: 'I go to school' }) }
  ],
  Physik: [
    { type: 'concept', template: 'Was beschreibt das {law}?', generator: () => ({ law: randomItem(['Newtonsche Gesetz', 'Erhaltungssatz', 'Ohmsche Gesetz']), options: generatePhysicsOptions(), answer: 1 }) },
    { type: 'calculation', template: 'Berechne die Kraft: m = {m}kg, a = {a}m/s²', generator: () => ({ m: rand(1, 50), a: rand(1, 10), answer: null }) }
  ],
  Chemie: [
    { type: 'formula', template: 'Was ist die chemische Formel von {substance}?', generator: () => ({ substance: randomItem(['Wasser', 'Kohlendioxid', 'Salz']), options: ['H2O', 'CO2', 'NaCl'], answer: 0 }) },
    { type: 'reaction', template: 'Welche Reaktionstyp ist: A + B → AB?', generator: () => ({ options: ['Synthese', 'Analyse', 'Redox', 'Neutralisation'], answer: 0 }) }
  ],
  Biologie: [
    { type: 'anatomy', template: 'Welches Organ produziert {substance}?', generator: () => ({ substance: randomItem(['Insulin', 'Hämatie', 'Urin']), options: generateOrganOptions(), answer: 1 }) },
    { type: 'ecology', template: 'Was ist ein {term} in einem Ökosystem?', generator: () => ({ term: randomItem(['Produzent', 'Konsument', 'Destruent']), options: generateEcologyOptions(), answer: 0 }) }
  ],
  Geschichte: [
    { type: 'date', template: 'Wann fand {event} statt?', generator: () => ({ event: randomItem(['der Erste Weltkrieg', 'die Französische Revolution']), options: ['1914-1918', '1789-1799', '1939-1945', '1492'], answer: 0 }) },
    { type: 'person', template: 'Wer war {person}?', generator: () => ({ person: randomItem(['Napoleon', 'Karl der Große']), options: generatePersonOptions(), answer: 0 }) }
  ],
  Erdkunde: [
    { type: 'geography', template: 'Wo liegt {place}?', generator: () => ({ place: randomItem(['der Amazonas', 'die Sahara']), options: generateGeographyOptions(), answer: 1 }) },
    { type: 'climate', template: 'Welches Klima herrscht in {region}?', generator: () => ({ region: randomItem(['Sahara', 'Amazonas']), options: generateClimateOptions(), answer: 0 }) }
  ],
  Politik: [
    { type: 'system', template: 'Was ist {concept}?', generator: () => ({ concept: randomItem(['Demokratie', 'Diktatur']), options: generatePoliticsOptions(), answer: 0 }) }
  ]
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (action === 'generate') {
    return generateQuiz(req, res);
  }

  if (action === 'submit') {
    return submitQuiz(req, res);
  }

  return res.status(400).json({ error: 'Invalid action. Use ?action=generate or ?action=submit' });
}

function generateQuiz(req, res) {
  const { topicIds, difficulty, questionCount = 5, questionTypes } = req.body;

  if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
    return res.status(400).json({ error: 'topicIds array required' });
  }

  const questions = [];
  const topics = topicIds.map(id => knowledgeDB.getTopicById(id)).filter(Boolean);

  for (let i = 0; i < Math.min(questionCount, 20); i++) {
    const topic = topics[i % topics.length];
    const templates = questionTemplates[topic.subject] || questionTemplates.Mathematik;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const data = template.generator();
    
    const question = {
      id: `q_${i + 1}`,
      type: template.type,
      topicId: topic.id,
      topicName: topic.name,
      subject: topic.subject,
      difficulty: difficulty || topic.complexity,
      question: formatQuestion(template.template, data),
      options: data.options || generateNumericOptions(data),
      correctAnswer: data.answer !== null ? data.answer : calculateAnswer(data, template.type),
      explanation: generateExplanation(topic, template.type, data),
      points: calculatePoints(topic.complexity, difficulty)
    };

    // Remove correct answer from response (for client-side quiz)
    const clientQuestion = { ...question };
    delete clientQuestion.correctAnswer;

    questions.push(clientQuestion);
  }

  const quiz = {
    id: `quiz_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    timeLimit: questions.length * 2, // 2 minutes per question
    topics: topics.map(t => ({ id: t.id, name: t.name, subject: t.subject })),
    questions
  };

  // Store quiz with answers for validation
  global.activeQuizzes = global.activeQuizzes || new Map();
  global.activeQuizzes.set(quiz.id, {
    ...quiz,
    questions: questions.map((q, idx) => ({ ...q, correctAnswer: questions[idx].correctAnswer }))
  });

  return res.status(200).json({
    success: true,
    quiz
  });
}

function submitQuiz(req, res) {
  const { quizId, answers, userId = 'user_001' } = req.body;

  if (!quizId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'quizId and answers array required' });
  }

  const quiz = global.activeQuizzes?.get(quizId);
  
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found or expired' });
  }

  let correct = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  const detailedResults = [];

  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i];
    const userAnswer = answers[i];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correct++;
      earnedPoints += question.points;
    }
    totalPoints += question.points;

    detailedResults.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      explanation: question.explanation
    });
  }

  const percentage = Math.round((correct / quiz.questions.length) * 100);
  const passed = percentage >= 60;

  const result = {
    quizId,
    submittedAt: new Date().toISOString(),
    totalQuestions: quiz.questions.length,
    correctAnswers: correct,
    percentage,
    passed,
    totalPoints,
    earnedPoints,
    grade: calculateGrade(percentage),
    detailedResults,
    feedback: generateFeedback(percentage, passed),
    recommendations: generateQuizRecommendations(detailedResults, quiz.topics)
  };

  // Save to mock database
  mockDB.saveQuizResult(userId, result);

  // Award XP
  const xpEarned = Math.floor(earnedPoints * (passed ? 1.5 : 1));
  const xpResult = mockDB.addXP(userId, xpEarned, 'Quiz completed');

  // Check achievements
  if (percentage === 100) {
    mockDB.unlockAchievement(userId, 'perfect_score');
  }

  return res.status(200).json({
    success: true,
    result: {
      ...result,
      xpEarned,
      newTotalXP: xpResult.newTotal,
      newLevel: xpResult.newLevel,
      leveledUp: xpResult.leveledUp
    }
  });
}

// Helper functions
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatQuestion(template, data) {
  let question = template;
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'options' && key !== 'answer') {
      question = question.replace(`{${key}}`, value);
    }
  }
  return question;
}

function calculateAnswer(data, type) {
  if (type === 'calculation' || type === 'equation') {
    if (data.a && data.b) {
      if (data.c) {
        // Linear equation: ax + b = c -> x = (c - b) / a
        return Math.round((data.c - data.b) / data.a * 10) / 10;
      }
      return data.a * data.b;
    }
  }
  if (data.price && data.quantity) {
    return data.price * data.quantity;
  }
  return 0;
}

function generateNumericOptions(data) {
  const correct = calculateAnswer(data, 'calculation');
  const options = [correct];
  while (options.length < 4) {
    const wrong = correct + (Math.random() - 0.5) * correct * 0.5;
    if (!options.includes(Math.round(wrong))) {
      options.push(Math.round(wrong));
    }
  }
  return options.sort(() => Math.random() - 0.5);
}

function generateExplanation(topic, type, data) {
  const explanations = {
    calculation: `Basierend auf den Formeln aus ${topic.name}. Rechne schrittweise.`,
    vocabulary: `Vokabel aus dem Bereich ${topic.category}.`,
    grammar: `Grammatikregel: Beachte die Konjugation/ Deklination.`,
    concept: `Konzept aus ${topic.name}: ${topic.description}`
  };
  return explanations[type] || `Thema: ${topic.name}`;
}

function calculatePoints(complexity, difficulty) {
  const base = complexity * 10;
  const multiplier = difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.7 : 1;
  return Math.round(base * multiplier);
}

function calculateGrade(percentage) {
  if (percentage >= 92) return '1+';
  if (percentage >= 85) return '1';
  if (percentage >= 78) return '1-';
  if (percentage >= 71) return '2+';
  if (percentage >= 64) return '2';
  if (percentage >= 57) return '2-';
  if (percentage >= 50) return '3+';
  if (percentage >= 43) return '3';
  if (percentage >= 36) return '3-';
  if (percentage >= 29) return '4+';
  if (percentage >= 22) return '4';
  if (percentage >= 15) return '4-';
  if (percentage >= 8) return '5+';
  return '6';
}

function generateFeedback(percentage, passed) {
  if (percentage >= 90) return 'Hervorragend! Du beherrschst das Thema perfekt.';
  if (percentage >= 75) return 'Sehr gut! Kleine Lücken sollten noch geschlossen werden.';
  if (passed) return 'Bestanden, aber es gibt noch Verbesserungspotenzial.';
  if (percentage >= 40) return 'Nicht bestanden. Lern die falsch beantworteten Fragen nach.';
  return 'Mehr Übung nötig. Arbeite die Grundlagen noch einmal durch.';
}

function generateQuizRecommendations(results, topics) {
  const weakAreas = results
    .filter(r => !r.isCorrect)
    .map(r => r.topicName);
  
  const uniqueWeak = [...new Set(weakAreas)];
  
  return {
    weakAreas: uniqueWeak.slice(0, 3),
    suggestedTopics: topics.filter(t => uniqueWeak.includes(t.name)).map(t => t.id),
    studyTip: uniqueWeak.length > 3 
      ? 'Fokussiere dich auf die Bereiche mit den meisten Fehlern.'
      : 'Gute Leistung! Vertiefe die wenigen Lücken.'
  };
}

// Placeholder functions for question generation
function generateSpellingOptions() { return ['Option A', 'Option B', 'Option C', 'Option D']; }
function sampleText() { return 'Beispieltext...'; }
function sampleOptions() { return ['A', 'B', 'C', 'D']; }
function generatePhysicsOptions() { return ['Kraft', 'Energie', 'Strom', 'Wärme']; }
function generateOrganOptions() { return ['Herz', 'Leber', 'Niere', 'Lunge']; }
function generateEcologyOptions() { return ['Pflanze', 'Tier', 'Pilz', 'Bakterie']; }
function generatePersonOptions() { return ['Herrscher', 'Wissenschaftler', 'Künstler', 'Revolutionär']; }
function generateGeographyOptions() { return ['Afrika', 'Südamerika', 'Asien', 'Europa']; }
function generateClimateOptions() { return ['Wüste', 'Regenwald', 'Tundra', 'Mediterran']; }
function generatePoliticsOptions() { return ['Herrschaft des Volkes', 'Alleinherrschaft', 'Königsherrschaft', 'Expertenherrschaft']; }
