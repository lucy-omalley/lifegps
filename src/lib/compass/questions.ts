import type { CompassQuestion } from "@/types";

function opts(
  labels: string[],
  scores?: number[]
): CompassQuestion["options"] {
  return labels.map((label, i) => ({
    label,
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    score: scores?.[i] ?? Math.round(20 + (i / Math.max(labels.length - 1, 1)) * 80),
  }));
}

export const COMPASS_QUESTIONS: CompassQuestion[] = [
  // A. Purpose & Direction (1–6)
  {
    id: 1,
    dimension: "purpose",
    text: "Which statement best describes your current life direction?",
    type: "singleChoice",
    options: opts(
      [
        "I have a clear vision and plan",
        "I have a dream but no clear plan",
        "I know I want change, but I am unsure what",
        "I feel completely stuck",
        "I am mostly focused on surviving day to day",
      ],
      [100, 75, 50, 25, 10]
    ),
  },
  {
    id: 2,
    dimension: "purpose",
    text: "When you imagine your ideal life in 5–10 years, what matters most?",
    type: "singleChoice",
    options: opts([
      "Freedom and flexibility",
      "Financial independence",
      "Meaningful work",
      "Family and relationships",
      "Health and peace",
      "Recognition and achievement",
    ]),
  },
  {
    id: 3,
    dimension: "purpose",
    text: "How clear are you about your long-term goals?",
    type: "scale1to10",
  },
  {
    id: 4,
    dimension: "purpose",
    text: "What is your biggest life question right now?",
    type: "scenarioChoice",
    options: opts([
      "What career path should I choose?",
      "How can I escape burnout?",
      "How can I build extra income?",
      "How can I become more confident?",
      "How can I create more freedom?",
      "How can I balance family and ambition?",
    ]),
  },
  {
    id: 5,
    dimension: "purpose",
    text: "If you could redesign one area of your life first, what would it be?",
    type: "singleChoice",
    options: opts([
      "Career",
      "Money",
      "Health",
      "Relationships",
      "Confidence",
      "Time",
      "Purpose",
    ]),
  },
  {
    id: 6,
    dimension: "purpose",
    text: "What usually motivates you most?",
    type: "singleChoice",
    options: opts([
      "Security",
      "Freedom",
      "Growth",
      "Helping others",
      "Creativity",
      "Achievement",
      "Family",
    ]),
  },

  // B. Career & Work Energy (7–12)
  {
    id: 7,
    dimension: "careerEnergy",
    text: "How do you currently feel about your job?",
    type: "singleChoice",
    options: opts(
      [
        "Energised and fulfilled",
        "Stable but not excited",
        "Underused",
        "Overwhelmed",
        "Burned out",
        "Ready for change",
      ],
      [100, 70, 55, 35, 15, 45]
    ),
  },
  {
    id: 8,
    dimension: "careerEnergy",
    text: "How often do you feel drained after work?",
    type: "singleChoice",
    options: opts(
      ["Rarely", "Sometimes", "Often", "Almost every day"],
      [100, 70, 35, 10]
    ),
  },
  {
    id: 9,
    dimension: "careerEnergy",
    text: "What best describes your current career stage?",
    type: "singleChoice",
    options: opts(
      [
        "Growing and progressing",
        "Comfortable but plateaued",
        "Stuck and unsure",
        "Actively looking for change",
        "Considering entrepreneurship",
        "Returning after a break",
      ],
      [95, 65, 30, 40, 75, 55]
    ),
  },
  {
    id: 10,
    dimension: "careerEnergy",
    text: "What would make your work life better?",
    type: "singleChoice",
    options: opts([
      "More flexibility",
      "Better pay",
      "More meaningful work",
      "Better communication skills",
      "Better manager/team",
      "More confidence",
      "A side business exit path",
    ]),
  },
  {
    id: 11,
    dimension: "careerEnergy",
    text: "How confident are you in your career direction?",
    type: "scale1to10",
  },
  {
    id: 12,
    dimension: "careerEnergy",
    text: "If you changed career, what would attract you most?",
    type: "singleChoice",
    options: opts([
      "Higher income",
      "More freedom",
      "More creativity",
      "More purpose",
      "Less stress",
      "Better work-life balance",
    ]),
  },

  // C. Skills & Growth (13–18)
  {
    id: 13,
    dimension: "growth",
    text: "Which skill would most improve your future?",
    type: "singleChoice",
    options: opts([
      "Communication",
      "Leadership",
      "Technical skills",
      "Business skills",
      "Financial knowledge",
      "Emotional resilience",
      "Time management",
    ]),
  },
  {
    id: 14,
    dimension: "growth",
    text: "How do you usually learn best?",
    type: "singleChoice",
    options: opts([
      "Reading",
      "Videos",
      "Courses",
      "Coaching",
      "Practice projects",
      "Talking with others",
      "AI guidance",
    ]),
  },
  {
    id: 15,
    dimension: "growth",
    text: "How open are you to learning something difficult if it supports your dream?",
    type: "scale1to10",
  },
  {
    id: 16,
    dimension: "growth",
    text: "What usually stops your growth?",
    type: "singleChoice",
    options: opts(
      [
        "Lack of time",
        "Lack of confidence",
        "Lack of money",
        "Lack of support",
        "Too many options",
        "Fear of failure",
        "Procrastination",
      ],
      [50, 40, 45, 40, 35, 30, 25]
    ),
  },
  {
    id: 17,
    dimension: "growth",
    text: "Which statement sounds most like you?",
    type: "scenarioChoice",
    options: opts(
      [
        "I take action quickly",
        "I research a lot before acting",
        "I start but do not finish",
        "I wait until I feel ready",
        "I need accountability",
        "I am consistent once I have structure",
      ],
      [85, 70, 35, 45, 50, 90]
    ),
  },
  {
    id: 18,
    dimension: "growth",
    text: "What kind of mentor would help you most?",
    type: "singleChoice",
    options: opts([
      "Career mentor",
      "Business mentor",
      "Communication coach",
      "Financial mentor",
      "Wellness coach",
      "Accountability partner",
    ]),
  },

  // D. Communication & Confidence (19–24)
  {
    id: 19,
    dimension: "communicationConfidence",
    text: "How confident do you feel when speaking in professional settings?",
    type: "scale1to10",
  },
  {
    id: 20,
    dimension: "communicationConfidence",
    text: "What communication challenge affects you most?",
    type: "singleChoice",
    options: opts([
      "Speaking clearly",
      "Sounding confident",
      "Handling conflict",
      "Influencing senior people",
      "Small talk/networking",
      "Presenting ideas",
      "Saying no",
    ]),
  },
  {
    id: 21,
    dimension: "communicationConfidence",
    text: "In meetings, you usually:",
    type: "scenarioChoice",
    options: opts(
      [
        "Speak confidently",
        "Speak only when needed",
        "Overthink before speaking",
        "Avoid challenging others",
        "Struggle to express ideas clearly",
        "Prefer written communication",
      ],
      [95, 75, 50, 55, 35, 60]
    ),
  },
  {
    id: 22,
    dimension: "communicationConfidence",
    text: "When facing conflict, your natural response is:",
    type: "scenarioChoice",
    options: opts(
      [
        "Address it directly",
        "Stay calm and diplomatic",
        "Avoid it",
        "Become anxious",
        "Over-explain",
        "Give in too quickly",
      ],
      [90, 85, 40, 30, 45, 35]
    ),
  },
  {
    id: 23,
    dimension: "communicationConfidence",
    text: "What would better communication help you achieve?",
    type: "singleChoice",
    options: opts([
      "Promotion",
      "Better relationships",
      "More confidence",
      "Business success",
      "Leadership presence",
      "Less stress",
    ]),
  },
  {
    id: 24,
    dimension: "communicationConfidence",
    text: "How much does confidence currently limit your life?",
    type: "scale1to10",
  },

  // E. Side Business & Creativity (25–30)
  {
    id: 25,
    dimension: "businessCreativity",
    text: "Have you ever wanted to build a side business?",
    type: "singleChoice",
    options: opts(
      [
        "Yes, I already have one",
        "Yes, I have ideas",
        "Yes, but I do not know where to start",
        "Maybe in the future",
        "No, not currently",
      ],
      [100, 85, 70, 45, 20]
    ),
  },
  {
    id: 26,
    dimension: "businessCreativity",
    text: "What type of side business attracts you most?",
    type: "singleChoice",
    options: opts([
      "Digital product",
      "Coaching/consulting",
      "AI app/tool",
      "Content/community",
      "E-commerce",
      "Education/course",
      "I am not sure",
    ]),
  },
  {
    id: 27,
    dimension: "businessCreativity",
    text: "What is your biggest barrier to starting?",
    type: "singleChoice",
    options: opts([
      "Time",
      "Money",
      "Confidence",
      "Technical skills",
      "Marketing",
      "Fear of failure",
      "Too many ideas",
    ]),
  },
  {
    id: 28,
    dimension: "businessCreativity",
    text: "How willing are you to spend 3–5 hours per week on a side project?",
    type: "scale1to10",
  },
  {
    id: 29,
    dimension: "businessCreativity",
    text: "If your side business worked, what would it give you?",
    type: "singleChoice",
    options: opts([
      "Extra income",
      "Freedom from job dependence",
      "Creative expression",
      "Purpose",
      "Confidence",
      "Early retirement path",
    ]),
  },
  {
    id: 30,
    dimension: "businessCreativity",
    text: "Which working style suits you best?",
    type: "singleChoice",
    options: opts([
      "Build quietly alone",
      "Collaborate with a partner",
      "Join a community",
      "Follow a step-by-step plan",
      "Work with a mentor",
      "Experiment quickly",
    ]),
  },

  // F. Money & Freedom (31–36)
  {
    id: 31,
    dimension: "financialFreedom",
    text: "What does financial freedom mean to you?",
    type: "singleChoice",
    options: opts([
      "No debt",
      "Enough savings",
      "Passive income",
      "Ability to leave my job",
      "Flexible lifestyle",
      "Security for family",
      "Early retirement",
    ]),
  },
  {
    id: 32,
    dimension: "financialFreedom",
    text: "How confident are you managing money?",
    type: "scale1to10",
  },
  {
    id: 33,
    dimension: "financialFreedom",
    text: "What is your biggest money concern?",
    type: "singleChoice",
    options: opts([
      "Not saving enough",
      "Mortgage/rent pressure",
      "Family expenses",
      "Low income growth",
      "Lack of investment knowledge",
      "Fear of risk",
      "No passive income",
    ]),
  },
  {
    id: 34,
    dimension: "financialFreedom",
    text: "If you received an unexpected €20,000, what would you likely do first?",
    type: "scenarioChoice",
    options: opts(
      [
        "Save it",
        "Invest it",
        "Pay debt",
        "Start a business",
        "Spend on family/lifestyle",
        "Take a career break",
        "Learn a new skill",
      ],
      [75, 90, 80, 85, 50, 55, 70]
    ),
  },
  {
    id: 35,
    dimension: "financialFreedom",
    text: "How important is early retirement or semi-retirement to you?",
    type: "scale1to10",
  },
  {
    id: 36,
    dimension: "financialFreedom",
    text: "What would make you feel more financially secure?",
    type: "singleChoice",
    options: opts([
      "Higher salary",
      "Emergency fund",
      "Investment plan",
      "Side income",
      "Lower expenses",
      "Clear retirement plan",
    ]),
  },

  // G. Energy, Burnout & Lifestyle (37–42)
  {
    id: 37,
    dimension: "energyLifestyle",
    text: "How would you describe your current energy level?",
    type: "singleChoice",
    options: opts(
      [
        "High and stable",
        "Good but inconsistent",
        "Tired but coping",
        "Frequently drained",
        "Burned out",
      ],
      [100, 75, 50, 25, 10]
    ),
  },
  {
    id: 38,
    dimension: "energyLifestyle",
    text: "What drains your energy most?",
    type: "singleChoice",
    options: opts([
      "Workload",
      "People/meetings",
      "Family responsibilities",
      "Lack of sleep",
      "Worrying about money",
      "Lack of purpose",
      "Too many commitments",
    ]),
  },
  {
    id: 39,
    dimension: "energyLifestyle",
    text: "How satisfied are you with your work-life balance?",
    type: "scale1to10",
  },
  {
    id: 40,
    dimension: "energyLifestyle",
    text: "What habit would improve your life fastest?",
    type: "singleChoice",
    options: opts([
      "Better sleep",
      "Exercise",
      "Focus time",
      "Journaling/reflection",
      "Learning",
      "Family time",
      "Reduced screen time",
    ]),
  },
  {
    id: 41,
    dimension: "energyLifestyle",
    text: "When stressed, what do you usually do?",
    type: "scenarioChoice",
    options: opts(
      [
        "Push through",
        "Talk to someone",
        "Avoid the problem",
        "Overthink",
        "Rest/recover",
        "Make a plan",
        "Distract myself",
      ],
      [40, 80, 30, 35, 75, 85, 45]
    ),
  },
  {
    id: 42,
    dimension: "energyLifestyle",
    text: "What lifestyle change do you want most?",
    type: "singleChoice",
    options: opts([
      "More calm",
      "More energy",
      "More family time",
      "More travel",
      "More health",
      "More freedom",
      "More creativity",
    ]),
  },

  // H. Execution & Habits (43–50)
  {
    id: 43,
    dimension: "execution",
    text: "How consistent are you with personal goals?",
    type: "scale1to10",
  },
  {
    id: 44,
    dimension: "execution",
    text: "What usually breaks your consistency?",
    type: "singleChoice",
    options: opts([
      "Lack of time",
      "Low energy",
      "No accountability",
      "Too many goals",
      "Perfectionism",
      "Family/work demands",
      "Loss of motivation",
    ]),
  },
  {
    id: 45,
    dimension: "execution",
    text: "What kind of accountability works best for you?",
    type: "singleChoice",
    options: opts([
      "Daily reminders",
      "Weekly check-ins",
      "Progress dashboard",
      "Human coach",
      "Community support",
      "Rewards/gamification",
    ]),
  },
  {
    id: 46,
    dimension: "execution",
    text: "When you fail to follow a plan, you usually:",
    type: "scenarioChoice",
    options: opts(
      [
        "Restart quickly",
        "Feel guilty",
        "Give up for a while",
        "Adjust the plan",
        "Need encouragement",
        "Need clearer steps",
      ],
      [95, 50, 25, 85, 55, 70]
    ),
  },
  {
    id: 47,
    dimension: "execution",
    text: "What planning style suits you best?",
    type: "singleChoice",
    options: opts([
      "Detailed roadmap",
      "Simple weekly priorities",
      "Daily checklist",
      "Flexible themes",
      "Visual dashboard",
      "Coaching conversation",
    ]),
  },
  {
    id: 48,
    dimension: "execution",
    text: "How many new habits can you realistically focus on now?",
    type: "singleChoice",
    options: opts(
      ["One", "Two", "Three", "Four or more", "I am not sure"],
      [90, 80, 65, 40, 50]
    ),
  },
  {
    id: 49,
    dimension: "execution",
    text: "What would make LifeGPS genuinely useful for you?",
    type: "multiChoice",
    options: opts([
      "Clear life roadmap",
      "Career guidance",
      "Side business plan",
      "Habit tracking",
      "Accountability",
      "Communication coaching",
      "Financial freedom plan",
      "Burnout support",
    ]),
  },
  {
    id: 50,
    dimension: "execution",
    text: "What is the first outcome you want from your Life Blueprint?",
    type: "singleChoice",
    options: opts([
      "More clarity",
      "Less stress",
      "Career direction",
      "Side business idea",
      "Better confidence",
      "Better habits",
      "Early retirement plan",
    ]),
  },
];

export const TOTAL_QUESTIONS = COMPASS_QUESTIONS.length;

export function getQuestionById(id: number): CompassQuestion | undefined {
  return COMPASS_QUESTIONS.find((q) => q.id === id);
}
