import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Parse .env.local or .env if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

const dbConfig = {
  host: process.env.DB_HOST || 'sih-mysql.cley86o8g8vx.eu-north-1.rds.amazonaws.com',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'kFjzqqPYEQb2awh',
  database: process.env.DB_NAME || 'sih',
  ssl: { rejectUnauthorized: false },
  connectTimeout: 10000,
};

async function runTest() {
  console.log('🔄 Connecting to AWS RDS MySQL Database...');
  console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`👤 User: ${dbConfig.user}`);
  console.log(`📦 Database: ${dbConfig.database}\n`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection established successfully!\n');

    // 1. Ping
    console.log('1️⃣ Pinging database server...');
    const [pingRes] = await connection.query('SELECT 1 + 1 AS ping, CURRENT_TIMESTAMP AS server_time, VERSION() AS db_version');
    console.log(`   Ping Result: 1+1=${pingRes[0].ping}`);
    console.log(`   Server Time: ${pingRes[0].server_time}`);
    console.log(`   DB Version : ${pingRes[0].db_version}\n`);

    // 2. Ensure schema tables exist
    console.log('2️⃣ Verifying / Creating tables (`farmers`, `crops`, `users`)...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        district VARCHAR(100),
        village VARCHAR(100),
        language VARCHAR(50) DEFAULT 'en',
        land_area DECIMAL(10,2) DEFAULT 0.00,
        loan_amount DECIMAL(12,2) DEFAULT 0.00,
        loan_due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS crops (
        id VARCHAR(64) PRIMARY KEY,
        farmer_id VARCHAR(64) NOT NULL,
        name VARCHAR(100) NOT NULL,
        stage VARCHAR(100) DEFAULT 'Sowing',
        sowing_date DATE,
        INDEX idx_farmer (farmer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255),
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'farmer',
        profile_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [tables] = await connection.query('SHOW TABLES');
    console.log('   Current Database Tables:');
    console.table(tables);

    // 3. Round-trip INSERT -> SELECT -> DELETE test
    console.log('\n3️⃣ Performing Round-Trip Verification (INSERT -> SELECT -> DELETE)...');
    const testFarmerId = `test_farmer_${Date.now()}`;
    const testCropId = `test_crop_${Date.now()}`;

    // Insert Farmer
    await connection.query(`
      INSERT INTO farmers (id, name, phone, district, village, language, land_area, loan_amount, loan_due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [testFarmerId, 'Test Farmer Rajesh', '9876543210', 'Mayurbhanj', 'Baripada', 'or', 3.5, 45000.00, '2026-11-30']);

    // Insert Crop
    await connection.query(`
      INSERT INTO crops (id, farmer_id, name, stage, sowing_date)
      VALUES (?, ?, ?, ?, ?)
    `, [testCropId, testFarmerId, 'Paddy (Swarna)', 'Tillering', '2026-06-15']);

    // Select and Verify
    const [farmerRows] = await connection.query('SELECT * FROM farmers WHERE id = ?', [testFarmerId]);
    const [cropRows] = await connection.query('SELECT * FROM crops WHERE id = ?', [testCropId]);

    if (farmerRows.length > 0 && cropRows.length > 0) {
      console.log('   ✅ Verification successful! Retrieved test records:');
      console.table(farmerRows);
      console.table(cropRows);
    } else {
      throw new Error('Verification failed: Could not retrieve inserted test data.');
    }

    // Cleanup test records
    await connection.query('DELETE FROM crops WHERE id = ?', [testCropId]);
    await connection.query('DELETE FROM farmers WHERE id = ?', [testFarmerId]);
    console.log('   🧹 Cleaned up temporary test records.');

    console.log('\n🎉 ALL DATABASE TESTS PASSED WITH FLYING COLORS!\n');
  } catch (error) {
    console.error('❌ Database Test Failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runTest();
