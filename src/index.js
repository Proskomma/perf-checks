const checkFunctions = require('./checks');

function checker({spec, content, contentType, options = {}}) {
    if (!spec) {
        throw new Error("No spec supplied to checker");
    }
    if (!content) {
        throw new Error("No content supplied to checker");
    }
    if (!contentType) {
        throw new Error("No contentType supplied to checker");
    }
    options.verbose && console.log(`* Checker ${spec.name}\n** ${spec.description}`);
    const stats = {
        tested: 0,
        pass: 0,
        fail: 0
    }
    let issuesTree = [];
    for (const check of spec.checks) {
        const checkFullName = check.name;
        options.verbose && console.log(`   - ${checkFullName}`);
        if (!content[check.contentType]) {
            throw new Error(`Check ${checkFullName} expected contentType ${check.contentType} but could not read or coerce to this format`);
        }
        const [checkNS, checkName] = checkFullName.split('::');
        const checkRet = checkFunctions[checkNS][checkName]({
            content: content[check.contentType],
            contentType,
            level: check.level
        });
        issuesTree.push({ns: checkNS, qName: checkName, ...checkRet});
    }
    options.verbose && console.log(`# Issues Tree Completed`);
    const denormalizedIssues = issuesTree
        .map(
            nsOb => nsOb
                .issues
                .map(
                    iOb =>
                        ({
                            ns: nsOb.ns,
                            name: iOb.name,
                            chapter: iOb.chapter,
                            verse: iOb.verse,
                            level: iOb.level,
                            args: iOb.args,
                        })
                )
        ).reduce((a, b) => [...a, ...b])
        .sort((a, b) =>
            (((parseInt(a.chapter) || 0) * 1000) + (parseInt(a.verse) || 0)) - (((parseInt(b.chapter) || 0) * 1000) + (parseInt(b.verse) || 0))
        )
    return denormalizedIssues;
}

module.exports = checker;
