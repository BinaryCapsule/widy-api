import { MigrationInterface, QueryRunner } from 'typeorm';

export class dayIdNotNull1633284684022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "dayId" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "dayId" SET NOT NULL`);
  }
}
