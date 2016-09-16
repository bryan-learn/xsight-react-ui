var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var pond = require('pondjs');
var i2p = require('./influx2pond.js');
var logger = require('./logger.js');
var app = express();

var CONTENT_FILE = path.join(__dirname, 'res.json');
var GRAPH_FILE = path.join(__dirname, 'graph.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '../build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest content.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});


/* Define API endpoints */

// GET content file
app.get('/api/content', function(req, res) {
    // Read the content file then send it as response.
    fs.readFile(CONTENT_FILE, function(err, data) {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

// GET <metric> by <flodID>
app.get('/api/queryByFlow/:metric/:flowID', function(req, res) {
    // TODO read influx host and api endpoints from config
    var host = "https://hotel.psc.edu:8086";
    var queryStr = encodeURIComponent("select value from "+req.params.metric+" where flow='"+req.params.flowID+"'");
    var url = host+"/query?db=xsight&q="+queryStr;
    request.get(url, function(error, response, body){
        if(error){ // url request err chking
            logger.error(error);
            res.send("failed");
        }
        else{
            var j = JSON.parse(body);
            j = i2p.influx2pond(j); // err chk & convert to pond obj
            res.json(j);
        }
    }).auth('dbuser', 'TcitoPsb', true);
});

// GET traffic graph data
// :tags is a space-delimited list of influx tag values: (netname, domain, dtn); The database is assumed to be Xsight.
app.get('/api/xsight/traffic-graph/:tags', function(req, res) {
    // Process params
    var timeInterval = "365d"; /*req.params.timeInt;*/
    var tags = req.params.tags.toString().split(" ");
    
    // Build where and group by clauses (dependent on the provided tags)
    var tagClause = "";
    var groupClause = "";
    var tagCnt = tags.length;
    switch(tagCnt){
        case 0: // DB
            tagClause = ""; // no tag values
            groupClause = "group by netname";
            break;
        case 1: //DB, netname
            tagClause = " and netname='"+tags[0]+"' ";
            groupClause = "group by domain";
            break;
        case 2: //DB, netname, domain
            tagClause = " and netname='"+tags[0]+"' and domain='"+tags[1]+"' ";
            groupClause = "group by dtn";
            break;
        case 3: //DB, netname, domain, dtn
            tagClause = " and netname='"+tags[0]+"' and domain='"+tags[1]+"' and dtn='"+tags[2]+"' ";
            groupClause = "group by flow";
            break;
        default:
            tagClause = "";
            groupClause = "";
    }

    // TODO read influx host and api endpoints from config
    var host = "https://hotel.psc.edu:8086";
    var queryStr = encodeURIComponent("select count(value) from StartTime where time > now() - "+timeInterval+tagClause+groupClause);

    //res.send(queryStr);

    var url = host+"/query?db=xsight&q="+queryStr;
    request.get(url, function(error, response, body){
        if(error){ // url request err chking
            logger.error(error);
            res.send("failed");
        }
        else{
            var j = JSON.parse(body);
            j = i2p.influx2pond(j); // err chk & convert to pond obj
            res.json(j);
        }
    }).auth('dbuser', 'TcitoPsb', true);
});

// GET graph file
app.get('/api/xsight/graph/', function(req, res) {
    // Read the content file then send it as response.
    fs.readFile(GRAPH_FILE, function(err, data) {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

// GET abstract graph data
    // TEMP disabled this endpoint
/*
app.get('/api/xsight/abstract-graph/', function(req, res) {
    // TODO read influx host and api endpoints from config
    var host = "https://hotel.psc.edu:8086";
    var queryStr = encodeURIComponent("show tag values with key=\"netname\"; show tag values with key=\"domain\"; show tag values with key=\"dtn\"");
    var url = host+"/query?db=xsight&q="+queryStr;

    var jRes;
    
    //get all the tags
    request.get(url, function(error, response, body){
        if(error){ // url request err chking
            logger.error(error);
            res.send("failed");
        }
        else{
            jRes = JSON.parse(body);
            jRes = i2p.influx2pond(jRes); // err chk & convert to pond obj
            //res.json(j);

            //count flows for each tag combination (weight of the link)
            queryStr = "";
            for(var net in jRes.series[0].points){
              for(var dom in jRes.series[1].points){
                for(var dtn in jRes.series[2].points){
                 // count flows for netname[net] & domain[domain] & dtn[dtn]
                 var indx = ""+net+dom+dtn;
                 queryStr += encodeURIComponent("select count(value) as i"+indx+" from StartTime where netname='"+jRes.series[0].points[net][0]+"' AND domain='"+jRes.series[1].points[dom][0]+"' AND dtn='"+jRes.series[2].points[dtn][0]+"';");
                }
              }
            }
            res.send(queryStr);
        }
    }).auth('dbuser', 'TcitoPsb', true);
});
*/

// GET result of custom influxDB query
app.get('/api/custom/query/:queryStr', function(req, res) {
    var queryStr = encodeURIComponent(req.params.queryStr);
    var host = "https://hotel.psc.edu:8086";
    var url = host+"/query?db=xsight&q="+queryStr;

    logger.log("Request from "+req.ip+" for "+"/api/custom/query/:queryStr");
//    logger.log(req.connection.remoteAddress);

    request.get(url, function(error, response, body){
        if(error){ // url request err chking
            logger.log(error);
            res.send("failed");
        }
        else{ // pass result to client
            var j = JSON.parse(body);
            j = i2p.influx2pond(j); // err chk & convert to pond obj
            res.json(j);
        }
    }).auth('dbuser', 'TcitoPsb', true);
});

app.listen(app.get('port'), "0.0.0.0", function() {
  logger.log('Server started: 0.0.0.0:' + app.get('port') + '/');
});

// Cleanup then end process
var cleanup =  function() {
    logger.log("Recieved kill signal - gracefully shutting down.");
    // Any server cleanup
    process.exit();
}

// Capture signals SIGINT, SIGQUIT, SIGTERM
process.on('SIGINT', cleanup);
process.on('SIGQUIT', cleanup);
process.on('SIGTERM', cleanup);
