const { pool } = require('./db');

async function initializeSchema() {
  console.log('[TiDB Cloud] Initializing database schema in database JAL...');

  const queries = [
    `CREATE TABLE IF NOT EXISTS sites (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      location VARCHAR(255) DEFAULT '',
      type VARCHAR(100) DEFAULT 'Commercial',
      client VARCHAR(255) DEFAULT '',
      start_date VARCHAR(20) DEFAULT NULL,
      end_date VARCHAR(20) DEFAULT NULL,
      budget DECIMAL(15, 2) DEFAULT 0.00,
      manager VARCHAR(255) DEFAULT '',
      status VARCHAR(50) DEFAULT 'Active',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS laborers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      nic VARCHAR(50) NOT NULL UNIQUE,
      phone VARCHAR(50) DEFAULT '',
      email VARCHAR(100) DEFAULT '',
      address TEXT,
      emergency_contact VARCHAR(255) DEFAULT '',
      role VARCHAR(100) NOT NULL,
      skill_level VARCHAR(100) DEFAULT '',
      hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 1200.00,
      status VARCHAR(50) DEFAULT 'Active',
      assigned_site_id VARCHAR(50) DEFAULT NULL,
      join_date VARCHAR(20) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_laborer_site (assigned_site_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(50) PRIMARY KEY,
      laborer_id VARCHAR(50) NOT NULL,
      site_id VARCHAR(50) NOT NULL,
      date VARCHAR(20) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Present',
      regular_hours DECIMAL(4, 2) NOT NULL DEFAULT 8.00,
      overtime_hours DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
      ot_reason VARCHAR(255) DEFAULT '',
      supervisor_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_laborer_date (laborer_id, date),
      INDEX idx_attendance_site (site_id),
      INDEX idx_attendance_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(50) PRIMARY KEY,
      laborer_id VARCHAR(50) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      date VARCHAR(20) NOT NULL,
      method VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
      reference VARCHAR(100) NOT NULL,
      approved_by VARCHAR(255) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_payments_laborer (laborer_id),
      INDEX idx_payments_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      title VARCHAR(255) DEFAULT '',
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_role (role),
      INDEX idx_user_username (username),
      INDEX idx_user_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const q of queries) {
    await pool.query(q);
  }

  // Seed default demo user accounts if they don't already exist
  const DEMO_USERS = [
    {
      id: 'USR-ADMIN-01',
      username: 'admin',
      email: 'admin@jalenterprises.lk',
      password: 'admin2026',
      name: 'Eng. J.A. Liyanage',
      role: 'admin',
      title: 'Managing Director & System Admin',
      status: 'Active'
    },
    {
      id: 'USR-PM-01',
      username: 'pm',
      email: 'pm@jalenterprises.lk',
      password: 'pm2026',
      name: 'Sunil Fernando',
      role: 'project_manager',
      title: 'Senior Project Manager',
      status: 'Active'
    },
    {
      id: 'USR-SUP-01',
      username: 'supervisor',
      email: 'supervisor@jalenterprises.lk',
      password: 'supervisor2026',
      name: 'Eng. N. Samarasinghe',
      role: 'site_supervisor',
      title: 'Chief Site Supervisor',
      status: 'Active'
    },
    {
      id: 'USR-HR-01',
      username: 'hr',
      email: 'hr@jalenterprises.lk',
      password: 'hr2026',
      name: 'Kamal Weerasinghe',
      role: 'hr_manager',
      title: 'Head of Human Resources',
      status: 'Active'
    },
    {
      id: 'USR-PAY-01',
      username: 'payroll',
      email: 'payroll@jalenterprises.lk',
      password: 'payroll2026',
      name: 'Anoma Jayawardena',
      role: 'payroll_officer',
      title: 'Senior Payroll & Accounts Officer',
      status: 'Active'
    }
  ];

  for (const u of DEMO_USERS) {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [u.username, u.email]
    );
    if (!existing || existing.length === 0) {
      await pool.query(
        `INSERT INTO users (id, username, email, password, name, role, title, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.username, u.email, u.password, u.name, u.role, u.title, u.status]
      );
      console.log(`[TiDB Cloud] Seeded default user account: ${u.username} (${u.role})`);
    }
  }

  console.log('[TiDB Cloud] All tables (sites, laborers, attendance, payments, users) verified successfully.');
}

module.exports = {
  initializeSchema
};
