// server.js

const express = require('express');
const app = express();
const path = require('path');
const d3 = require('d3');
var myParser = require("body-parser");

var ans = [];
function section1(callback){

    const csv = require('csv-parser');
    const fs = require('fs');
    var values = [];
    var read = fs.createReadStream('./jobentry_export_2019-8-23T9_59.csv')
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
        values.push(parseInt(row.pageviews_all));
    })
        .on('end', () => {
        console.log('CSV file successfully processed');

        // get mean
        let count = values.length;
        let suma = values.reduce((previous, current) => current += previous);
        let mean = suma / count;
        ans.push(mean);


        // get median
        values.sort((a, b) => a - b);
        let lowMiddle = Math.floor((values.length - 1) / 2);
        let highMiddle = Math.ceil((values.length - 1) / 2);
        let median = (values[lowMiddle] + values[highMiddle]) / 2;
        ans.push(median); // saving the result
    });
}

var datapoints = [];

function section2(){

    const csv = require('csv-parser');
    const fs = require('fs');
    var values = [];
    var read = fs.createReadStream('./jobentry_export_2019-8-23T9_59.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
        datapoints.push({
            "date_created": row.date_created,
            "pageviews_all": row.pageviews_all,
            "applyclicks_all": row.applyclicks_all,
        });
    })
    .on('end', () => {
        console.log('Section2: CSV file successfully processed');
    });
}



section1();
section2();

// example usage

app.use(myParser.urlencoded({extended : true}));
app.post("/section1", function(req, res) {
    res.send(ans);
    });

app.post("/section2", function(req, res) {
    if (datapoints.length > 0){
        var pageViews = [];
        datapoints.reduce(function(res, value) {
            if (!res[value.date_created]) {
                res[value.date_created] = [ value.date_created, 0];
                pageViews.push(res[value.date_created])
            }
            res[value.date_created][1] += parseInt(value.pageviews_all);
            return res;
        }, {});

        var pageClicks = [];
        datapoints.reduce(function(res, value) {
            if (!res[value.date_created]) {
                res[value.date_created] = [ value.date_created, 0];;
                pageClicks.push(res[value.date_created])
            }
            res[value.date_created][1] += parseInt(value.applyclicks_all);
            return res;
        }, {});

    }
    res.send([pageViews,pageClicks]);
});

// Set the app to point to an "index" html file
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));

});

// Locally the app can be found in the port defined by the environment or the localhost:4000
app.listen(process.env.PORT || 4000, function(){
    console.log('Node js server is running');
});
