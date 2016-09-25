var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var ReactD3 = require('react-d3-components');
var logger = require('./logger.js');
var d3 = require('d3');

var Table = React.createClass({
    render: function(){
        return (
            <table>
            <tbody>
            <tr>
                <td>Database: </td>
                <td>{this.props.database}</td>
            </tr>
            <tr>
                <td>Network: </td>
                <td>{this.props.network}</td>
            </tr>
            <tr>
                <td>Domain: </td>
                <td>{this.props.domain}</td>
            </tr>
            <tr>
                <td>Host: </td>
                <td>{this.props.host}</td>
            </tr>
            </tbody>
            </table>
        );
    }
});

exports.Table = Table;
