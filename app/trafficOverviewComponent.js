var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var ReactD3 = require('react-d3-components');
var logger = require('./logger.js');
var d3 = require('d3');

var TrafficView = React.createClass({
    render: function(){
        var tdata = {
            label: 'Traffic',
            values: this.props.data
        };

        return (<ReactD3.PieChart
            data={tdata}
            width={600}
            height={400}
            margin={{top: 10, bottom: 10, left: 100, right: 100}}
            sort={null}
            />
        );
    }
});

exports.TrafficView = TrafficView;
