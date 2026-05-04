// Varied motivational messages shown when a chore is completed

const COMPLETION_MESSAGES = [
  // General encouragement
  { title: "You're on fire! 🔥", description: "Keep this energy going — you're unstoppable." },
  { title: "Nailed it! 💪", description: "That chore didn't stand a chance." },
  { title: "Look at you go! ⚡", description: "The household hero strikes again." },
  { title: "That's how it's done! 🎯", description: "Precision and dedication." },
  { title: "Boom! Done! 💥", description: "Another one bites the dust." },
  { title: "Superstar move! 🌟", description: "Your family would be proud." },
  { title: "Crushing it! 🏆", description: "You make chores look easy." },
  { title: "Nice work, champ! 🥇", description: "Every task counts." },
  { title: "Way to go! 🚀", description: "One step closer to legend status." },
  { title: "You're a machine! 🤖", description: "Nothing can slow you down." },
  
  // Playful / fun
  { title: "Achievement unlocked! 🎮", description: "XP gained. Respect earned." },
  { title: "Mic drop! 🎤", description: "That was smooth." },
  { title: "Easy peasy! 🍋", description: "Like squeezing a lemon." },
  { title: "Legendary! 🐉", description: "Dragons would be jealous of that effort." },
  { title: "Chef's kiss! 👨‍🍳", description: "Perfectly executed." },

  // Wholesome
  { title: "Your family thanks you! 🏡", description: "Small acts, big impact." },
  { title: "Teamwork makes the dream work! 🤝", description: "You're part of something great." },
  { title: "Helping the household shine! ✨", description: "Every little bit makes a difference." },
  { title: "Building good habits! 🌱", description: "Today's effort is tomorrow's strength." },
  { title: "You're making a difference! 💛", description: "The house is better because of you." },
];

const SUBMISSION_MESSAGES = [
  { title: "Submitted for review! 📋", description: "A parent will check this soon." },
  { title: "Waiting for the green light! 🚦", description: "Your submission is in the queue." },
  { title: "Sent to headquarters! 📡", description: "The parents have been notified." },
  { title: "Under review! 🔍", description: "Sit tight — approval incoming." },
  { title: "In the pipeline! 🏗️", description: "Your hard work has been logged." },
];

export function getRandomCompletionMessage(awardedPoints: number): { title: string; description: string } {
  const msg = COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
  return {
    title: `+${awardedPoints} stars — ${msg.title}`,
    description: msg.description,
  };
}

export function getRandomSubmissionMessage(choreTitle: string): { title: string; description: string } {
  const msg = SUBMISSION_MESSAGES[Math.floor(Math.random() * SUBMISSION_MESSAGES.length)];
  return {
    title: msg.title,
    description: `${choreTitle} — ${msg.description}`,
  };
}
