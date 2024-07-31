const {PerfRenderFromJson} = require('proskomma-json-tools');

function out_of_order_chapters({content, contentType, level}) {
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
                    output.outOfOrderChapters = [];
                    workspace.chapter = null;
                    workspace.chapters = [];
                }
            },
        ],
        mark: [
            {
                description: "Update chapter state",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    try {
                        const element = context.sequences[0].element;
                        if (element.subType === "chapter") {
                            const chapter = element.atts["number"];
                            const previousChapter = workspace.chapters[workspace.chapters.length - 1];
                            if (workspace.chapters.length > 0 && chapter < previousChapter) {
                                output.outOfOrderChapters.push(`${previousChapter}>${chapter}`);
                            }
                            workspace.chapters.push(chapter);
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
            const [c1, c2] = cv.split(">");
            issues.push({
                name: k,
                chapter: c2,
                verse: null,
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

module.exports = {out_of_order_chapters}
