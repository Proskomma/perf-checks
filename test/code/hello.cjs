const test = require('tape');
const fse = require('fs-extra');
const checker = require('../../src');

const testGroup = 'Hello Checks';

test(
    `Hello (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const perfContent = {perf: fse.readJsonSync('test/data/MARK_titus_aligned_eng.json')};
            const usfmContent = {usfm: "\\id TIT"};
            const spec = fse.readJsonSync('test/specs/hello.json');
            t.throws(() => checker({content: usfmContent, spec, contentType: "usfm"}), /could not read/)
            t.doesNotThrow(() => checker({content: perfContent, spec, contentType: "perf", options: {}}))
        } catch (err) {
            console.log(err);
        }
    },
);
