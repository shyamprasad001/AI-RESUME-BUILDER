const WEIGHTS = {
  keywordMatch: 0.2,
  bulletQuality: 0.15,
  formatting: 0.1,
  sectionCompleteness: 0.1,
  summaryStrength: 0.1,
  skillCoverage: 0.1,
  quantification: 0.1,
  actionVerbs: 0.05,
  length: 0.05,
  contactInfo: 0.05,
};

const calculateOverallScore = (metrics) => {
  let overall = 0;
  for (const [metric, weight] of Object.entries(WEIGHTS)) {
    let score = metrics[metric] || 0;
    if (typeof score === "object") score = score.score || 0;
    overall += score * weight;
  }
  return Math.round(overall);
};

const getScoreCategory = (score) => {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "needs-work";
  return "weak";
};

export { calculateOverallScore, getScoreCategory };
