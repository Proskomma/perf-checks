const {PerfRenderFromJson} = require('proskomma-json-tools');

function missing_chapters({content, contentType, level}) {
    if (!["perf"].includes(contentType)) {
        return {
            "completed": false,
            "abandonReason": ["bad_format", {expected: "perf", found: contentType}]
        }
    }
    const actions = {
        startDocument: [
            {
                description: "Set up",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    output.missingChapters = [];
                    workspace.chapter = null;
                    workspace.chapters = new Set([]);
                }
            },
        ],
        mark: [
            {
                description: "Update Chapter state",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    try {
                        const element = context.sequences[0].element;
                        if (element.subType === "chapter") {
                            if (workspace.chapter) {
                                const chapter = parseInt(element.atts["number"]);
                                workspace.chapters.add(chapter);
                            }
                        }
                    } catch (err) {
                        console.error(err);
                        throw err;
                    }
                    return true;
                },
            },
        ],
        endDocument: [
            {
                description: "Calculate missing chapters",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    const chapters = Array.from(workspace.chapters).sort((a, b) => a - b);
                    let ch = 1;
                    while (ch <= chapters[chapters.length - 1]) {
                        if (!workspace.chapters.has(ch)) {
                            output.missingChapters.push(ch);
                        }
                        ch++;
                    }
                }
            }
        ]
    }
    const cl = new PerfRenderFromJson({srcJson: content, actions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    const issues = [];
    for (const [k, v] of Object.entries(output)) {
        for (const cv of output[k]) {
            issues.push({
                name: k,
                level,
                "args": {cv}
            });
        }
    }
    return {
        "completed": true,
        issues
    }
}

module.exports = {missing_chapters}
