import { MigrationInterface, QueryRunner } from 'typeorm';

export class sectionVariant1633247900740 implements MigrationInterface {
  name = 'sectionVariant1633247900740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "section" DROP COLUMN "isPlan"`);
    await queryRunner.query(`ALTER TABLE "section" DROP COLUMN "isTomorrow"`);
    await queryRunner.query(`CREATE TYPE sectionVariant AS ENUM ('work', 'plan', 'tomorrow')`);
    await queryRunner.query(
      `ALTER TABLE "section" ADD COLUMN "variant" sectionVariant NOT NULL DEFAULT 'work'`,
    );
    await queryRunner.query(`UPDATE section SET "variant" = 'plan' WHERE title = 'Plan'`);
    await queryRunner.query(
      `UPDATE section SET "variant" = 'work' WHERE title = 'In the afternoon' OR title = 'In the morning'`,
    );
    await queryRunner.query(`UPDATE section SET "variant" = 'tomorrow' WHERE title = 'Tomorrow'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "section" ADD "isPlan" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(
      `ALTER TABLE "section" ADD "isTomorrow" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`UPDATE "section" SET "isPlan" = true WHERE title = 'Plan'`);
    await queryRunner.query(`UPDATE "section" SET "isTomorrow" = true WHERE title = 'Tomorrow'`);
    await queryRunner.query(`ALTER TABLE "section" DROP COLUMN "variant"`);
    await queryRunner.query(`DROP TYPE sectionVariant`);
  }
}
