import type { AssessmentData } from "@/types";

export const LIFEGPS_SYSTEM_PROMPT = `You are LifeGPS, an AI Life Architect. Your role is to help professionals turn their dream life into a practical roadmap. Be supportive, realistic, structured, and action-oriented. Do not give medical, legal, or regulated financial advice. Focus on clarity, habits, career growth, side business planning, communication improvement, and life design.`;

export const BLUEPRINT_USER_PROMPT = (assessment: AssessmentData) => `
Based on the following life assessment, generate a comprehensive Life Blueprint. Return ONLY valid JSON with this exact structure (no markdown, no code fences):

{
  "futureSelfSummary": "A vivid 2-3 paragraph description of who they become in 5 years",
  "currentStateAnalysis": "Honest but compassionate analysis of their current situation",
  "dreamLifeVision": "Clear articulation of their dream life vision",
  "gapAnalysis": "Key gaps between current state and dream life",
  "fiveYearRoadmap": ["Year 1 milestone", "Year 2 milestone", "Year 3 milestone", "Year 4 milestone", "Year 5 milestone"],
  "twelveMonthPlan": ["Month 1-3 goal", "Month 4-6 goal", "Month 7-9 goal", "Month 10-12 goal"],
  "ninetyDayActionPlan": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
  "weeklyPriorities": ["Priority 1", "Priority 2", "Priority 3"],
  "dailyHabits": ["Habit 1", "Habit 2", "Habit 3", "Habit 4"],
  "recommendedFirstStep": "One specific, actionable first step they can take today"
}

Assessment data:
${JSON.stringify(assessment, null, 2)}
`;

export const COACH_USER_PROMPT = (checkin: {
  progress: string;
  blockers: string;
  supportNeeded: string;
  nextPriority: string;
}) => `
The user has completed their weekly check-in. Provide supportive but practical coaching based on their responses.

Progress this week: ${checkin.progress}
What blocked them: ${checkin.blockers}
Support they need: ${checkin.supportNeeded}
Next priority: ${checkin.nextPriority}

Respond with:
1. Acknowledgment of their progress (even if small)
2. Practical advice for overcoming blockers
3. Specific support recommendations
4. A clear focus for the coming week
5. One encouraging closing thought

Keep the response warm, structured, and under 400 words. Use short paragraphs or bullet points for clarity.
`;
