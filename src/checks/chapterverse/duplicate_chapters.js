const {PerfRenderFromJson} = require('proskomma-json-tools');

function duplicate_chapters({content, contentType, level}) {
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
                    output.duplicateChapters = [];
                    workspace.chapter = null;
                    workspace.chapters = new Set([]);
                    workspace.duplicateChapters = new Set([]);
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
                            const chapter = element.atts["number"];
                            if (workspace.chapters.has(chapter)) {
                                workspace.duplicateChapters.add(chapter);
                            } else {
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
                description: "Copy duplicate chapters to output",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    output.duplicateChapters = Array.from(workspace.duplicateChapters);
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
                chapter: cv,
                verse: null,
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

module.exports = {duplicate_chapters}
