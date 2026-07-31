fetch('http://localhost:3000/api/students?limit=10')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data).slice(0, 500)))
  .catch(console.error);
