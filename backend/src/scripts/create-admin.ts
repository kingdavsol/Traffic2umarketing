import { query } from '../database/connection';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function createAdminUser() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@quicksell.monster';
    const password = process.env.ADMIN_PASSWORD || 'QuickSellAdmin2025';
    const username = 'admin';

    // Check if admin already exists
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.log(`Admin user already exists with email: ${email}`);
      // Make sure they're admin
      await query('UPDATE users SET is_admin = true WHERE email = $1', [email]);
      console.log('Ensured admin privileges are set');
      return;
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create admin user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, is_admin, subscription_tier, points, current_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, is_admin`,
      [username, email, passwordHash, true, 'premium_plus', 0, 1]
    );

    console.log('✓ Admin user created successfully:');
    console.log(`  ID: ${result.rows[0].id}`);
    console.log(`  Email: ${result.rows[0].email}`);
    console.log(`  Username: ${result.rows[0].username}`);
    console.log(`  Is Admin: ${result.rows[0].is_admin}`);
    console.log(`\nLogin credentials:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
