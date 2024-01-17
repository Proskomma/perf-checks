const fse = require('fs-extra');

const spec = fse.readJsonSync(process.argv[2]);
const contentType = process.argv[3];
const content = {};
content[contentType] = contentType === "usfm" ? fse.readFileSync(process.argv[4]).toString() : fse.readJsonSync(process.argv[4]);
const options = {verbose: true};
const checker = require('../src');

console.log(JSON.stringify(checker({spec, contentType, content, options}), null, 2));
