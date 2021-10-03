import { MigrationInterface, QueryRunner } from 'typeorm';

export class tomorrowSection1633245973036 implements MigrationInterface {
  name = 'tomorrowSection1633245973036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "start" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "scopeId" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "section" ADD COLUMN "isTomorrow" bool DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "scopeId" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "start" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "section" DROP COLUMN "isTomorrow"`);
  }
}
