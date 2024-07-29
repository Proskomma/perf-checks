const {PerfRenderFromJson} = require('proskomma-json-tools');

function duplicate_chapters({content, contentType, level}) {
    if (!["perf"].includes(contentType)) {
        return {
            "completed": false,
            "abandonReason": ["bad_format", {expected: "perf", found: contentType}]
        }
    }
    const actions = {}
    const cl = new PerfRenderFromJson({ srcJson: content, actions });
    const output = {};
    cl.renderDocument({ docId: "", config: {}, output });
    const issues = [];
    /*for (const [k, v] of Object.entries(output)) {
        for (const cv of output[k]) {
            issues.push({
                name: k,
                level,
                "args": {cv}
            });
        }
    }*/
    return {
     "completed": true,
     issues
    }
}

module.exports = {duplicate_chapters}
