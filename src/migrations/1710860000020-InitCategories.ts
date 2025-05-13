import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCategories1710860000020 implements MigrationInterface {
	name = 'InitCategories1710860000020';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
          INSERT INTO public.categories (id,code,name_en,name_vi,image,created_at,updated_at) VALUES
	 ('fc981c1b-485d-497d-b539-b8e73c4376bb'::uuid,'music','Music','Âm nhạc','https://eventify-event-service.s3.ap-southeast-1.amazonaws.com/planner/events/90c0ca15-7de7-4f56-89bd-f0edb1cdbb24-hero-guitar-outro.jpg','2025-04-11 08:12:05.454895','2025-04-11 08:12:05.454895'),
	 ('4247769b-251e-4909-8c89-3af54d648374'::uuid,'sport','Sport','Thể thao','https://eventify-event-service.s3.ap-southeast-1.amazonaws.com/planner/events/7e3b64a8-1e00-407b-b63c-454ecd3493ec-sport-illustatrion.jpg','2025-04-25 10:42:12.061482','2025-04-25 10:42:12.061482'),
	 ('9671bdf8-484e-4922-8835-cc800cc7ba3f'::uuid,'technology','Technology','Công nghệ','https://eventify-event-service.s3.ap-southeast-1.amazonaws.com/planner/events/12a29c80-a2d4-437d-8b24-084e8b61cf6e-technology-illustration.jpg','2025-04-25 10:45:56.601541','2025-04-25 10:45:56.601541'),
	 ('e93a9e98-7963-4f8e-937f-4a9f4448c526'::uuid,'charity','Charity','Từ thiện','https://eventify-event-service.s3.ap-southeast-1.amazonaws.com/planner/events/cba5da67-f170-4e36-bfa0-617ee70af414-charity-illustration.jpg','2025-04-25 10:46:16.028521','2025-04-25 10:46:16.028521'),
	 ('666c5e58-6658-4363-82c6-93d5179ddab0'::uuid,'art','Art','Nghệ thuật','https://eventify-event-service.s3.ap-southeast-1.amazonaws.com/planner/events/7f90d637-dc1a-4964-bc02-8a9e1ebebfc5-art-illustration.jpg','2025-04-25 10:46:37.155225','2025-04-25 10:46:37.155225'),
	 ('ad1066ef-5f07-44a6-9d2b-6cba40194139'::uuid,'education','Education','Giáo dục','https://eventify-event-service.s3.ap-southeast-1.amazonaws.com/planner/events/5c3a8f2f-f3a3-4bce-ad48-390a9092b7c3-education-illustration.jpg','2025-04-25 10:46:58.544688','2025-04-25 10:46:58.544688');
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
          
        `);
	}
}
