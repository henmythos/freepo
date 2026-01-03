const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('node_modules/firebase/package.json', 'utf8'));
console.log(JSON.stringify(pkg.exports, null, 2));
