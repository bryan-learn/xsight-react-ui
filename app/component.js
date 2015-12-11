var React = require('react');
var Pond = require('pondjs');
var Index = Pond.Index;
var TimeSeries = Pond.TimeSeries;

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
    var str = "";
    for (var i=0; i < series.size(); i++) {
        str += series.at(i).toString();
    }

    return (
      <p>{str}</p>
    );
  }
});

