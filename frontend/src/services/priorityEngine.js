export const calculatePriority = (query) => {
  let score = 0;

  const categoryWeights = {
    'Payment': 5,
    'Eligibility': 4,
    'Technical Issue': 3,
    'Course Details': 3,
    'General': 2,
    'Other': 2,
  };

  const cat = query.merittoCategory || '';
  const matchedKey = Object.keys(categoryWeights).find(
    k => cat.toLowerCase().includes(k.toLowerCase())
  );
  score += matchedKey ? categoryWeights[matchedKey] : 2;

  const created = new Date(query.createdDate);
  const now = new Date();
  const daysPending = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  if (daysPending > 2) score += 4;
  else if (daysPending > 1) score += 2;

  if (query.escalationFlag) score += 5;

  const priorityLevel = score >= 8 ? 'HIGH' : score >= 5 ? 'MEDIUM' : 'LOW';

  return { priorityScore: score, priorityLevel, daysPending };
};

export const getDaysPending = (createdDate) => {
  const created = new Date(createdDate);
  const now = new Date();
  return Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
};
