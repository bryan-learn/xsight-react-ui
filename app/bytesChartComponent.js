var exports = module.exports = {};
var $ = require('jquery');
var React = require('react'),
    DOM = React.DOM, div = DOM.div, button = DOM.button, ul = DOM.ul, li = DOM.li;
var Pond = require('pondjs'), TimeRange = Pond.TimeRange;
var Index = Pond.Index;
var TimeSeries = Pond.TimeSeries;
var TSC = require('react-timeseries-charts'),
    Charts = TSC.Charts, ChartContainer = TSC.ChartContainer, ChartRow = TSC.ChartRow,
    YAxis = TSC.YAxis, LineChart = TSC.LineChart, AreaChart = TSC.AreaChart;

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
var sMin = null;
var sMax = null;
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

        var p = [];
        // merge bytes in & out into one points array
        for(var i=0; i<data["results"][0]["series"][0]["values"].length; i++){
            //convert RFC 3339 timestamps to unix epoch (ms)
            date.setRFC3339(data["results"][0]["series"][0]["values"][i][0]);
            data["results"][0]["series"][0]["values"][i][0] = date.getTime();

            p[i] = [];
            p[i][0] = data["results"][0]["series"][0]["values"][i][0]; // time
            p[i][1] = data["results"][0]["series"][0]["values"][i][1]; // out
            p[i][2] = data["results"][1]["series"][0]["values"][i][1]; // in
        }

        console.log("merged points:");
        console.log(p);

        // store influxdb series data as Pond series data
        var s1 = {
            "name": "TrafficInOut",
            "columns": ["time", "out", "in"],
            "points": p
        };
        
        series = new TimeSeries(s1);

        sMin = Math.min(series.min("out"), series.min("in"));
        sMax = Math.max(series.max("out"), series.max("in"));
        //sMax = series.max("out");
        console.log(series);
        console.log("min: "+sMin+" | max: "+sMax);
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
      <ChartContainer timeRange={series.timerange()} width={800}>
        <ChartRow height="200">
            <Charts>
                <AreaChart axis="axis1" series={series} columns={{"up": ["out"], "down": ["in"]}}  style={{ "up": ["#448FDD"], "down": ["#FD8D0D"] }}/>
            </Charts>
            <YAxis id="axis1" label="Traffic (bps)" min={-sMax} max={sMax} width="100" type="linear"/>
        </ChartRow>
      </ChartContainer> 
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
