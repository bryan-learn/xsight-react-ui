var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var ReactD3 = require('react-d3-components');
var forceGraph = require('./forceGraph.js');
var logger = require('./logger.js');
var d3 = require('d3');
var ReactGridLayout = require('react-grid-layout');

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

var TrafficView = React.createClass({
    render: function(){
        var data = {
            label: 'Traffic',
            values: [{x: 'DTN1', y: Math.random()*100},{x: 'DTN2', y: Math.random()*100},{x: 'DTN3', y: Math.random()*100}]
        };

        return (<ReactD3.PieChart
            data={data}
            width={600}
            height={400}
            margin={{top: 10, bottom: 10, left: 100, right: 100}}
            sort={null}
            />
        );
    }
});

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
            data[1][0].values.push({x: ''+i, y: (Math.random()>0.75) ? 1 : 0});
            data[2][0].values.push({x: ''+i, y: (Math.random()>0.3) ? 1 : 0});
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
            DTN2<ReactD3.Waveform
                data={data[1]}
                width={600}
                height={100}
                colorScale={ d3.scale.linear()
                    .domain([0,1400])
                    .range(['#eb1785','#ff7b16'])
                }
            />
            DTN3<ReactD3.Waveform
                data={data[2]}
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

var DiscoveryGraph = React.createClass({
    componentWillMount: function(){
        // explicitly set callback for userInput
        forceGraph.setInputCallback(this.handleChange);
    },
    componentDidMount: function(){
        var elemWidth = $('#Dash').width();
        var elemHeight = $('#Dash').height();

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
            },
            trafficData: this.getTrafficData(),
            qualityData: this.getQualityData()
        };
    },
    updateContext: function(srcContext){
        //logger.log("updating dashboard context");
        this.setState({
            sourceContext: srcContext,
            trafficData: this.getTrafficData(),
            qualityData: this.getQualityData()
        });
        this.getTrafficData(); // sets state.trafficData
        this.getQualityData(); // sets state.qualityData
    },
    getTrafficData: function(){
        var apiUrl = this.props.urlBase; //start with base url then add on parameters

        //append parameters to url (depenedent on sourceContext)
        var tagStr = "-";
        if(this.props.network != ""){
            tagStr = this.props.network;   
        }
        else if(this.props.database != ""){
            tagStr += " "+this.props.database;
        }
        else if(this.props.host != ""){
            tagStr += " "+this.props.host;
        }       

        var duration = "year";

        apiUrl += tagStr+"/"+duration;

        // load data from server
        this.asyncRequest = $.ajax({
            url: apiUrl,
            dataType: 'json',
            cache: true,
            success: function(data){
                console.log("getTrafficData() return"); 
                console.log(data); 
                return data;
            }.bind(this),
            error: function(err){
                logger.error(apiUrl, status, err.toString());
            }.bind(this)
        });
    },
    getQualityData: function(){

    },
    render: function(){
        var data = {
            label: 'Traffic',
            values: [{x: 'DTN1', y: 68},{x: 'DTN2', y: 27},{x: 'DTN3', y: 10}]
        };

        // Define ReactGridLayout for Dashboard
        var layout = [
            {i: 'traffic-view', x: 0, y: 0, w: 6, h: 10, static: true}, 
            {i: 'quality-view', x: 6, y: 0, w: 6, h: 10, static: true}, 
            {i: 'dcgraph-view', x: 0, y: 11, w: 12, h: 18, static: true}
        ] 

        return(
            <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
                <div key={'traffic-view'}>
                    <TrafficView
                        data={this.state.trafficData}
                        urlBase="http://hotel.psc.edu:3000/api/xsight/traffic-graph/"
                    />
                </div>
                <div key={'quality-view'}>
                    <QualityView
                        data={this.state.qualityData}
                        urlBase="http://hotel.psc.edu:3000/api/xsight/quality-graph/"
                    />
                </div>
                <div key={'dcgraph-view'}>
                    <DiscoveryGraph 
                        database={this.state.sourceContext.database} 
                        network={this.state.sourceContext.network} 
                        domain={this.state.sourceContext.domain} 
                        host={this.state.sourceContext.host} 
                        onUserInput={this.updateContext}
                        url="api/xsight/graph/"
                    />
                </div>
            </ReactGridLayout>
        );
    }
});

exports.Dashboard = Dashboard;
exports.DiscoveryGraph = DiscoveryGraph;
exports.SelectedSourceTable = SelectedSourceTable;
exports.TrafficView = TrafficView;
exports.QualityView = QualityView;
