var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var logger = require('./logger.js');
var ReactGridLayout = require('react-grid-layout');
var DiscoveryGraph = require('./discoveryGraphComponent.js');
var TrafficView = require('./trafficOverviewComponent.js');
var QualityView = require('./qualityOverviewComponent.js');

var Dashboard = React.createClass({
    getInitialState: function(){
        var dcGraph = {};
        var tData = [{x:"no data", y:0}];
        var qData = {};
        var sContext = {
                database: "",
                network: "",
                domain: "",
                host: ""
        };

        // load DiscoveryGraph data from server
        this.asyncRequest = $.ajax({
            url: this.props.discoveryGraphURL,
            dataType: 'json',
            cache: false,
            success: function(data){
                dcGraph = data;
            }.bind(this),
            error: function(err){
                logger.error(this.props.discoveryGraphURL, status, err.toString());
            }.bind(this)
        });
       
        this.getTrafficData(sContext, this, function(caller, data){
            tData = data;
        });

        return {
            sourceContext: {
                database: "",
                network: "",
                domain: "",
                host: ""
            },
            dcData: dcGraph,
            trafficData: tData,
            qualityData: this.getQualityData()
        };
    },
    updateContext: function(srcContext){
        this.setState({
            sourceContext: srcContext,
            qualityData: this.getQualityData()
        });

        //logger.log("updating dashboard context");
        this.getTrafficData(srcContext, this, function(caller, data){
            caller.setState({
                trafficData: data
            });
        });


        this.setState({
            sourceContext: srcContext,
            qualityData: this.getQualityData()
        });
    },
    getTrafficData: function(srcContext, caller, callback){
        var apiUrl = this.props.trafficGraphURL; //start with base url then add on parameters

        //append parameters to url (depenedent on sourceContext)
        var tagStr = "-";
        if(srcContext.network != ""){
            tagStr = srcContext.network;   
        }
        else if(srcContext.domain != ""){
            tagStr += " "+srcContext.domain;
        }
        else if(srcContext.host != ""){
            tagStr += " "+srcContext.host;
        }       

        var duration = "year";

        apiUrl += tagStr+"/"+duration;

        logger.log(apiUrl);

        // load data from server
        this.asyncRequest = $.ajax({
            url: apiUrl,
            dataType: 'json',
            cache: true,
            success: function(data){
                console.log("getTrafficData() return"); 
                console.log(data);
                
                //translate from series data to pieChart data (array of ordered pairs: label, value)
                var pieData = [];
                if(data.series !== undefined){
                    var tag = "";
                    for(i=0; i<data.series.length; i++){
                        tag = Object.keys(data.series[i].tags)[0]
                        pieData[i] = {x: data.series[i].tags[tag], y: data.series[i].points[0][1]};
                    }
                }

                logger.log("pieData["+pieData.length+"]");
                for(i=0; i<pieData.length; i++){
                    logger.log(pieData[i].x+": "+pieData[i].y);
                }

                callback(caller, pieData);
            }.bind(this),
            error: function(err){
                callback(caller, [{}]);
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
                    <TrafficView.TrafficView
                        data={this.state.trafficData}
                    />
                </div>
                <div key={'quality-view'}>
                    <QualityView.QualityView
                        data={this.state.qualityData}
                    />
                </div>
                <div key={'dcgraph-view'}>
                    <DiscoveryGraph.DiscoveryGraph
                        data={this.state.dcData}
                        database={this.state.sourceContext.database} 
                        network={this.state.sourceContext.network} 
                        domain={this.state.sourceContext.domain} 
                        host={this.state.sourceContext.host} 
                        onUserInput={this.updateContext}
                        url={this.props.discoveryGraphURL}
                    />
                </div>
            </ReactGridLayout>
        );
    }
});

exports.Dashboard = Dashboard;
