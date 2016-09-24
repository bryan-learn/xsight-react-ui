var React = require('react');
var ReactDOM = require('react-dom');
var Dashboard = require('./dashboardComponent.js');

//ReactDOM.render(<updown.MyChart url="api/content" pollInterval={5000}/>, document.getElementById('xs-traffic')); //document.body
//ReactDOM.render(<line.MyChart url="api/queryByFlow/DataOctetsOut/0598149c05b14c8cd780b21567d2aadcd0b78810fdb3726555e5aa998fd65c3e" pollInterval={5000}/>, document.getElementById('xs-container')); //document.body
//ReactDOM.render(<Component.MyTable url="api/content" pollInterval={5000}/>, document.getElementById('xs-table'));
var divStyle = {
    width: "100%",
    height: "100%"
};

ReactDOM.render(
        <Dashboard.Dashboard 
            style={divStyle} 
            database="xsight"
            discoveryGraphURL="http://hotel.psc.edu:3000/api/xsight/graph/"
            trafficGraphURL="http://hotel.psc.edu:3000/api/xsight/traffic-graph/"
            qualityGraphURL="http://hotel.psc.edu:3000/api/xsight/quality-graph/"
        />, document.getElementById('xs-container'));
console.log('page loaded');
