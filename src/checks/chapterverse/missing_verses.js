const {PerfRenderFromJson} = require('proskomma-json-tools');

function missing_verses({content, contentType, level}) {
    if (!["perf"].includes(contentType)) {
        return {
            "completed": false,
            "abandonReason": ["bad_format", {expected: "perf", found: contentType}]
        }
    }

    const checkChapterVerses = ({workspace, output}) => {
        const verses = Array.from(workspace.chapterVerses).sort((a, b) => a - b);
        if (verses.length > 0) {
            let v = 1;
            while (v <= verses[verses.length - 1]) {
                if (!workspace.chapterVerses.has(v)) {
                    output.missingVerses.push(`${workspace.chapter}:${v}`);
                }
                v++;
            }
        } else {
            output.verselessChapters.push(workspace.chapter);
        }
    }
    const actions = {
        startDocument: [
            {
                description: "Set up",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    output.verselessChapters = [];
                    output.missingVerses = [];
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
                            if (workspace.chapter) {
                                checkChapterVerses({workspace, output});
                            }
                            workspace.chapter = element.atts["number"];
                            workspace.verses = null;
                            workspace.chapterVerses.clear();

                        } else if (element.subType === "verses") {
                            workspace.verses = parseInt(element.atts["number"]);
                            workspace.chapterVerses.add(workspace.verses);
                        }
                    } catch (err) {
                        console.error(err);
                        throw err;
                    }
                    return true;
                },
            },
        ],
        "endDocument": [
            {
                description: "Update CV state",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    checkChapterVerses({workspace, output});
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

module.exports = {missing_verses}
