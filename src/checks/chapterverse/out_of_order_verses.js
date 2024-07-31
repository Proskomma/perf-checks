const {PerfRenderFromJson} = require('proskomma-json-tools');

function out_of_order_verses({content, contentType, level}) {
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
                    output.outOfOrderChapterVerses = [];
                    workspace.chapter = null;
                    workspace.verses = null;
                    workspace.chapterVerses = [];
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
                            workspace.chapter = element.atts["number"];
                            workspace.chapterVerses =[];
                        } else {
                            const chapterVerse = parseInt(element.atts["number"]);
                            const previousChapterVerse = workspace.chapterVerses[workspace.chapterVerses.length - 1];
                            if (workspace.chapterVerses.length > 0 && chapterVerse < previousChapterVerse) {
                                output.outOfOrderChapterVerses.push(`${workspace.chapter}:${previousChapterVerse}>${workspace.chapter}:${chapterVerse}`);
                            }
                            workspace.chapterVerses.push(chapterVerse);
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
            const [c, v] = cv.split(":");
            const [cv1, cv2] = cv.split(">");
            const [v1, v2] = cv2.split(":");
            issues.push({
                chapter: c,
                verse: v2,
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

module.exports = {out_of_order_verses}
