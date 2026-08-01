const { URL } = require('url');
const url = new URL('http://localhost:3000/api/students?verifyName=Aarav%20Pandian');
console.log(url.searchParams.get('verifyName'));
