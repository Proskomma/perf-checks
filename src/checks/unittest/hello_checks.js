function hello_checks({content, contentType, level}) {
    if (!["perf"].includes(contentType)) {
        return {
            "completed": false,
            "abandonReason": ["bad_format", {expected: "perf", found: contentType}]
        }
    }
    return {
     "completed": true,
     "issues": [
         {
             "name": "hello",
             level,
             "chapter": null,
             "verse": 0,
             "args": {
                 "who": "world"
             }
         }
     ]
    }
}

module.exports = {hello_checks}
