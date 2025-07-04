import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as XLSX from 'xlsx';
import * as path from 'path';

// Load environment variables
config();

interface ExcelRowData {
  Mã: number;
  Tên: string;
  Cấp: string;
  'Nghị quyết': string;
  'Mã TP': number;
  'Tỉnh / Thành Phố': string;
}

interface ProvinceData {
  id: number;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
}

interface AdminUnitData {
  id: number;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  provinceId: number;
}

// PostgreSQL connection
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'event_service',
  entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
});

async function importVietnamData() {
  try {
    console.log('🚀 Starting Vietnam 2025 Administrative Data Import...');

    // Initialize PostgreSQL connection
    await dataSource.initialize();
    console.log('Connected to PostgreSQL');

    // Read Excel file
    const excelPath = path.join(
      __dirname,
      '..',
      'danh-sach-3321-xa-phuong.xls',
    );
    console.log(`📁 Reading Excel file: ${excelPath}`);

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: ExcelRowData[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${rawData.length} administrative units`);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await dataSource.query('DELETE FROM wards');
    await dataSource.query('DELETE FROM districts');
    await dataSource.query('DELETE FROM cities');

    // Extract unique provinces
    const provinceMap = new Map<number, ProvinceData>();
    rawData.forEach((row) => {
      if (!provinceMap.has(row['Mã TP'])) {
        const provinceName = row['Tỉnh / Thành Phố'];
        provinceMap.set(row['Mã TP'], {
          id: row['Mã TP'],
          name: provinceName,
          nameEn: translateProvinceName(provinceName),
          type: getProvinceType(provinceName),
          typeEn: getProvinceTypeEn(provinceName),
        });
      }
    });

    // Insert cities/provinces
    console.log(`🏛️ Inserting ${provinceMap.size} provinces/cities...`);
    for (const province of provinceMap.values()) {
      await dataSource.query(
        'INSERT INTO cities (origin_id, name, name_en, type, type_en, short_name, country_id, sort, status, location_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())',
        [
          province.id,
          province.name,
          province.nameEn,
          province.type,
          province.typeEn,
          province.nameEn.substring(0, 20), // short_name (truncated)
          1, // country_id (Vietnam)
          province.id, // sort
          1, // status (active)
          `VN-${province.id.toString().padStart(2, '0')}`, // location_id
        ],
      );
    }

    // Process administrative units (wards/communes)
    console.log('🏘️ Processing administrative units...');
    const adminUnits: AdminUnitData[] = rawData.map((row) => ({
      id: row['Mã'],
      name: row['Tên'].trim(),
      nameEn: translateAdminUnitName(row['Tên'].trim(), row['Cấp']),
      type: row['Cấp'],
      typeEn: translateAdminUnitType(row['Cấp']),
      provinceId: row['Mã TP'],
    }));

    // Insert administrative units as wards (using district_id as city_id for 2-tier system)
    console.log(`📍 Inserting ${adminUnits.length} administrative units...`);
    for (const unit of adminUnits) {
      await dataSource.query(
        'INSERT INTO wards (origin_id, name, name_en, type, type_en, sort, status, district_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
        [
          unit.id,
          unit.name,
          unit.nameEn,
          unit.type,
          unit.typeEn,
          1, // sort
          1, // status
          unit.provinceId,
        ],
      );
    }

    // Print summary
    console.log('\n✅ Import completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Provinces/Cities: ${provinceMap.size}`);
    console.log(`   • Administrative Units: ${adminUnits.length}`);

    const typeCounts = adminUnits.reduce(
      (acc, unit) => {
        acc[unit.type] = (acc[unit.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('   • By type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

function getProvinceType(provinceName: string): string {
  if (provinceName.startsWith('Thành phố')) {
    return 'Thành phố';
  }
  return 'Tỉnh';
}

function getProvinceTypeEn(provinceName: string): string {
  if (provinceName.startsWith('Thành phố')) {
    return 'City';
  }
  return 'Province';
}

function translateProvinceName(provinceName: string): string {
  // Remove type prefix and translate
  const nameWithoutType = provinceName.replace(/^(Thành phố|Tỉnh)\s+/, '');

  const translations: Record<string, string> = {
    'Hà Nội': 'Hanoi',
    'Hồ Chí Minh': 'Ho Chi Minh City',
    'Đà Nẵng': 'Da Nang',
    'Hải Phòng': 'Hai Phong',
    'Cần Thơ': 'Can Tho',
    'An Giang': 'An Giang',
    'Bà Rịa - Vũng Tàu': 'Ba Ria - Vung Tau',
    'Bắc Giang': 'Bac Giang',
    'Bắc Kạn': 'Bac Kan',
    'Bạc Liêu': 'Bac Lieu',
    'Bắc Ninh': 'Bac Ninh',
    'Bến Tre': 'Ben Tre',
    'Bình Định': 'Binh Dinh',
    'Bình Dương': 'Binh Duong',
    'Bình Phước': 'Binh Phuoc',
    'Bình Thuận': 'Binh Thuan',
    'Cà Mau': 'Ca Mau',
    'Cao Bằng': 'Cao Bang',
    'Đắk Lắk': 'Dak Lak',
    'Đắk Nông': 'Dak Nong',
    'Điện Biên': 'Dien Bien',
    'Đồng Nai': 'Dong Nai',
    'Đồng Tháp': 'Dong Thap',
    'Gia Lai': 'Gia Lai',
    'Hà Giang': 'Ha Giang',
    'Hà Nam': 'Ha Nam',
    'Hà Tĩnh': 'Ha Tinh',
    'Hải Dương': 'Hai Duong',
    'Hậu Giang': 'Hau Giang',
    'Hòa Bình': 'Hoa Binh',
    'Hưng Yên': 'Hung Yen',
    'Khánh Hòa': 'Khanh Hoa',
    'Kiên Giang': 'Kien Giang',
    'Kon Tum': 'Kon Tum',
    'Lai Châu': 'Lai Chau',
    'Lâm Đồng': 'Lam Dong',
    'Lạng Sơn': 'Lang Son',
    'Lào Cai': 'Lao Cai',
    'Long An': 'Long An',
    'Nam Định': 'Nam Dinh',
    'Nghệ An': 'Nghe An',
    'Ninh Bình': 'Ninh Binh',
    'Ninh Thuận': 'Ninh Thuan',
    'Phú Thọ': 'Phu Tho',
    'Phú Yên': 'Phu Yen',
    'Quảng Bình': 'Quang Binh',
    'Quảng Nam': 'Quang Nam',
    'Quảng Ngãi': 'Quang Ngai',
    'Quảng Ninh': 'Quang Ninh',
    'Quảng Trị': 'Quang Tri',
    'Sóc Trăng': 'Soc Trang',
    'Sơn La': 'Son La',
    'Tây Ninh': 'Tay Ninh',
    'Thái Bình': 'Thai Binh',
    'Thái Nguyên': 'Thai Nguyen',
    'Thanh Hóa': 'Thanh Hoa',
    'Thừa Thiên Huế': 'Thua Thien Hue',
    'Tiền Giang': 'Tien Giang',
    'Trà Vinh': 'Tra Vinh',
    'Tuyên Quang': 'Tuyen Quang',
    'Vĩnh Long': 'Vinh Long',
    'Vĩnh Phúc': 'Vinh Phuc',
    'Yên Bái': 'Yen Bai',
  };

  return translations[nameWithoutType] || nameWithoutType;
}

function translateAdminUnitType(type: string): string {
  const translations: Record<string, string> = {
    Phường: 'Ward',
    Xã: 'Commune',
    'Đặc khu': 'Special Zone',
  };

  return translations[type] || type;
}

function translateAdminUnitName(name: string, type: string): string {
  // Clean up name (remove newlines and extra spaces)
  const cleanName = name.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Translate type prefix to English
  const typeTranslations: Record<string, string> = {
    Phường: 'Ward',
    Xã: 'Commune',
    'Đặc khu': 'Special Zone',
  };

  // Extract the type prefix and name part
  const typePrefix = type;
  const typeEn = typeTranslations[typePrefix] || typePrefix;

  // For administrative units, we create English names by:
  // 1. Translating the type prefix
  // 2. Keeping the Vietnamese name part (as it's usually a proper noun)
  // 3. Combining them in English format

  // Remove Vietnamese type prefix if it exists in the name
  let namePart = cleanName;
  if (cleanName.startsWith(typePrefix + ' ')) {
    namePart = cleanName.substring(typePrefix.length + 1);
  }

  // Return English format: "Ward Ba Dinh", "Commune Muong Hung", etc.
  return `${typeEn} ${namePart}`;
}

// Run the import
importVietnamData();
