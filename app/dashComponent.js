var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');


var SelectedSourceTable = React.createClass({
    render: function(){
        return (
            <table>
            <tbody>
            <tr>
                <td>Database: </td>
                <td>{this.props.database.name}</td>
            </tr>
            <tr>
                <td>Network: </td>
                <td>{this.props.network.name}</td>
            </tr>
            <tr>
                <td>Domain: </td>
                <td>{this.props.domain.name}</td>
            </tr>
            <tr>
                <td>Host: </td>
                <td>{this.props.host.name}</td>
            </tr>
            </tbody>
            </table>
        );
    }
});

var DiscoveryGraph = React.createClass({
    handleChange: function(){
        this.props.onUserInput(
            this.refs.databaseInput.value
        );
    },
    render: function(){
        return(
            <form>
                <input
                    type="text"
                    value={this.props.database.name}
                    ref="databaseInput"
                    onChange={this.handleChange}
                />
            </form>
        );
    }
});

var Dashboard = React.createClass({
    getInitialState: function(){
        return {
            db: {name: "Xsight"},
            net: {name: "XSEDE"},
            domain: {name: "PSC"},
            host: {name: "firehose5"}
        };
    },
    handleUserInput: function(databaseName){
        this.setState({
            db: {name: databaseName}
        });
    },
    render: function(){
        return(
            <div>
                <SelectedSourceTable 
                    database={this.state.db} 
                    network={this.state.net} 
                    domain={this.state.domain} 
                    host={this.state.host} 
                />
                <DiscoveryGraph 
                    database={this.state.db}
                    network={this.state.net}
                    domain={this.state.domain}
                    host={this.state.host}
                    onUserInput={this.handleUserInput}
                />
            </div>
        );
    }
});

exports.Dashboard = Dashboard;
exports.DiscoveryGraph = DiscoveryGraph;
exports.SelectedSourceTable = SelectedSourceTable;

