
/**
 * Created by bzfvierh on 31.12.16.
 */

const chai = require('chai');
const assertArrays = require('chai-arrays');
chai.use(assertArrays);
var expect  = require("chai").expect;
var debug       = require('debug')('latex-data-table');
var sinon = require('sinon');
var sinonTest = require('sinon-test');
var fs = require('fs-extra');
var fs = require('fs-extra');


var latexTable = require('../lib/index');

/* Set this to true to rewrite all the expected latex output */
var reWriteExpected = false;

sinon.test = sinonTest.configureTest(sinon);

describe("Test main call on a ", function() {
    var simpleHeader = ['a', 'b', 'c'];
    var headerSpec = [{content: 'a', spec: "l"}, 'b', {content:'c', spec: "|r|"}];

    var commentedHeader= {comment: "header comment" , cells: [{content: 'a', spec: "l"}, 'b', {content:'c', spec: "|r|"}]};

    var simpleBody = [
            ['alpha', 'beta', '1.0'],
            ['gamma', 'delta', '10000'],
        ];

    var commentedBody = [
            {comment: "first line comment", cells: ['alpha', 'beta', '1.0']},
            {comment: "second line comment", cells: ['gamma', 'delta', '10000']},
    ];


    describe("header-only ", function() {
        it("default style table", sinon.test(function(done) {
            var latex = latexTable(null, simpleHeader, {style: "default"});
            var file = __dirname + "/latex/header_only_default.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});

            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("booktabys style table", sinon.test(function(done) {
            var latex = latexTable(null, simpleHeader, {style: "booktabs"});
            var file = __dirname + "/latex/header_only_booktab.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});

            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("booktabs table with linespec ", sinon.test(function(done) {
            var latex = latexTable(null, headerSpec, {style: "booktabs"});
            var file = __dirname + "/latex/header_only_booktab_linespec.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});

            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("csv table ", sinon.test(function(done) {
            var latex = latexTable(null, headerSpec, {style: "csv"});
            var file = __dirname + "/latex/header_only_csv.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});

            var expectedLatex = fs.readFileSync(file, "utf8");
            debug(latex);
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));
    });

    describe("body-only ", function() {
        it("default style table", sinon.test(function(done) {
            var latex = latexTable(simpleBody, null, {style: "default"});
            console.log(latex);
            var file = __dirname + "/latex/body_only_default.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("booktabs style table", sinon.test(function(done) {
            var latex = latexTable(simpleBody, null, {style: "booktabs"});
            var file = __dirname + "/latex/body_only_booktab.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("csv style table", sinon.test(function(done) {
            var csv = latexTable(simpleBody, null, {style: "csv"});
            console.log(csv);
            var file = __dirname + "/latex/body_only_csv.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, csv, {encoding: "utf8"});
            var expected = fs.readFileSync(file, "utf8");
            expect(csv).to.be.equal(expected);
            done();
        }));

    });

    describe("simple ", function() {
        it("default style table", sinon.test(function(done) {

            var latex = latexTable(simpleBody, simpleHeader, {style: "default"});
            var file = __dirname + "/latex/simple_default.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("booktabs style table", sinon.test(function(done) {
            var latex = latexTable(simpleBody, simpleHeader, {style: "booktabs"});
            var file = __dirname + "/latex/simple_booktab.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("csv style table", sinon.test(function(done) {
            var csv = latexTable(simpleBody, simpleHeader, {style: "csv"});
            var file = __dirname + "/latex/simple_csv.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, csv, {encoding: "utf8"});
            var expected = fs.readFileSync(file, "utf8");
            debug(csv);
            expect(csv).to.be.equal(expected);
            done();
        }));

    });

    describe("simple table with comments", function() {
        it("default style table", sinon.test(function(done) {
            var latex = latexTable(commentedBody, commentedHeader, {style: "default"});
            var file = __dirname + "/latex/simple_commented_default.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("booktabs style table", sinon.test(function(done) {
            var latex = latexTable(commentedBody, commentedHeader, {style: "booktabs"});
            var file = __dirname + "/latex/simple_commented_booktab.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("csv style table", sinon.test(function(done) {
            var csv = latexTable(commentedBody, commentedHeader, {style: "csv"});
            var file = __dirname + "/latex/simple_commented_csv.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, csv, {encoding: "utf8"});
            var expected = fs.readFileSync(file, "utf8");
            expect(csv).to.be.equal(expected);
            debug(csv);
            done();
        }));

    });

    describe("ascii table ", function() {
        it("with text wrapping", sinon.test(function(done) {
            var header= {cells: [{content: 'a', colWidth: 10},{content:'b', colWidth: 12, lineWrap: true}]};

            var body = [
                ['short', 'long but fortunately wrappable text'],
                ['short', 'unwrapped'],
            ];

            var ascii = latexTable(body, header, {style: "ascii"});
            console.log(ascii);
            var file = __dirname + "/latex/ascii_wrapping.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, ascii, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(ascii).to.be.equal(expectedLatex);
            done();
        }));
    });




    describe("showcase data table  ", function() {
        it("with booktabs style", sinon.test(function(done) {

            var options = {
                style: "booktabs",
                label: "tab:awesomeness",
                caption: "Comparison of text-editor awesomeness",
            };

            var header = {
                comment: "header comment" ,
                cells:
                    [
                        {
                            content: 'Name',
                            spec: "l"},
                        {
                            content: 'awesomeness',
                            spec: "l",
                            decimalScaling: "1",
                            units: "Gazillions",
                            formatter: {decimals: 2}
                        },
                        {
                            content: 'awesomeness2',
                            spec: "l",
                            decimalScaling: "2",
                            units: "Gazillions",
                            formatter: {precision: 3}
                        },
                    ]
            };

            var body = [
                {
                    comment: "first line comment",
                    cells: ['vim', '300', 300]
                },
                {
                    comment: "second line comment",
                    cells: ['emacs', '10000', 10000]
                },
            ];

            var latex = latexTable(body, header, options);
            console.log(latex);
            var file = __dirname + "/latex/showcase.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, latex, {encoding: "utf8"});
            var expectedLatex = fs.readFileSync(file, "utf8");
            expect(latex).to.be.equal(expectedLatex);
            done();
        }));

        it("with ascii style", sinon.test(function(done) {

            var options = {
                style: "ascii",
                label: "tab:awesomeness",
                caption: "Comparison of text-editor awesomeness",
            };

            var header = {
                comment: "header comment" ,
                cells:
                    [
                        {
                            content: 'a',
                            spec: "l",
                            colWidth: 8,
                        },

                        {
                            content: 'awesomeness',
                            spec: "l",
                            decimalScaling: "1",
                            units: "Gazillions",
                            formatter: {decimals: 2},
                        },
                        {
                            content: 'awesomeness2',
                            spec: "l",
                            decimalScaling: "2",
                            units: "Gazillions",
                            formatter: {precision: 3}
                        },
                    ]
            };

            var body = [
                {
                    comment: "first line comment",
                    cells: ['vim', '300', 300]
                },
                {
                    comment: "second line comment",
                    cells: ['emacs', '10000', 10000]
                },
            ];

            var ascii = latexTable(body, header, options);
            var file = __dirname + "/latex/showcase_ascii.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, ascii, {encoding: "utf8"});
            console.log(ascii);
            var expectedAscii = fs.readFileSync(file, "utf8");
            expect(ascii).to.be.equal(expectedAscii);
            done();
        }));

        it("with csv style", sinon.test(function(done) {

            var options = {
                style: "csv",
                label: "tab:awesomeness",
                caption: "Comparison of text-editor awesomeness",
            };

            var header = {
                comment: "header comment" ,
                cells:
                    [
                        {
                            content: 'a',
                            spec: "l",
                            colWidth: 8,
                        },

                        {
                            content: 'awesomeness',
                            spec: "l",
                            decimalScaling: "1",
                            units: "Gazillions",
                            formatter: {decimals: 2},
                        },
                        {
                            content: 'awesomeness2',
                            spec: "l",
                            decimalScaling: "2",
                            units: "Gazillions",
                            formatter: {precision: 3}
                        },
                    ]
            };

            var body = [
                {
                    comment: "first line comment",
                    cells: ['vim', '300', 300]
                },
                {
                    comment: "second line comment",
                    cells: ['emacs', '10000', 10000]
                },
            ];

            var csv = latexTable(body, header, options);
            var file = __dirname + "/latex/showcase_csv.tex";
            if (reWriteExpected)
                fs.writeFileSync(file, csv, {encoding: "utf8"});
            console.log(csv);
            var expected = fs.readFileSync(file, "utf8");
            expect(csv).to.be.equal(expected);
            done();
        }));
    });

});
