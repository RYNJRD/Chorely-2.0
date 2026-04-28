import { notifyUser } from "./notification-service.js";

export async function generateWeeklyReport(familyId: number) {
  // Generate mock data for the weekly report
  const reportData = {
    totalChores: Math.floor(Math.random() * 20) + 10, // 10-30
    totalStars: Math.floor(Math.random() * 50) + 50, // 50-100
    mostActiveChild: "Alex",
    starChampion: "Sam",
    funStat: "Fastest chore: Cleaning Room (5 mins)",
    streakStat: "3 day family streak! 🔥",
    childrenStats: [
      { name: "Alex", choresCompleted: 12, starsEarned: 40 },
      { name: "Sam", choresCompleted: 15, starsEarned: 55 },
    ]
  };

  return reportData;
}

export async function triggerWeeklyReports() {
  // In a real app, we would query all families. For now, mock it.
  console.log("Triggering weekly reports for all families...");
  
  // Fake notification trigger
  await notifyUser({
    // Usually we would fetch the admin/parent emails for the family
    type: "WEEKLY_REPORT_READY",
    channels: ["inApp", "push"], // Email disabled in fake trigger to avoid spam
    payload: {
      childrenStats: [
        { name: "Alex", choresCompleted: 12, starsEarned: 40 },
        { name: "Sam", choresCompleted: 15, starsEarned: 55 },
      ]
    }
  });
}
