var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var ReactD3 = require('react-d3-components');
var logger = require('./logger.js');
var d3 = require('d3');

var QualityView = React.createClass({
    render: function(){
        var data = [
            [{
                label: 'Quality',
                values: []
            }],
            [{
                label: 'Quality',
                values: []
            }],
            [{
                label: 'Quality',
                values: []
            }]
        ]
        //Fill values
        for(var i=0; i<250; i++){
            data[0][0].values.push({x: ''+i, y: (Math.random()>0.9) ? 1 : 0});
        }

        return (
            <div>
            DTN1<ReactD3.Waveform
                data={data[0]}
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
