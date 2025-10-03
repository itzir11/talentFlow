import { db, type Job, type Candidate, type Assessment, type CandidateTimeline } from "./db"

const jobTitles = [
  "Senior Frontend Engineer",
  "Backend Developer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "Mobile Developer",
  "QA Engineer",
  "Technical Writer",
  "Engineering Manager",
  "Solutions Architect",
  "Security Engineer",
  "Machine Learning Engineer",
  "Site Reliability Engineer",
  "Product Designer",
  "Business Analyst",
  "Scrum Master",
  "Cloud Engineer",
  "Database Administrator",
  "Frontend Developer",
  "iOS Developer",
  "Android Developer",
  "UI Designer",
  "Growth Engineer",
]

const tags = [
  "Remote",
  "Full-time",
  "Part-time",
  "Contract",
  "Senior",
  "Junior",
  "Mid-level",
  "Engineering",
  "Design",
  "Product",
  "Data",
  "Management",
]

const firstNames = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "William",
  "Mia",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Harper",
  "Henry",
  "Evelyn",
  "Alexander",
  "Abigail",
  "Michael",
  "Emily",
  "Daniel",
  "Elizabeth",
  "Matthew",
  "Sofia",
  "Jackson",
  "Avery",
  "Sebastian",
  "Ella",
  "Jack",
  "Scarlett",
  "Aiden",
  "Grace",
  "Owen",
  "Chloe",
  "Samuel",
  "Victoria",
  "David",
  "Riley",
  "Joseph",
  "Aria",
  "Carter",
  "Lily",
]

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
]

const stages: Candidate["stage"][] = ["applied", "screen", "tech", "offer", "hired", "rejected"]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export async function seedDatabase() {
  const jobCount = await db.jobs.count()

  if (jobCount > 0) {
    console.log("[v0] Database already seeded")
    return
  }

  console.log("[v0] Seeding database...")

  // Seed Jobs
  const jobs: Job[] = jobTitles.map((title, index) => ({
    id: `job-${index + 1}`,
    title,
    slug: generateSlug(title),
    status: Math.random() > 0.3 ? "active" : "archived",
    tags: randomItems(tags, Math.floor(Math.random() * 3) + 2),
    order: index,
    description: `We are looking for a talented ${title} to join our team.`,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  await db.jobs.bulkAdd(jobs)

  // Seed Candidates
  const candidates: Candidate[] = []
  const timelines: CandidateTimeline[] = []

  for (let i = 0; i < 1000; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const stage = randomItem(stages)
    const jobId = randomItem(jobs).id
    const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()

    candidates.push({
      id: `candidate-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      stage,
      jobId,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      createdAt,
      updatedAt: new Date().toISOString(),
    })

    // Create initial timeline entry
    timelines.push({
      id: `timeline-${i + 1}-1`,
      candidateId: `candidate-${i + 1}`,
      fromStage: null,
      toStage: "applied",
      timestamp: createdAt,
    })

    // Add stage progression timeline entries
    if (stage !== "applied") {
      const stageIndex = stages.indexOf(stage)
      for (let j = 1; j <= stageIndex; j++) {
        timelines.push({
          id: `timeline-${i + 1}-${j + 1}`,
          candidateId: `candidate-${i + 1}`,
          fromStage: stages[j - 1],
          toStage: stages[j],
          timestamp: new Date(new Date(createdAt).getTime() + j * 3 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }
    }
  }

  await db.candidates.bulkAdd(candidates)
  await db.candidateTimeline.bulkAdd(timelines)

  // Seed Assessments
  const assessments: Assessment[] = [
    {
      id: "assessment-1",
      jobId: jobs[0].id,
      title: "Frontend Technical Assessment",
      sections: [
        {
          id: "section-1",
          title: "Technical Skills",
          questions: [
            {
              id: "q1",
              type: "single-choice",
              label: "How many years of React experience do you have?",
              required: true,
              options: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
            },
            {
              id: "q2",
              type: "multi-choice",
              label: "Which state management libraries have you used?",
              required: true,
              options: ["Redux", "MobX", "Zustand", "Recoil", "Context API"],
            },
            {
              id: "q3",
              type: "single-choice",
              label: "Are you familiar with TypeScript?",
              required: true,
              options: ["Yes", "No"],
            },
            {
              id: "q4",
              type: "short-text",
              label: "What is your favorite TypeScript feature?",
              required: false,
              conditionalOn: {
                questionId: "q3",
                value: "Yes",
              },
              validation: {
                maxLength: 100,
              },
            },
          ],
        },
        {
          id: "section-2",
          title: "Coding Challenge",
          questions: [
            {
              id: "q5",
              type: "long-text",
              label: "Write a function to debounce user input",
              required: true,
              validation: {
                maxLength: 2000,
              },
            },
            {
              id: "q6",
              type: "numeric",
              label: "How confident are you in your solution? (1-10)",
              required: true,
              validation: {
                min: 1,
                max: 10,
              },
            },
          ],
        },
        {
          id: "section-3",
          title: "Additional Information",
          questions: [
            {
              id: "q7",
              type: "file-upload",
              label: "Upload your portfolio or GitHub link",
              required: false,
            },
            {
              id: "q8",
              type: "long-text",
              label: "Why do you want to work with us?",
              required: true,
              validation: {
                maxLength: 500,
              },
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "assessment-2",
      jobId: jobs[1].id,
      title: "Backend Engineering Assessment",
      sections: [
        {
          id: "section-1",
          title: "Technical Background",
          questions: [
            {
              id: "q1",
              type: "multi-choice",
              label: "Which backend frameworks have you worked with?",
              required: true,
              options: ["Express.js", "NestJS", "Django", "Flask", "Spring Boot", "Ruby on Rails"],
            },
            {
              id: "q2",
              type: "single-choice",
              label: "What is your preferred database?",
              required: true,
              options: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB"],
            },
            {
              id: "q3",
              type: "numeric",
              label: "Years of backend development experience",
              required: true,
              validation: {
                min: 0,
                max: 30,
              },
            },
          ],
        },
        {
          id: "section-2",
          title: "System Design",
          questions: [
            {
              id: "q4",
              type: "long-text",
              label: "Design a URL shortener service. Describe your approach.",
              required: true,
              validation: {
                maxLength: 1500,
              },
            },
            {
              id: "q5",
              type: "single-choice",
              label: "Have you worked with microservices?",
              required: true,
              options: ["Yes, extensively", "Yes, some experience", "No, but interested", "No"],
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "assessment-3",
      jobId: jobs[4].id,
      title: "Product Manager Assessment",
      sections: [
        {
          id: "section-1",
          title: "Product Experience",
          questions: [
            {
              id: "q1",
              type: "short-text",
              label: "What product are you most proud of?",
              required: true,
              validation: {
                maxLength: 200,
              },
            },
            {
              id: "q2",
              type: "long-text",
              label: "Describe a time when you had to make a difficult product decision",
              required: true,
              validation: {
                maxLength: 1000,
              },
            },
            {
              id: "q3",
              type: "multi-choice",
              label: "Which product management tools do you use?",
              required: true,
              options: ["Jira", "Linear", "Asana", "Notion", "Productboard", "Figma"],
            },
          ],
        },
        {
          id: "section-2",
          title: "Metrics & Analytics",
          questions: [
            {
              id: "q4",
              type: "single-choice",
              label: "How do you measure product success?",
              required: true,
              options: ["User engagement", "Revenue", "User satisfaction", "All of the above"],
            },
            {
              id: "q5",
              type: "numeric",
              label: "Rate your data analysis skills (1-10)",
              required: true,
              validation: {
                min: 1,
                max: 10,
              },
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  await db.assessments.bulkAdd(assessments)

  console.log("[v0] Database seeded successfully!")
  console.log(`[v0] Created ${jobs.length} jobs, ${candidates.length} candidates, ${assessments.length} assessments`)
}
