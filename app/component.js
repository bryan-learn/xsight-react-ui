var exports = module.exports = {};
var $ = require('jquery');
var React = require('react'),
    DOM = React.DOM, div = DOM.div, button = DOM.button, ul = DOM.ul, li = DOM.li;
var Pond = require('pondjs'), TimeRange = Pond.TimeRange;
var Index = Pond.Index;
var TimeSeries = Pond.TimeSeries;
var TSC = require('react-timeseries-charts'),
    Charts = TSC.Charts, ChartContainer = TSC.ChartContainer, ChartRow = TSC.ChartRow,
    YAxis = TSC.YAxis, LineChart = TSC.LineChart, Table = TSC.Table;

var index = new Pond.Index("1d-1234");
console.log(index.asTimerange().humanize());

//Timeseries example
var data = {
    "name": "traffic",
    "columns": ["time", "value"],
    "points": [
        ["2015-12-13T07:56:21Z",5940966]
    ]
};

var series = new TimeSeries(data);
var seriesArr = new Array();
seriesArr.push(series);
var series2 = new TimeSeries(data);
var date = new Date();

exports.MyChart = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadContentFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
        console.log("updated data");

        if("error" in data){ // err chk
            console.log("influx error");
            console.log(data);
        }else if("series" in data){ // chk for data
                console.log(JSON.stringify(data));
                var arr = new Array();
                for(var i=0; i<data.series.length; i++){ //construct pond TimeSeries objs from series Json
                    if("points" in data.series[i] && "columns" in data.series[i] && "name" in data.series[i]){
                        //convert RFC 3339 timestamps to unix epoch (ms)
                        for(var j=0; j<data.series[i]["points"].length; j++){
                            date.setRFC3339(data.series[i]["points"][j][0]);
                            data.series[i]["points"][j][0] = date.getTime();
                        }
                        arr.push(new TimeSeries(data.series[i]));
                    }
                    else { // malformated json object - missing points|columns|name
                        console.log("received malformated influx2pond result");
                        console.log("series object missing 'points', 'columns', or 'name'");
                    }
                }
                seriesArr = arr;
                console.log(seriesArr);
                
        }else { // malformated json object - no series
            console.log("received malformated influx2pond result");
            console.log("object missing 'series' property");
        }
      }.bind(this),
      error: function() {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    }); //ajax
  },
  componentDidMount: function() {
    console.log("xs-chart component loaded");
    this.loadContentFromServer();
    setInterval(this.loadContentFromServer, this.props.pollInterval);
  },
  render: function () {
    return div(null,
      <ChartContainer timeRange={seriesArr[0].timerange()} width={800}>
        <ChartRow height="200">
            <YAxis id="axis1" label="Octets Out" min={seriesArr[0].min()} max={seriesArr[0].max()} width="100" type="linear"/>
            <Charts>
                <LineChart axis="axis1" series={seriesArr[0]}/>
            </Charts>
        </ChartRow>
        <Table series={seriesArr[0]} timeFormat="h:mm:ss a" />
      </ChartContainer> 
    );
  }
});

exports.MyTable = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadContentFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
        console.log("updated data");

        // store influxdb series data as Pond series data
        var s1 = {
            "name": data["results"][0]["series"][0]["name"],
            "columns": data["results"][0]["series"][0]["columns"],
            "points": data["results"][0]["series"][0]["values"]
        };
        var s2 = {
            "name": data["results"][1]["series"][0]["name"],
            "columns": data["results"][1]["series"][0]["columns"],
            "points": data["results"][1]["series"][0]["values"]
        };

        //convert RFC 3339 timestamps to unix epoch (ms)
        for(var i=0; i<s1["points"].length; i++){
            date.setRFC3339(s1["points"][i][0]);
            s1["points"][i][0] = date.getTime();
        }
        for(var i=0; i<s2["points"].length; i++){
            date.setRFC3339(s2["points"][i][0]);
            s2["points"][i][0] = date.getTime();
        }
        
        series = new TimeSeries(s1);
        series2 = new TimeSeries(s2);
        console.log(series);
        console.log(series2);
      }.bind(this),
      error: function() {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    }); //ajax
  },
  componentDidMount: function() {
    console.log("xs-table component loaded");
    this.loadContentFromServer();
    //setInterval(this.loadContentFromServer, this.props.pollInterval);
  },
  render: function () {
    return div({className: "xsChart"},
        <Table series={series} timeFormat="h:mm:ss a" />
    );
  }
});



// Parse RFC 3339 time strings
Date.prototype.setRFC3339 = function(dString){ 
    var utcOffset, offsetSplitChar;
    var offsetMultiplier = 1;
    var dateTime = dString.split("T");
    var date = dateTime[0].split("-");
    var time = dateTime[1].split(":");
    var offsetField = time[time.length - 1];
    var offsetString;
    offsetFieldIdentifier = offsetField.charAt(offsetField.length - 1);
    if (offsetFieldIdentifier == "Z") {
        utcOffset = 0;
        time[time.length - 1] = offsetField.substr(0, offsetField.length - 2);
    } else {
        if (offsetField[offsetField.length - 1].indexOf("+") != -1) {
            offsetSplitChar = "+";
            offsetMultiplier = 1;
        } else {
            offsetSplitChar = "-";
            offsetMultiplier = -1;
        }
        offsetString = offsetField.split(offsetSplitChar);
        time[time.length - 1] == offsetString[0];
        offsetString = offsetString[1].split(":");
        utcOffset = (offsetString[0] * 60) + offsetString[1];
        utcOffset = utcOffset * 60 * 1000;
    }
   
    this.setTime(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]) + (utcOffset * offsetMultiplier ));
    return this;
};
