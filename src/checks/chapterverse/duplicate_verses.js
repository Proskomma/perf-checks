const {PerfRenderFromJson} = require('proskomma-json-tools');

function duplicate_verses({content, contentType, level}) {
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
                action: ({ config, context, workspace, output }) => {
                    output.duplicateVerses = [];
                    workspace.chapter = null;
                    workspace.verses = null;
                    workspace.chapterVerses = new Set([]);
                }
            },
        ],
        mark: [
            {
                description: "Update CV state",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    try {
                        const element = context.sequences[0].element;
                        if (element.subType === "chapter") {
                            workspace.chapter = element.atts["number"];
                            workspace.verses = null;

                        } else if (element.subType === "verses") {
                            workspace.verses = element.atts["number"];
                            const cv = `${workspace.chapter}:${workspace.verses}`;
                            if (workspace.chapterVerses.has(cv)) {
                                output.duplicateVerses.push(cv);
                            }
                            workspace.chapterVerses.add(cv);
                        }
                    } catch (err) {
                        console.error(err);
                        throw err;
                    }
                    return true;
                },
            },
        ]
    }
    const cl = new PerfRenderFromJson({ srcJson: content, actions });
    const output = {};
    cl.renderDocument({ docId: "", config: {}, output });
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

module.exports = {duplicate_verses}
