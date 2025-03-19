import { MongoClient } from 'mongodb';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

// MongoDB connection
const mongoUrl =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/event_service';

// PostgreSQL connection
const postgresDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'event_service',
  entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
});

async function migrateData() {
  try {
    // Connect to MongoDB
    const mongoClient = await MongoClient.connect(mongoUrl);
    const mongoDB = mongoClient.db();
    console.log('Connected to MongoDB');

    // Initialize PostgreSQL connection
    await postgresDataSource.initialize();
    console.log('Connected to PostgreSQL');

    // Get MongoDB collections
    const collections = {
      categories: mongoDB.collection('categories'),
      cities: mongoDB.collection('cities'),
      districts: mongoDB.collection('districts'),
      wards: mongoDB.collection('wards'),
      events: mongoDB.collection('events'),
      paymentInfo: mongoDB.collection('paymentinfo'),
      settings: mongoDB.collection('settings'),
      shows: mongoDB.collection('shows'),
      tickets: mongoDB.collection('tickets'),
      members: mongoDB.collection('members'),
      questions: mongoDB.collection('questions'),
      questionAnswers: mongoDB.collection('questionanswers'),
      vouchers: mongoDB.collection('vouchers'),
    };

    // Create a map to store MongoDB _id to PostgreSQL UUID mappings
    const idMappings = new Map();

    // // Migrate Categories
    console.log('Migrating Categories...');
    const categories = await collections.categories.find().toArray();
    for (const category of categories) {
      const newId = uuidv4();
      idMappings.set(category._id.toString(), newId);
      await postgresDataSource.query(
        'INSERT INTO categories (id, code, name_en, name_vi, image) VALUES ($1, $2, $3, $4, $5)',
        [
          newId,
          category.code,
          category.nameEn,
          category.nameVi,
          category.image,
        ],
      );
    }

    // Migrate Cities
    console.log('Migrating Cities...');
    const cities = await collections.cities.find().toArray();
    for (const city of cities) {
      const newId = uuidv4();
      await postgresDataSource.query(
        'INSERT INTO cities (id, origin_id, name, name_en, type, type_en, short_name, country_id, sort, status, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          newId,
          city.originId,
          city.name,
          city.nameEn,
          city.type,
          city.typeEn,
          city.shortName,
          city.countryId,
          city.sort,
          city.status,
          city.locationId,
        ],
      );
    }

    // Migrate districts
    console.log('Migrating Districts...');
    const districts = await collections.districts.find().toArray();
    for (const district of districts) {
      const newId = uuidv4();
      const cityId = district.cityId.toString();
      await postgresDataSource.query(
        'INSERT INTO districts (id, name, name_en, type, type_en, sort, status, location, short_name, origin_id, city_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          newId,
          district.name,
          district.nameEn,
          district.type,
          district.typeEn,
          district.sort,
          district.status,
          district.location,
          district.shortName,
          district.originId,
          cityId,
        ],
      );
    }

    // Migrate wards
    console.log('Migrating Wards...');
    const wards = await collections.wards.find().toArray();
    for (const ward of wards) {
      const newId = uuidv4();
      const districtId = ward.districtId.toString();

      await postgresDataSource.query(
        'INSERT INTO wards (id, name, name_en, type, type_en, status, sort, origin_id, district_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          newId,
          ward.name,
          ward.nameEn,
          ward.type,
          ward.typeEn,
          ward.status,
          ward.sort,
          ward.originId,
          districtId,
        ],
      );
    }

    console.log('Migration completed successfully');
    await mongoClient.close();
    await postgresDataSource.destroy();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
