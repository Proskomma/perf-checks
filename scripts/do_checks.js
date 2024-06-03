const path = require('path');
const fse = require('fs-extra');

usage = "node do_checks.js <spec> <contentType> <data>";

if (process.argv.length !== 5) {
    console.log(`Wrong number of arguments(${process.argv.length - 2} not 3)\nUSAGE: ${usage}`);
    process.exit(1);
}
const specPath = path.resolve(process.argv[2]);
if (!fse.pathExistsSync(specPath)) {
    console.log(`Spec path '${specPath}' does not exist\nUSAGE: ${usage}`);
    process.exit(1);
}
let spec;
try {
    spec = fse.readJsonSync(specPath);
} catch (e) {
    console.log(`Cannot read '${specPath}' as JSON: ${e}\nUSAGE: ${usage}`);
    process.exit(1);
}
const contentType = process.argv[3];
const knownContentTypes = ["perf", "usfm"];
if (!knownContentTypes.includes(contentType)) {
    console.log(`Unknown contentType '${contentType}': expected one of ${knownContentTypes.map(c => `"${c}"`).join(', ')}\nUSAGE: ${usage}`);
    process.exit(1);
}
const contentPath = path.resolve(process.argv[4]);
if (!fse.pathExistsSync(contentPath)) {
    console.log(`Content path '${contentPath}' does not exist\nUSAGE: ${usage}`);
    process.exit(1);
}
const content = {};
try {
    content[contentType] = contentType === "usfm" ? fse.readFileSync(contentPath).toString() : fse.readJsonSync(contentPath);
} catch (e) {
    console.log(`Cannot read '${contentPath}' as ${contentType}: ${e}\nUSAGE: ${usage}`);
    process.exit(1);
}
const options = {verbose: true};
const checker = require('../src');

console.log(
    JSON.stringify(
        checker(
            {spec, contentType, content, options}),
        null,
        2)
);
