var debug       = require('debug')('latex-data-table');
var extend      = require("extend");


var Table = require("./table")



module.exports = function(lines, header, options) {

    var table = new Table;
    table.setOptions(options);

    table.buildHead(header);
    table.buildHeader(header);
    table.buildBody(lines);
    table.buildFoot(header);

    table.finalize();

    return table.getTable();
};
