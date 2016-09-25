var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var forceGraph = require('./forceGraph.js');
var logger = require('./logger.js');

logger.log("in forcegraph");

var DiscoveryGraph = React.createClass({
    componentWillMount: function(){
        // explicitly set callback for userInput
        forceGraph.setInputCallback(this.handleChange);
    },
    componentDidMount: function(){
        var elemWidth = 600;
        var elemHeight = 800;

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
                forceGraph.init(elem, elemWidth, elemHeight);
                logger.log("Success: loaded data into graph [callback]");
            }.bind(this),
            error: function(err){
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
        var headerStyle = {
            "textAlign": "center"
        };
        var divStyle = {
            "borderRadius": "25px",
            "border": "2px solid"
        };
        return(
            <div style={divStyle} className="DiscoveryGraph" id="DiscoveryGraph" >
            <h4 style={headerStyle}>{"Discovery Graph"}</h4>
            </div>
        );
    }
});

exports.DiscoveryGraph = DiscoveryGraph;
