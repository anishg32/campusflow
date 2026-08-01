const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/students?verifyRoll=AIDS1001&verifyName=Aarav%20Pandian&verifyDept=6a6cc18ae9bbcf99cad5257a&verifyYear=1',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + require('jsonwebtoken').sign({ id: 'dummy', role: 'student' }, process.env.JWT_SECRET || 'secret')
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
