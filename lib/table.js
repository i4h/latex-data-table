var extend      = require("extend");
var debug       = require('debug')('latex-data-table');


/*  === Stateless ''private'' methods  === */

var renderRow = function(row) {
    var cells = [];
    var rowString = "";
    if (isArray(row)) {
        /* Simple array */
        for (var i = 0; i < row.length; i++) {
            var cell = row[i];
            cells.push(module.exports.renderCell(cell))
        }
        rowString = cells.join("& ") + "\\";

    } else {
        /* Object, with cells and options */

        for (var i = 0; i < row.cells.length; i++) {
            var cell = row.cells[i];
            cells.push(module.exports.renderCell(cell))
        }
    }
};

var buildHeaderFromCellContents = function(cellContents, options) {
    switch (options.style) {
        case "booktabs":
            var headerRows = [];
            if (typeof options.comment !== "undefined")
                headerRows.push("% " + options.comment);

            headerRows.push(cellContents.join(" \t & ") + ' \\\\');
            headerRows.push("\\midrule");
            return headerRows.join("\n");

        case "default":
        default:
            var headerRows = [];
            if (typeof options.comment !== "undefined")
                headerRows.push("% " + options.comment);

            headerRows.push(cellContents.join(" \t & ") + ' \\\\ \\hline \\hline');

            return headerRows.join("\n");
    }
};

var formatNumber = function(content, numberFormat) {
    if (typeof numberFormat === "undefined")
        return content;
    else if (typeof numberFormat === "function")
        return numberFormat(content);
    else {
        var formattedNumber;
        if (typeof numberFormat.decimals !== "undefined") {
            formattedNumber = content.toFixed(numberFormat.decimals);
        } else if (typeof numberFormat.precision !== "undefined") {
            formattedNumber = content.toFixed(numberFormat.decimals);
            return content.toPrecision(numberFormat.precision);
        } else {
            throw new Error("Unable to format according to given numberFormat: \n " + JSON.stringify(numberFormat));
        }
         return "$" + formattedNumber + "$";

    }
};

var formatCellContent = function(content, colOptions) {
    var myContent = content;

    if (!isNaN(+content))
        myContent = +content;

    if (typeof myContent === "number") {
        var scaledNumber = myContent;
        if (typeof colOptions !== "undefined") {
            if (typeof colOptions.decimalScaling !== "undefined")
                scaledNumber = scaledNumber / Math.pow(10,colOptions.decimalScaling);

            return formatNumber(scaledNumber, colOptions.formatter)
        }
    } else
        return myContent;
};

var formatHeaderCellContent = function(content, colOptions) {
    var cellContent = content;
    var inBracketsParts = [];
    if (typeof colOptions !== "undefined") {
        if (typeof colOptions.decimalScaling !== "undefined" && colOptions.decimalScaling >= 1)
            inBracketsParts.push('$10' + (colOptions.decimalScaling >= 2 ? '^' + colOptions.decimalScaling : "") + "$");
        if (typeof colOptions.units !== "undefined")
            inBracketsParts.push(colOptions.units);
    }
    if (inBracketsParts.length !== 0)
        return content + " [" + inBracketsParts.join(" ") + "]";

    return content;
};


var buildHeaderRow = function(table) {
    var rowPrefix = "";
    var rowSuffix = "";
    var cellContents = [];
    var options = {style: table.options.style};

    /* Handle header options */
    if (typeof table.headerOptions.comment !== "undefined")
        options.comment = table.headerOptions.comment;

    for (var i = 0; i < table.headerCells.length; i++) {
        var cell = table.headerCells[i];
        if (typeof cell === "number" || typeof cell === "string") {
            table.addColumn();
            cellContents.push(formatHeaderCellContent(cell));
        } else {
            /* Handle options given in header cell object */
            if (typeof cell.spec !== "undefined")
                table.addColumn(cell.spec);
            else
                table.addColumn();

            var colOptionNames = ["decimalScaling", "units" ,"formatter"];
            for (var j = 0; j < colOptionNames.length; j++) {
                var name = colOptionNames[j];
                if (typeof cell[name] !== "undefined") {
                    if (typeof table.colOptions[i] === "undefined")
                        table.colOptions[i] = {};
                    table.colOptions[i][name] = cell[name];
                }
            }

            /* ---- handle more options ... */
            cellContents.push(formatHeaderCellContent(cell.content, table.colOptions[i]));
        }
    }

    table.header = buildHeaderFromCellContents(cellContents, options);
};

var buildBodyRow = function(row, table) {
    var rowPrefix = "";
    var rowSuffix = "";
    var cells = row;
    var rowOptions = null;
    var cellContents = [];
    var rowComment = null;


    if (!Array.isArray(row)) {
        cells = row.cells;
        rowOptions = row;
    }

    if (table.nCols === null) {
        table.nCols = cells.length;
    }

    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (typeof cell === "number" || typeof cell === "string") {
            cellContents.push(formatCellContent(cell, table.colOptions[i]));
        } else {
            /* Handle options given in cell object */
            if (typeof cell.optionName !== "undefined" ) {
                // Do something with option;
            }
            cellContents.push(formatCellContent(cell.content, table.colOptions[i]));
        }
    }

    var result = "";
    switch (table.options.style) {
        case "booktabs":
            result = rowPrefix + cellContents.join(" \t & ") + rowSuffix + " \\\\";
            break;
        case "default":
        default:
            result = rowPrefix + cellContents.join(" \t & ") + rowSuffix + " \\\\ \\hline";
            break;
    }

    if (rowOptions !== null && typeof rowOptions.comment !== "undefined") {
        result += " \t %" + rowOptions.comment;
    }

    return result;
};

var buildBodyFromBodyRows = function(table) {
    switch (table.options.style) {
        case "booktabs":
        case "default":
            table.body = table.bodyRows.join("\n");
            break;
        default:
            throw new Error("Unknown style " + options.style);
    }
    return;
};


/* ==== Table object with ''public'' properties and functions */

module.exports = Table;
function Table() {
    this.options = {
        center: true,
        style: "booktabs",
        numberFormat: "none",
        caption: "",
        label: "",

    };

    this.head = "";
    this.foot = "";
    this.body = "";
    this.header = "";
    this.cols = [];
    this.colOptions = [];
    this.headerCells= [];
    this.headerOptions = "";
    this.bodyRows = [];
    this.defaultColSpec = "c";
    this.nCols = null;
}


Table.prototype.setOptions = function(options) {
    extend(this.options, options);
};

Table.prototype.addColumn = function(spec) {
    if (typeof spec === "undefined")
        this.cols.push(this.defaultColSpec);
    else
        this.cols.push(spec);
};

Table.prototype.finalize = function() {
    /* If colspec was not set in header, set it now */
    if (this.cols.length === 0 ) {
        for (var i = 0; i < this.nCols; i++) {
            this.addColumn();
        }
    }
};

Table.prototype.buildHead = function() {
    switch (this.options.style) {
        case "booktabs":
            this.head = "\\toprule";
            return;
        default:
            return;
    }
};

Table.prototype.buildFoot = function() {
    switch (this.options.style) {
        case "booktabs":
            this.foot = "\\bottomrule";
            return;
        default:
            this.foot = " \\hline";
            return;
    }
};

Table.prototype.buildBody = function(rows, options) {
    var table = this;
    /* Set bodyRows on the table */
    if (typeof rows !== "undefined" && rows !== null) {
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            table.bodyRows.push(buildBodyRow(row, table));
        }
    }
    buildBodyFromBodyRows(table);
    return;
};

Table.prototype.buildHeader = function(header, options) {

    var table = this;
    if (typeof  header === "undefined" || header === null) {
        return;
    }

    if (Array.isArray(header))
        table.headerCells = header;
    else {
        table.headerCells = header.cells;
        table.headerOptions = header;
    }
    this.nCols = table.headerCells.length;
    buildHeaderRow(table);
    return;
};

Table.prototype.getColSpec = function() {
    return this.cols.join("");
};

Table.prototype.getTable = function() {


    var rows = [];
    rows.push("\\begin{table}");

    if (this.options.center === true)
        rows.push("\\centering");

    if (this.options.label !== "")
        rows.push("\\label{" + this.options.label + "}");

    rows.push("\\begin{tabular}{" + this.getColSpec() + "}");

    if (this.head.trim())
        rows.push(this.head);

    if (this.header.trim())
        rows.push(this.header);

    if (this.body.trim())
        rows.push(this.body);

    if (this.foot.trim())
        rows.push(this.foot);

    rows.push("\\end{tabular}");
    if (this.options.caption !== "")
        rows.push("\\caption{" + this.options.caption + "}");
    rows.push("\\end{table}");

    return rows.join("\n");
};




