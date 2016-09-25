var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var ReactD3 = require('react-d3-components');
var logger = require('./logger.js');
var d3 = require('d3');

var TrafficView = React.createClass({
    render: function(){
        var headerStyle = {
            "textAlign": "center"
        };
       
        var divStyle = {
            "textAlign": "center",
            "color": "#00529B",
            "backgroundColor": "#BDE5F8",
            "padding": "20px"
        }

        var tdata = {
            label: 'Traffic',
            values: this.props.data
        };

        // do not display invalid data
        if(tdata.values === undefined || tdata.values == null || tdata.values.length == 0){
            return (<div>
                <h4 style={headerStyle}>{this.props.title}</h4>
                <div style={divStyle}>
                <p>{"No data returned"}</p>
                </div></div>
            );
        }
        
        // do not display invalid data
        if(tdata.values == "init"){
            return (<div>
                <h4 style={headerStyle}>{this.props.title}</h4>
                <div style={divStyle}>
                <p>{"Interact with graph to load data"}</p>
                </div></div>
            );
        }
       
        // if waiting for data to arrive (updating)
        if(tdata.values[0] == "updating"){
            return (<div>
                <h4 style={headerStyle}>{this.props.title}</h4>
                <div style={divStyle}>
                <p>{"Receiving data.."}</p>
                </div></div>
            );
        }

        // this point will only be reached if data is okay
        return (<div>
            <h4 style={headerStyle}>{this.props.title}</h4>
            <ReactD3.PieChart
            data={tdata}
            width={600}
            height={400}
            margin={{top: 10, bottom: 10, left: 100, right: 100}}
            sort={null}
            />
            </div>
        );
    }
});

exports.TrafficView = TrafficView;
