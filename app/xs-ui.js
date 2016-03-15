var XSContentBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadContentFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    }); // $.ajax
  },
  componentDidMount: function() {
    this.loadContentFromServer();
    setInterval(this.loadContentFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="xsContentBox">
          <h1>XSContent</h1>
          <XSContentList data={this.state.data}/>
          <XSContentForm /> 
      </div>
    );
  }
});

var XSContentList = React.createClass({
  render: function() {
    var contentNodes = this.props.data.map(function(content) {
      return (
        <XSContent source={content.source} key={content.id}>
          {content.value}
        </XSContent>
      );
    });
    return(
      <div clasName="contentList">
        {contentNodes}
      </div>
    );
  }
});

var XSContentForm = React.createClass({
  render: function() {
    return (
      <div className="xsContentForm">
        Xsight XSContentForm.
      </div>
    );
  }
});

var XSContent = React.createClass({
  render: function() {
    return (
      <div className="xsContent">
        <h2 className="xsContentSource">
          {this.props.source}
         </h2>
         {this.props.children}
      </div>
    );
  }
});

ReactDOM.render(
  <XSContentBox url="api/content" pollInterval={2000}/>,
  document.getElementById('content')
);
