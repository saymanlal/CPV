import bcrypt from 'bcrypt';
import type { Prisma } from '@prisma/client';
import { prisma } from './index.js';

const adminPassword = 'Admin12345';

const starterProblems: Array<{
  title: string;
  slug: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM';
  tags: string[];
  starterCode: Prisma.InputJsonValue;
  testCases: Array<{ input: string; expectedOutput: string; explanation?: string; isSample: boolean }>;
}> = [
  {
    title: 'Palindrome Sprint',
    slug: 'palindrome-sprint',
    description:
      'Given a string, determine whether it is a palindrome after removing non-alphanumeric characters and ignoring case differences.',
    difficulty: 'EASY',
    tags: ['strings', 'two-pointers'],
    starterCode: {
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n',
      python: 'def solve() -> None:\n    pass\n\n\nif __name__ == "__main__":\n    solve()\n',
      java: 'public class Main {\n    public static void main(String[] args) throws Exception {\n    }\n}\n',
    },
    testCases: [
      {
        input: 'A man, a plan, a canal: Panama',
        expectedOutput: 'true',
        explanation: 'Letters only becomes amanaplanacanalpanama, which reads the same backwards.',
        isSample: true,
      },
      {
        input: 'race a car',
        expectedOutput: 'false',
        isSample: true,
      },
    ],
  },
  {
    title: 'Array Rotation Duel',
    slug: 'array-rotation-duel',
    description:
      'Rotate an array to the right by k positions and print the final order. The challenge focuses on indexing and modular arithmetic.',
    difficulty: 'MEDIUM',
    tags: ['arrays', 'implementation'],
    starterCode: {
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n',
      python: 'def solve() -> None:\n    pass\n\n\nif __name__ == "__main__":\n    solve()\n',
      java: 'public class Main {\n    public static void main(String[] args) throws Exception {\n    }\n}\n',
    },
    testCases: [
      {
        input: '5 2\n1 2 3 4 5',
        expectedOutput: '4 5 1 2 3',
        isSample: true,
      },
    ],
  },
];

const main = async () => {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cpv.dev' },
    update: {
      username: 'admin',
      role: 'ADMIN',
      passwordHash,
    },
    create: {
      email: 'admin@cpv.dev',
      username: 'admin',
      role: 'ADMIN',
      passwordHash,
    },
  });

  for (const problem of starterProblems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        tags: problem.tags,
        starterCode: problem.starterCode,
        authorId: admin.id,
      },
      create: {
        title: problem.title,
        slug: problem.slug,
        description: problem.description,
        difficulty: problem.difficulty,
        tags: problem.tags,
        starterCode: problem.starterCode,
        authorId: admin.id,
        testCases: {
          create: problem.testCases.map((testCase, index) => ({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            explanation: testCase.explanation,
            isSample: testCase.isSample,
            orderIndex: index,
          })),
        },
      },
    });
  }

  console.log('Seed complete.');
  console.log('Admin email: admin@cpv.dev');
  console.log(`Admin password: ${adminPassword}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
