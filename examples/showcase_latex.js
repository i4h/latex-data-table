var latexTable = require('../lib/index');

var caption = "Comparison of text-editors";
var label = "tab:awesome";

var options = {
    style: "ascii",
    label: "tab:awesomeness",
    caption: caption,
};


var header = {
    comment: "header comment" ,
    cells:
        [
            {
                content: 'Name',
                spec: "l"},
            {
                content: 'Power',
                spec: "r",
                decimalScaling: "1",
                units: "Gazillions",
                formatter: {decimals: 0}
            },
            {
                content: 'Loading time',
                spec: "r",
                decimalScaling: "-1",
                units: "Seconds",
                formatter: {precision: 2}
            },
        ]
};

var body = [
    {
        comment: "first line comment",
        cells: ['vim', '15', 0.2]
    },
    {
        comment: "second line comment",
        cells: ['emacs', '10000', 1234]
    },
];


var styles = ['booktabs', 'default'];

var document = [
    "\\documentclass[preview]{standalone}",
    "\\pagestyle{empty}",
    "\\usepackage{booktabs}",
    "\\begin{document}",
    "\\vspace{2em}"

];

for (var i = 0; i < styles.length; i++) {
    /* Prepare options for this style */
    options.style = styles[i];
    options.caption = caption + " (" + styles[i] + " style)";
    options.label = label + "_" + styles[i];

    /* Generate latex code */
    var result = latexTable(body, header, options);

    document.push(result);
    document.push("\n");

}
document.push("\\vspace{2em}");
document.push("\\end{document}");



console.log(document.join("\n"));
