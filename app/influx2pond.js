var exports = module.exports = {};
var logger = require('./logger.js');

// returns an array of pond series structures
// one for each element in the influx result array
exports.influx2pond = function(influxJson){
    
    if(influxJson.error){ // chk for influx error
        logger.error("influx returned an error: "+JSON.stringify(influxJson.error));
        return {"error": influxJson.error};
    }
    else if("results" in influxJson){
        var pondArr = new Array();
        
        for (var i=0; i<influxJson.results.length; i++){
            if("series" in influxJson.results[i]){
                for(var j=0; j<influxJson.results[i].series.length; j++){
                    // if the series has tags, copy over tags
                    if (typeof influxJson["results"][i]["series"][j].tags !== 'undefined' 
                            || influxJson["results"][i]["series"][j].tags !== null)
                        pondArr.push({
                            "name": influxJson["results"][i]["series"][j].name,
                            "tags": influxJson["results"][i]["series"][j].tags,
                            "columns": influxJson["results"][i]["series"][j].columns,
                            "points": influxJson["results"][i]["series"][j].values,

                        });
                    else{ // else the series has no tags to copy over
                        pondArr.push({
                            "name": influxJson["results"][i]["series"][j].name,
                            "columns": influxJson["results"][i]["series"][j].columns,
                            "points": influxJson["results"][i]["series"][j].values,

                        });
                    }
                }
            }
        }
        return { "series": pondArr};
    }else {
        logger.error("influx2pond received malformated influx object: "+JSON.stringify(influxJson.err));
        return {"error": "malformated influx object"}
    }
};
