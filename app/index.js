var React = require('react');
var ReactDOM = require('react-dom');
var updown = require('./bytesChartComponent.js');
var line = require('./component.js');

//ReactDOM.render(<updown.MyChart url="api/content" pollInterval={5000}/>, document.getElementById('xs-traffic')); //document.body
ReactDOM.render(<line.MyChart url="api/queryByFlow/DataOctetsOut/0598149c05b14c8cd780b21567d2aadcd0b78810fdb3726555e5aa998fd65c3e" pollInterval={5000}/>, document.getElementById('xs-chart')); //document.body
//ReactDOM.render(<Component.MyTable url="api/content" pollInterval={5000}/>, document.getElementById('xs-table'));
console.log('page loaded');
