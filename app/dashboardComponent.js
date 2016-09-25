var exports = module.exports = {};
var $ = require('jquery');
var React = require('react');
var logger = require('./logger.js');
var ReactGridLayout = require('react-grid-layout');
var DiscoveryGraph = require('./discoveryGraphComponent.js');
var TrafficView = require('./trafficOverviewComponent.js');
var QualityView = require('./qualityOverviewComponent.js');
var DataView = require('./dataViewComponent.js');
var TabSelect = require('./tabSelectComponent.js');

var Dashboard = React.createClass({
    getInitialState: function(){
        var dcGraph = {};
        var tData = ["init"];
        var qData = ["init"];
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
       
        return {
            view: 0,
            sourceContext: {
                database: "",
                network: "",
                domain: "",
                host: ""
            },
            dcData: dcGraph,
            trafficData: tData,
            qualityData: qData
        };
    },
    setTab: function(){
        var newView = this.state.view == 0 ? 1 : 0
        this.setState({
            view: newView
        });
    },
    updateContext: function(srcContext){
        this.setState({
            sourceContext: srcContext,
            qualityData: ["updating"], // this state will be set before the callback returns
            trafficData: ["updating"]
        });

        //logger.log("updating dashboard context");
        this.getTrafficData(srcContext, this, function(caller, data){
            caller.setState({
                trafficData: data
            });
        });

        this.getQualityData(srcContext, this, function(caller, data){
            caller.setState({
                qualityData: data
            });
        });

    },
    getTrafficData: function(srcContext, caller, callback){
        var apiUrl = this.props.trafficGraphURL; //start with base url then add on parameters

        //append parameters to url (depenedent on sourceContext)
        var tagStr = "-";
        if(srcContext.network != ""){
            tagStr = srcContext.network;   
        }
        if(srcContext.domain != ""){
            tagStr += " "+srcContext.domain;
        }
        if(srcContext.host != ""){
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
                
                //translate from series data to pieChart data (array of ordered pairs: label, value)
                var pieData = [];
                if(data.series !== undefined){
                    var tag = "";
                    for(i=0; i<data.series.length; i++){
                        tag = Object.keys(data.series[i].tags)[0]
                        pieData[i] = {x: data.series[i].tags[tag]+": "+data.series[i].points[0][1], y: data.series[i].points[0][1]};
                    }
                }

                logger.log("pieData["+pieData.length+"]");
                for(i=0; i<pieData.length; i++){
                    logger.log(pieData[i].x+": "+pieData[i].y);
                }

                callback(caller, pieData);
            }.bind(this),
            error: function(err){
                callback(caller, []);
                logger.error(apiUrl, status, err.toString());
            }.bind(this)
        });
    },
    getQualityData: function(srcContext, caller, callback){
        var apiUrl = this.props.qualityGraphURL; //start with base url then add on parameters

        //append parameters to url (depenedent on sourceContext)
        var tagStr = "-";
        if(srcContext.network != ""){
            tagStr = srcContext.network;   
        }
        if(srcContext.domain != ""){
            tagStr += " "+srcContext.domain;
        }
        if(srcContext.host != ""){
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
                console.log("getQualityData() return"); 
                
                //translate from series data to pieChart data (array of ordered pairs: label, value)
                var pieData = [];
                if(data.series !== undefined && data.series.length >= 2){
                    pieData[0] = {x: "Flagged: "+data.series[0].points[0][1], y: data.series[0].points[0][1]};
                    pieData[1] = {x: "Total: "+data.series[1].points[0][1], y: data.series[1].points[0][1]};
                }

                callback(caller, pieData);
            }.bind(this),
            error: function(err){
                callback(caller, []);
                logger.error(apiUrl, status, err.toString());
            }.bind(this)
        });
    },
    render: function(){
        var divStyle = {
            "borderRadius": "25px",
            "border": "2px solid"
        };

        var data = {
            label: 'Traffic',
            values: [{x: 'DTN1', y: 68},{x: 'DTN2', y: 27},{x: 'DTN3', y: 10}]
        };

        // Define ReactGridLayout for Dashboard
        var layout = [
            {i: 'tab', x: 0, y: 0, w: 2, h: 2, static: true}, 
            {i: 'traffic-view', x: 0, y: 2, w: 1, h: 12, static: true}, 
            {i: 'quality-view', x: 1, y: 2, w: 1, h: 12, static: true}, 
            {i: 'dcgraph-view', x: 0, y: 15, w: 2, h: 13, static: true}
        ] 

        if(this.state.view == 1){
            return(
                <div>
                    <TabSelect.Row
                        tabs={[ ["Dashboard", false], ["Data View", true] ] }
                        clickEvent={this.setTab}
                    />
                    <DataView.Table
                        database={this.state.sourceContext.database} 
                        network={this.state.sourceContext.network} 
                        domain={this.state.sourceContext.domain} 
                        host={this.state.sourceContext.host} 
                    />
                </div>
            );
        }
        else{
            return(
                <ReactGridLayout className="layout" layout={layout} cols={2} rowHeight={30} width={1200}>
                    <div key={'tab'}>
                        <TabSelect.Row
                            tabs={[ ["Dashboard", true], ["Data View", false] ] }
                            clickEvent={this.setTab}
                        />
                    </div>
                    <div style={divStyle}  key={'traffic-view'}>
                        <TrafficView.TrafficView
                            title={"Traffic Overview"}
                            data={this.state.trafficData}
                        />
                    </div>
                    <div style={divStyle} key={'quality-view'}>
                        <TrafficView.TrafficView
                        //<QualityView.QualityView
                            title={"Quality Overview"}
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
    }
});

exports.Dashboard = Dashboard;
