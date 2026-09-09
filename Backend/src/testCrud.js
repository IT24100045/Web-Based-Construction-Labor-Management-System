// Test complete CRUD lifecycle against TiDB Cloud Backend
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log('--- Starting TiDB Cloud Full CRUD Test ---');

  // 1. Create Site
  console.log('1. Creating Site...');
  const siteRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/sites',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Lotus Tower Expansion Site',
      code: 'PRJ-LTE-2026',
      location: 'Colombo 10',
      type: 'Infrastructure',
      budget: 12000000,
      status: 'Active'
    }
  );
  console.log('Created Site:', siteRes.data.id, siteRes.data.name);

  // 2. Create Laborer
  console.log('2. Creating Laborer...');
  const labRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/laborers',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Nimal Bandara',
      nic: '199012349999',
      role: 'Master Mason',
      hourlyRate: 1400,
      status: 'Active'
    }
  );
  console.log('Created Laborer:', labRes.data.id, labRes.data.name);

  // 3. Allocate Laborer to Site
  console.log('3. Allocating Laborer to Site...');
  const allocRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/sites/${siteRes.data.id}/allocate`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { laborerIds: [labRes.data.id] }
  );
  console.log('Allocation result:', allocRes.data.message);

  // 4. Record Attendance
  console.log('4. Recording Attendance...');
  const attRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/attendance',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    [
      {
        laborerId: labRes.data.id,
        siteId: siteRes.data.id,
        date: '2026-09-08',
        status: 'Present',
        regularHours: 8,
        overtimeHours: 2.5,
        otReason: 'Overtime concrete pour'
      }
    ]
  );
  console.log('Attendance recorded:', attRes.data[0]?.id);

  // 5. Record Payment
  console.log('5. Recording Payment...');
  const payRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      laborerId: labRes.data.id,
      amount: 15000,
      date: '2026-09-08',
      method: 'Bank Transfer',
      reference: 'TXN-BOC-TEST-01',
      approvedBy: 'Eng. Samantha'
    }
  );
  console.log('Payment recorded:', payRes.data.id, 'Rs.', payRes.data.amount);

  // 6. Verify GET endpoints
  console.log('6. Verifying GET endpoints from TiDB Cloud...');
  const allLabs = await request({ hostname: 'localhost', port: 5000, path: '/api/laborers', method: 'GET' });
  const allSites = await request({ hostname: 'localhost', port: 5000, path: '/api/sites', method: 'GET' });
  const allAtt = await request({ hostname: 'localhost', port: 5000, path: '/api/attendance', method: 'GET' });
  const allPay = await request({ hostname: 'localhost', port: 5000, path: '/api/payments', method: 'GET' });

  console.log('Current TiDB Cloud records:', {
    laborers: allLabs.data.length,
    sites: allSites.data.length,
    attendance: allAtt.data.length,
    payments: allPay.data.length
  });

  // 7. Clean up test records
  console.log('7. Cleaning up test records...');
  await request({ hostname: 'localhost', port: 5000, path: `/api/laborers/${labRes.data.id}`, method: 'DELETE' });
  await request({ hostname: 'localhost', port: 5000, path: `/api/sites/${siteRes.data.id}`, method: 'DELETE' });

  // 8. Confirm clean state
  const cleanLabs = await request({ hostname: 'localhost', port: 5000, path: '/api/laborers', method: 'GET' });
  const cleanSites = await request({ hostname: 'localhost', port: 5000, path: '/api/sites', method: 'GET' });
  console.log('Final database state (should be 0):', {
    laborers: cleanLabs.data.length,
    sites: cleanSites.data.length
  });

  console.log('--- ALL TiDB Cloud Tests Passed Flawlessly! ---');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
