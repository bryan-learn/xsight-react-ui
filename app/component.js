var $ = require('jquery');
var React = require('react'),
    DOM = React.DOM, div = DOM.div, button = DOM.button, ul = DOM.ul, li = DOM.li;
var Pond = require('pondjs'), TimeRange = Pond.TimeRange;
var Index = Pond.Index;
var TimeSeries = Pond.TimeSeries;
var TSC = require('react-timeseries-charts'),
    Charts = TSC.Charts, ChartContainer = TSC.ChartContainer, ChartRow = TSC.ChartRow,
    YAxis = TSC.YAxis, LineChart = TSC.LineChart;

var index = new Pond.Index("1d-1234");
console.log(index.asTimerange().humanize());

//Timeseries example
var data = {
    "name": "traffic",
    "columns": ["time", "value"],
    "points": [
//        ["2015-12-13T07:47:20Z",5929538],
//        ["2015-12-13T07:48:20Z",5932552],
//        ["2015-12-13T07:49:20Z",5932552],
//        ["2015-12-13T07:50:20Z",5934368],
//        ["2015-12-13T07:51:20Z",5936381],
//        ["2015-12-13T07:52:20Z",5939166],
//        ["2015-12-13T07:53:20Z",5939166],
//        ["2015-12-13T07:54:21Z",5940508],
//        ["2015-12-13T07:55:21Z",5940966],
        ["2015-12-13T07:56:21Z",5940966]
    ]
};

var series = new TimeSeries(data);
var date = new Date();

module.exports = React.createClass({
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

        //convert RFC 3339 timestamps to unix epoch (ms)
        var s = data["results"][0]["series"][0];
        for(var i=0; i<s["points"].length; i++){
            date.setRFC3339(s["points"][i][0]);
            s["points"][i][0] = date.getTime();
        }
        data["results"][0]["series"][0] = s;
        
        series = new TimeSeries(data["results"][0]["series"][0]);
        console.log(series);
      }.bind(this),
      error: function() {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    }); //ajax
  },
  componentDidMount: function() {
    this.loadContentFromServer();
    setInterval(this.loadContentFromServer, this.props.pollInterval);
  },
  render: function () {
    return div(null,
      <ChartContainer timeRange={series.timerange()} width={800}>
        <ChartRow height="200">
            <YAxis id="axis1" label="Octets" min={series.min()} max={series.max()} width="100" type="linear" format="$,.2f"/>
            <Charts>
                <LineChart axis="axis1" series={series}/>
            </Charts>
        </ChartRow>
      </ChartContainer> 
    );
  }
});

