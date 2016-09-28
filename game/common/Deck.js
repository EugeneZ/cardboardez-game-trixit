const _ = require('lodash');

module.exports = {
    create(length) {
        return _.shuffle(_.times(length, Number));
    }
};