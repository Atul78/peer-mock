export const TECH_STACKS = [
  "React",
  "Node.js",
  "MERN",
  "DSA",
  "System Design",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "Python",
  "SQL",
] as const;

export type TechStack = (typeof TECH_STACKS)[number];
