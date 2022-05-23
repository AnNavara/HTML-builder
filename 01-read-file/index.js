const fs = require('fs');
const path = require('path');

const readStream = fs.createReadStream(path.join(__dirname, './text.txt'));
let data = '';

readStream.on('data', (chunk) => {
    data += chunk;
});

readStream.on('error', (err) => {
    throw new Error(err);
});

readStream.on('end', () => {
    console.log(data);
});
