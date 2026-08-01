const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 'dummy', role: 'student' }, 'ab83h28jd92jdn198jd298dh1928hd291hd92');
fetch('http://localhost:3000/api/students?verifyRoll=AIDS1001&verifyName=Aarav%20Pandian&verifyDept=6a6cc18ae9bbcf99cad5257a&verifyYear=1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(res => res.json()).then(console.log).catch(console.error);
