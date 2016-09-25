var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var ReactD3 = require('react-d3-components');
var logger = require('./logger.js');
var d3 = require('d3');

var QualityView = React.createClass({
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

        var data = {
            label: 'Quality',
            values: this.props.data
        };

        // do not display invalid data
        if(data.values === undefined || data.values == null || data.values.length == 0){
            return (<div>
                <h4 style={headerStyle}>{"Quality Overview"}</h4>
                <div style={divStyle}>
                <p>{"No data returned"}</p>
                </div></div>
            );
        }
        
        // do not display invalid data
        if(data.values == "init"){
            return (<div>
                <h4 style={headerStyle}>{"Quality Overview"}</h4>
                <div style={divStyle}>
                <p>{"Interact with graph to load data"}</p>
                </div></div>
            );
        }
       
        // if waiting for data to arrive (updating)
        if(data.values[0] == "updating"){
            return (<div>
                <h4 style={headerStyle}>{"Quality Overview"}</h4>
                <div style={divStyle}>
                <p>{"Receiving data.."}</p>
                </div></div>
            );
        }


        return (<div>
            <h4 style={headerStyle}>{"Quality Overview"}</h4>
            <ReactD3.Waveform
                data={data}
                width={600}
                height={100}
                colorScale={ d3.scale.linear()
                    .domain([0,1400])
                    .range(['#eb1785','#ff7b16'])
                }
            />
            </div>
        );
    }    
});

exports.QualityView = QualityView;
