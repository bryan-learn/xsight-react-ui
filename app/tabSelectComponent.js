var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var ReactD3 = require('react-d3-components');
var logger = require('./logger.js');
var d3 = require('d3');

var Row = React.createClass({
    render: function(){
        var divStyle = {
            "display": "inline"
        };
        var onStyle = {
            "color": "#ffffff",
            "fontSize": "20px",
            "background": "#059bff",
            "padding": "10px 20px 10px 20px",
            "textDecoration": "none"
        };
        var offStyle = {
            "color": "#ffffff",
            "fontSize": "20px",
            "background": "#59bfff",
            "padding": "10px 20px 10px 20px",
            "textDecoration": "none"
        };

        //props.tabs format: [["title", selectBoolean], ["title", selectBoolean]]
        return (
            <div style={divStyle}>
                <button style={this.props.tabs[0][1] ? onStyle : offStyle} onClick={this.props.clickEvent}>{this.props.tabs[0][0]}</button>
                <button style={this.props.tabs[1][1] ? onStyle : offStyle} onClick={this.props.clickEvent}>{this.props.tabs[1][0]}</button>
            </div>
        );
    }
});

exports.Row = Row;
