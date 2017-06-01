var extend      = require("extend");
var debug       = require('debug')('latex-data-table');
var os       = require('os');

var clui = require('clui');
var Line = clui.Line;


/*  === Stateless ''private'' methods  === */
//@todo: remove renderRow, retest
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

/** Create the string that will represent the table header from the
 *    cellContents and the options
 *    This is where different table-styles are handled for the header
 * @param cellContents
 * @param options
 * @returns {string}
 */
var buildHeaderFromCellContents = function(cellContents, options, colOptions) {
    switch (options.style) {
        case "booktabs":
            var headerRows = [];
            if (typeof options.comment !== "undefined")
                headerRows.push("% " + options.comment);

            headerRows.push(cellContents.join(" \t & ") + ' \\\\');
            headerRows.push("\\midrule");
            return headerRows.join(os.EOL);
        case "ascii":
            var line = new Line().padding(2);
            var totalWidth = 0;
            for (var i = 0; i < cellContents.length; i++) {
                var cellContent = cellContents[i];
                var cellColOptions = (typeof colOptions[i] === "undefined" ? {} : colOptions[i]);
                var colWidth = options.defaultColWidth;
                if (typeof cellColOptions.colWidth !== "undefined")
                    colWidth = cellColOptions.colWidth;
                else
                    cellColOptions.colWidth = colWidth;
                totalWidth += colWidth;
                line.column(cellContent, colWidth);
            }
            var resultLines = [];
            resultLines.push(line.fill().contents());
            resultLines.push(new Line().padding(2).column(Array(totalWidth + 1).join("-")).contents());

            return resultLines.join(os.EOL);


        case "csv":
            var line = [];
            for (var i = 0; i < cellContents.length; i++)
                line.push(cellContents[i]);

            return line.join(options.csvSeparator);
            break;

        case "default":
        default:
            var headerRows = [];
            if (typeof options.comment !== "undefined")
                headerRows.push("% " + options.comment);

            headerRows.push(cellContents.join(" \t & ") + ' \\\\ \\hline \\hline');

            return headerRows.join(os.EOL);
    }
};

/** Format a number for a body cell
 *
 * @param content
 * @param numberFormat
 * @returns {*}
 */
var formatNumber = function(content, numberFormat, options) {
    var noMath = false;
    if (typeof options !== "undefined" && options.noMath === true)
        noMath = true;

    if (typeof numberFormat === "undefined" || numberFormat === null)
        return content.toString();
    else if (typeof numberFormat === "function")
        return numberFormat(content);
    else {
        var formattedNumber;
        if (typeof numberFormat.decimals !== "undefined") {
            formattedNumber = content.toFixed(numberFormat.decimals);
        } else if (typeof numberFormat.precision !== "undefined") {
            formattedNumber = content.toPrecision(numberFormat.precision);
            if (!noMath && options.prettyScientifics !== false) {
                formattedNumber = formattedNumber.replace(/e\+([0-9]*)/, "\\cdot 10^{$1}");
                formattedNumber = formattedNumber.replace(/e-([0-9]*)/, "\\cdot 10^{-$1}");
            }
        } else {
            throw new Error("Unable to format according to given numberFormat: " + os.EOL + JSON.stringify(numberFormat));
        }
        if (!noMath)
            return "$" + formattedNumber + "$";

        return formattedNumber;
    }
};

var formatCellContent = function(content, options, colOptions, options) {

    if (options.style === "csv" && !options.formatCSVcells)
        return content;

    var myContent = content;

    if (!isNaN(+content))
        myContent = +content;

    if (typeof myContent === "number") {
        var scaledNumber = myContent;
        if (typeof colOptions !== "undefined") {
            if (typeof colOptions.decimalScaling !== "undefined")
                scaledNumber = scaledNumber / Math.pow(10,colOptions.decimalScaling);
            return formatNumber(scaledNumber, colOptions.formatter, options)
        } else {
            return formatNumber(scaledNumber, null, options)
	}
    } else 
        return myContent;
};


/** Format a headercell respecting options of the corresonding columns
 *  - Add a bracketed prefix  showing unit and decimal scaling e.g. "[1e2 m]"
 *
  * @param content
 * @param headerOptions
 * @param colOptions
 * @returns {*}
 */
var formatHeaderCellContent = function(content, options, headerOptions, colOptions) {

    debug("formatting " + content);

    if (options.style === "csv" && !options.formatCSVheader)
        return content;

    var inBracketsParts = [];
    var mathChar = "$";
    if (typeof headerOptions !== "undefined" && headerOptions.noMath === true)
        mathChar = "";

    if (typeof colOptions !== "undefined") {
        if (typeof colOptions.decimalScaling !== "undefined" && colOptions.decimalScaling != 0)
            inBracketsParts.push(mathChar + '10' + (colOptions.decimalScaling != 1 ? '^{' + colOptions.decimalScaling + "}" : "") + mathChar);
        if (typeof colOptions.units !== "undefined")
            inBracketsParts.push(colOptions.units);
    }
    if (inBracketsParts.length !== 0)
        return content + " [" + inBracketsParts.join(" ") + "]";

    return content;
};

 /** Names of column options that should be copied into the tables colOptions Array
  * which will then be used by the buildHeaderFromCellContents method */
var colOptionNames = ["decimalScaling", "units" ,"formatter", "colWidth", "lineWrap", "wordSep"];

/** Build the header row of the table
 * Requires table.headerCells to be set
 *
 * This method splits the headerCells into contents and options
 * and saves/handles the options appropriately.
 * Formatting the cell contents and joining the contents into a string
 * is then delegated to formatHeaderCellContent() and
 * buildHeaderFromCellContents respectively
 * style-dependt code should only appear in builHeaderFromCellContents
 *
 * @param table
 */
var buildHeaderRow = function(table) {
    var rowPrefix = "";
    var rowSuffix = "";
    var cellContents = [];
    /* Prepare options for call to buildHeaderFromCellContents */
    var buildOptions = {
        style: table.options.style,
        defaultColWidth: table.options.defaultColWidth
    };
    if (typeof table.headerOptions.comment !== "undefined")
        buildOptions.comment = table.headerOptions.comment;
    buildOptions.caption = table.options.caption;

    for (var i = 0; i < table.headerCells.length; i++) {
        var cell = table.headerCells[i];
        if (typeof cell === "number" || typeof cell === "string") {
            table.addColumn();
            cellContents.push(formatHeaderCellContent(cell, table.options));
        } else {
            /* Handle options given in header cell object */
            if (typeof cell.spec !== "undefined")
                table.addColumn(cell.spec);
            else
                table.addColumn();
            /* ---- handle more options here ... */

            /* Copy options that should be handled by buildHeaderFromCellContents to colOptions */
            for (var j = 0; j < colOptionNames.length; j++) {
                var name = colOptionNames[j];
                if (typeof cell[name] !== "undefined") {
                    if (typeof table.colOptions[i] === "undefined")
                        table.colOptions[i] = {};
                    table.colOptions[i][name] = cell[name];
                }
            }

            cellContents.push(formatHeaderCellContent(cell.content, table.options, table.headerOptions, table.colOptions[i]));
        }
    }

    table.header = buildHeaderFromCellContents(cellContents, buildOptions, table.colOptions);
};

/** Split a string into parts that are at most width characters long */
var wrap = function(content, width, wordsep = " ") {
    var result = [];
    var parts = content.split(wordsep);
    var curPart = "";
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (curPart === "")
            curPart = part;
        else {
            if (curPart.length + part.length > width) {
                result.push(curPart + wordsep);
                curPart = part;
            } else {
                curPart += wordsep + part;
            }
        }
    }
    result.push(curPart);
    return result;
};

var applyLineWrap = function(cellContents, colOptions, options) {
    /* Only for ascii table */

    var result = [cellContents];
    if (options.style !== "ascii")
        return result;

    var noWrap = true;
    for (var c = 0; c < cellContents.length; c++) {
        var content = cellContents[c];
        var thisColOptions = colOptions[c];
        if (typeof thisColOptions !== "undefined" && thisColOptions.lineWrap === true) {
            noWrap = false;
            if (content.length >= thisColOptions.colWidth) {
                var sep = thisColOptions.wordSep || " ";
                var wrappedRows = wrap(content, thisColOptions.colWidth, sep);
                cellContents[c] = wrappedRows[0];
                for (var i = 1; i < wrappedRows.length; i++) {
                    var contentPart = wrappedRows[i];
                    var wrapRow  = [];
                    for (var j = 0; j < c; j++) {
                        wrapRow.push("");
                    }
                    wrapRow.push(wrappedRows[i]);
                    result.push(wrapRow);
                }
            }
        }
    }
    return result;
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

    /* Create an array with only the cell contents and handle options set on the cells */
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (typeof cell === "number" || typeof cell === "string") {
            cellContents.push(formatCellContent(cell, table.options,table.colOptions[i], table.options));
        } else {
            /* Handle options given in cell object */
            if (typeof cell.optionName !== "undefined" ) {
                // Do something with option;
            }
            cellContents.push(formatCellContent(cell.content, table.options, table.colOptions[i], table.options));
        }
    }

    /* makes cellContents a matrix since we might need multiple lines
    * for non-ascii tables this makes no different since rowContents will always
     * have a length of 1 */
    var rowContents = applyLineWrap(cellContents, table.colOptions, table.options);

    var rows = [];
    for (var r = 0; r < rowContents.length; r++) {
        var cellContents = rowContents[r];

        /* Join the the cell contents according to the table style */
        var row = "";
        switch (table.options.style) {
            case "booktabs":
                row = rowPrefix + cellContents.join(" \t & ") + rowSuffix + " \\\\";
                break;
            case "ascii":
                var line = new Line().padding(2);
                for (var i = 0; i < cellContents.length; i++) {
                    var cellContent = cellContents[i];
                    var cellColOptions = (typeof table.colOptions[i] === "undefined" ? {} : table.colOptions[i]);
                    var colWidth = table.options.defaultColWidth;
                    if (typeof cellColOptions.colWidth !== "undefined")
                        colWidth = cellColOptions.colWidth;
                    line.column(cellContent, colWidth);
                }
                row = line.fill().contents();
                break;

            case "csv":
                var line = [];
                for (var i = 0; i < cellContents.length; i++)
                    line.push(cellContents[i]);

                return line.join(table.options.csvSeparator);
                break;

            case "default":
            default:
                row = rowPrefix + cellContents.join(" \t & ") + rowSuffix + " \\\\ \\hline";
                break;
        }

        /* Add the row comment */
        if (rowOptions !== null && typeof rowOptions.comment !== "undefined") {
            switch (table.options.style) {
                case "ascii":
                    row += " #" + rowOptions.comment;
                    break;
                default:
                    row += " \t %" + rowOptions.comment;
            }

        }
        rows.push(row);
    }

    return rows.join(os.EOL);
};

var buildBodyFromBodyRows = function(table) {
    switch (table.options.style) {
        case "booktabs":
        case "default":
            table.body = table.bodyRows.join(os.EOL);
            break;
        case "ascii":
        case "csv":
            table.body = table.bodyRows.join(os.EOL);
            break;

        default:
            throw new Error("Unknown style " + table.options.style);
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
        defaultColWidth: 35, /* Only ascii tables */
        prettyScientifics: true,
        csvSeparator: ",",
        formatCSVheader: false,
        formatCSVcells: false,
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
    this.totalColWidth = null;
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
        case "ascii":
            if (this.options.caption.trim())
                this.foot = os.EOL + "---- " + this.options.caption + " -----";
            return;
        case "csv":
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

    if (table.options.style === "ascii") {
        if (typeof table.headerOptions.noMath === "undefined")
            table.headerOptions.noMath = true;
        if (typeof table.options.noMath === "undefined")
            table.options.noMath = true;
    }
    buildHeaderRow(table);
    return;
};

Table.prototype.getColSpec = function() {
    return this.cols.join("");
};

Table.prototype.getTable = function() {

    var rows = [];

    if (this.options.style !== "ascii" && this.options.style !== "csv" ) {

        if (this.options.noFloat)
            rows.push("\\begin{minipage}{\\textwidth}");
        else
            rows.push("\\begin{table}");


        if (this.options.center === true)
            rows.push("\\centering");


        rows.push("\\begin{tabular}{" + this.getColSpec() + "}");

    }
    if (this.head.trim())
        rows.push(this.head);

    if (this.header.trim())
        rows.push(this.header);

    if (this.body.trim())
        rows.push(this.body);

    if (this.foot.trim())
        rows.push(this.foot);

    if (this.options.style !== "ascii" && this.options.style !== "csv" ) {
        rows.push("\\end{tabular}");
        if (this.options.caption !== "") {
            let escapedCaption = this.options.caption.replace(/([^\\])_/g, "$1\\_");

            if (this.options.noFloat)
                rows.push("\\captionof{table}{" + escapedCaption + "}");
            else
                rows.push("\\caption{" + escapedCaption + "}");
        }

        if (this.options.label !== "")
            rows.push("\\label{" + this.options.label + "}");

        if (this.options.noFloat)
            rows.push("\\end{minipage}");
        else
            rows.push("\\end{table}");
    }

    return rows.join(os.EOL);
};




