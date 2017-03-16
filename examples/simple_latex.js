var latexTable = require('../lib/index');

var header = ["Column1", "Column2"];
var body = [[1,"a"],[2,"b"]];
/* Generate latex code */
var latex = latexTable(body, header);


var document = [
    "\\documentclass[preview]{standalone}",
    "\\pagestyle{empty}",
    "\\usepackage{booktabs}",
    "\\begin{document}",
    "\\vspace{2em}",
];
document.push(latex);
document.push("\\end{document}");


console.log(document.join("\n"));
