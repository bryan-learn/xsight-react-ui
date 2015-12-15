var React = require('react'),
    DOM = React.DOM, div = DOM.div, button = DOM.button, ul = DOM.ul, li = DOM.li;
var Pond = require('pondjs');
var Index = Pond.Index;
var TimeSeries = Pond.TimeSeries;
var TSC = require('react-timeseries-charts'),
    Charts = TSC.Charts, ChartContainer = TSC.ChartContainer, ChartRow = TSC.ChartRow,
    YAxis = TSC.YAxis, LineChart = TSC.LineChart;

var index = new Pond.Index("1d-1234");
console.log(index.asTimerange().humanize());

//Timeseries example
const data = {
    "name": "traffic",
    "columns": ["time", "value", "status"],
    "points": [
        [1400425947000, 52, "ok"],
        [1400425948000, 18, "ok"],
        [1400425949000, 26, "fail"],
        [1400425950000, 93, "offline"],
    ]
};

var series = new TimeSeries(data);
for (var i=0; i < series.size(); i++) {
    console.log(series.at(i).toString());
}



module.exports = React.createClass({
  render: function () {
    return div(null,
      <ChartContainer timeRange={series.timerange()} width={800}>
        <ChartRow height="200">
            <YAxis id="axis1" label="AUD" min={0} max={100} width="60" type="linear" format="$,.2f"/>
            <Charts>
                <LineChart axis="axis1" series={series}/>
            </Charts>
            <YAxis id="axis2" label="Euro" min={0} max={100} width="80" type="linear" format="$,.2f"/>
        </ChartRow>
      </ChartContainer> 
    );
  }
});

