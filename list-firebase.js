const fs = require('fs');
const path = require('path');

function listDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            // Only list top level directories in firebase
            console.log("DIR: " + file);
        } else {
            console.log("FILE: " + file);
        }
    });
}

console.log("Listing node_modules/@firebase:");
listDir('node_modules/@firebase');
