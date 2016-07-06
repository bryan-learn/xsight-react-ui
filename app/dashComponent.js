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

var DiscoveryGraph = React.createClass({
    getInitialState: function() {
        return {
            graph: {},
            sourceContext: {}
        }
    },
    componentWillMount: function(){
        // explicitly set callback for userInput
        forceGraph.setInputCallback(this.handleChange);
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
                var elem = this.getDOMNode();
                forceGraph.init(elem);
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
        logger.log("change event");
        this.props.onUserInput(
            forceGraph.getSourceContext()
        );
    },
    render: function(){
        return(
            <div className="DiscoveryGraph" id="DiscoveryGraph" ></div>
        );
    }
});

var Dashboard = React.createClass({
    getInitialState: function(){
        return {
            sourceContext: {
                database: "",
                network: "",
                domain: "",
                host: ""
            }
        };
    },
    updateContext: function(sourceContext){
        logger.log("updating dashboard context");
        this.setState({
            sourceContext: sourceContext 
        });
    },
    render: function(){
        return(
            <div>
                <SelectedSourceTable 
                    database={this.state.sourceContext.database} 
                    network={this.state.sourceContext.network} 
                    domain={this.state.sourceContext.domain} 
                    host={this.state.sourceContext.host} 
                />
                <DiscoveryGraph 
                    database={this.state.sourceContext.database} 
                    network={this.state.sourceContext.network} 
                    domain={this.state.sourceContext.domain} 
                    host={this.state.sourceContext.host} 
                    onUserInput={this.updateContext}
                    url="api/xsight/graph/"
                />
            </div>
        );
    }
});

exports.Dashboard = Dashboard;
exports.DiscoveryGraph = DiscoveryGraph;
exports.SelectedSourceTable = SelectedSourceTable;

