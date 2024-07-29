const {missing_chapters} = require('./missing_chapters');
const {duplicate_chapters} = require('./duplicate_chapters');
const {out_of_order_chapters} = require('./out_of_order_chapters');
const {missing_verses} = require('./missing_verses');
const {duplicate_verses} = require('./duplicate_verses');
const {out_of_order_verses} = require('./out_of_order_verses');

module.exports = {
    missing_chapters,
    duplicate_chapters,
    out_of_order_chapters,
    missing_verses,
    duplicate_verses,
    out_of_order_verses,
};
