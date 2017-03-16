var latexTable = require('../lib/index');

var caption = "Comparison of text-editors";
var label = "tab:awesome";

var options = {
    style: "ascii",
    label: "tab:awesomeness",
    caption: caption,
    label: label
};


var header = {
    comment: "header comment" ,
    cells:
        [
            {
                content: 'Name',
                colWidth: 10,
                spec: "l"},
            {
                content: 'Power',

                spec: "r",
                decimalScaling: "1",
                units: "Gazillions",
                formatter: {decimals: 0},
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


var styles = ['ascii'];
var document = [];

for (var i = 0; i < styles.length; i++) {
    options.style = styles[i];
    options.caption = caption + " (" + styles[i] + " style)";
    options.label = label + "_" + styles[i];

    var result = latexTable(body, header, options);


    document.push(result);

    document.push("\n");

}

console.log(document.join("\n"));
