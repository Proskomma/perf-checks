function hello_checks({content, contentType}) {
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
             "level": "trivial",
             "args": {
                 "who": "world"
             }
         }
     ]
    }
}

module.exports = {hello_checks}
