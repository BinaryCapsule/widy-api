import { PrismaClient } from '@prisma/client';
import faker from 'faker';
import { SectionVariant } from '../src/sections/types/section-variant';
import { RANK_BLOCK_SIZE } from '../src/common/constants';

const prisma = new PrismaClient();

const days = [
  '2021-12-25',
  '2021-12-24',
  '2021-12-23',
  '2021-12-22',
  '2021-12-21',
  '2021-12-20',
  '2021-12-19',
  '2021-12-18',
  '2021-12-17',
];

const geTasks = () => [
  { summary: faker.lorem.words(7), rank: RANK_BLOCK_SIZE, owner },
  { summary: faker.lorem.words(7), rank: RANK_BLOCK_SIZE * 2, owner },
  { summary: faker.lorem.words(7), rank: RANK_BLOCK_SIZE * 3, owner },
];

const owner = 'auth0|5f8953c5fe68c800686004d1';

async function main() {
  for (let day of days) {
    await prisma.day.create({
      data: {
        day,
        owner,
        sections: {
          create: [
            {
              variant: SectionVariant.Plan,
              title: 'Plan',
              rank: RANK_BLOCK_SIZE,
              owner,
              tasks: {
                create: geTasks(),
              },
            },
            {
              variant: SectionVariant.Work,
              title: 'In the morning',
              rank: RANK_BLOCK_SIZE * 2,
              owner,
              tasks: {
                create: geTasks(),
              },
            },
            {
              variant: SectionVariant.Work,
              title: 'In the afternoon',
              rank: RANK_BLOCK_SIZE * 3,
              owner,
              tasks: {
                create: geTasks(),
              },
            },
          ],
        },
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
