const jwt = require('jsonwebtoken');
console.log(jwt.sign({ id: 'dummy', role: 'student' }, process.env.JWT_SECRET || 'secret'));
