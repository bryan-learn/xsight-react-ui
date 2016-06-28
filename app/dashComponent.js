var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var forceGraph = require('./forceGraph.js');
var logger = require('./logger.js');
var d3 = require('d3');

logger.log("in forcegraph");

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
    getInitialState: function() {
        return {
            graph: {}
        }
    },
    componentDidMount: function(){
        // load data from server
        this.asyncRequest = $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data){
                this.setState({
                    graph: data
                });
                forceGraph.init();
                logger.log("Success: loaded data into graph [callback]");
            }.bind(this),
            error: function(){
                logger.error(this.props.url, status, err.toString());
            }.bind(this)
        });
        
    },
    componentDidUpdate: function(){
        forceGraph.setGraph(this.state.graph);
    },
    componentWillUnmount: function(){
        // stop async requests if still outstanding
        this.asyncRequest.abort();
    },
    handleChange: function(){
        this.props.onUserInput(
            this.refs.databaseInput.value
        );
    },
    render: function(){
        return(
            <div className="DiscoveryGraph"></div>
        );
    }
});

var Dashboard = React.createClass({
    getInitialState: function(){
        return {
            db: {name: "Xsight", id: 0},
            net: {name: "XSEDE", id: 1},
            domain: {name: "PSC", id: 2},
            host: {name: "firehose5", id: 3}
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
                    url="api/xsight/graph/"
                />
            </div>
        );
    }
});

exports.Dashboard = Dashboard;
exports.DiscoveryGraph = DiscoveryGraph;
exports.SelectedSourceTable = SelectedSourceTable;

