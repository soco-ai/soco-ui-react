import React from 'react';
import {Button, Icon, message, Pagination, Tooltip} from "antd";
import Code from "../Code";
import parse from 'html-react-parser';
const moment = require('moment');

// Content under "Response Cluster/Cluster" Tab
class ActionCluster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_code: false
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.query_value !== prevProps.query_value) {
      this.setState({
        show_code: false, 
        page: 1
      })
    }
  }
  // Download Original Json
  handleDownload = () => {
    if (Object.entries(this.props.cluster).length !== 0) {
      this.props.handleDownload(this.props.cluster, "cluster_" + moment().valueOf().toString())
    }
    else
      message.warning("No clusters")
  }
  render() {
    const {
      show_code
    } = this.state;
    return (
      !this.props.loading && <div style={{
        margin: window.innerWidth >= 768? "20px 0" : "20px 0 80px",
        display: "flex",
        flexDirection: "column"
      }}>
        { window.innerWidth >= 768 && <Button type="primary" style={{width: "160px", borderRadius: "20px", justifyContent: "center"}} className={"soco-list report-btn-1"} onClick={this.handleDownload}>
          <Icon style={{display: "inline-block"}} type="download" />
          <div style={{display: "inline-block", marginLeft: "5px"}}>Download JSON</div>
        </Button>}
        {
          window.innerWidth >= 768 && (show_code? 
          <div className="soco-list" style={{justifyContent: "flex-end", textAlign: "right", marginBottom: "10px", color: "#979797"}} >
          <div style={{display: "inline-block", marginTop: "5px", cursor: "pointer"}} onClick={() => this.setState({show_code: false})}><img src="pic/svg/less.svg" /></div>
          <div style={{display: "inline-block", marginLeft: "10px", cursor: "pointer"}} onClick={() => this.setState({show_code: false})}>Hide Code Snippet </div>
          </div> 
          : <div className="soco-list" style={{justifyContent: "flex-end", textAlign: "right", marginBottom: "20px", color: "#979797"}}>
          <div style={{display: "inline-block", marginTop: "-5px", cursor: "pointer"}} onClick={() => this.setState({show_code: true})}><img src="pic/svg/more.svg" /></div>
          <div style={{display: "inline-block", marginLeft: "10px", cursor: "pointer"}} onClick={() => this.setState({show_code: true})}>Show Code Snippet</div>
          </div>)
        }
        { window.innerWidth >= 768 && show_code && <Code
            sql={{
            "query": {
                "n_best": 5,
                "query": this.props.query_value
            },
            "aggs": {
                "[VAR_NAME]": {"cluster": {}},
            },
            "uid": "soco_core_dashboard_preview"
            }}
            python={"from soco import ActionCluster\nprint(ActionCluster.get_answer(" + this.props.query_value + "))"}
        />}
        {/* Show either cluster preview list or details under each cluster based on whether user choose one cluster or not */}
        {
          !this.props.current_cluster?
          <div>
            {
              this.props.cluster.hasOwnProperty("cluster")? 
              this.props.cluster.cluster.length !== 0 && this.props.cluster.cluster.slice((this.props.cluster_page - 1) * 10, this.props.cluster_page * 10).map((item, i) => {
                return (
                  <div key={i} style={{marginBottom: "40px"}} className="soco-action-cluster" id={"soco-action-cluster_" + item.topic}>
                    <div className="soco-list">
                      <div 
                        className="soco-list_item" style={{paddingRight: "20px", fontSize: "20px", color: "000", cursor: "pointer", fontWeight: "bold"}} 
                        onClick={() => this.props.onClusterOpen(item.topic, this.props.cluster_page)}
                      >
                        {
                          item.topic[0] === "_"? 
                          item.topic.slice(1).split(" / ").map((t, j) => {
                          return j < item.topic.slice(1).split(" / ").length - 1? 
                            t.trim().split(" ").map(c => c? c[0].toUpperCase() + c.slice(1) : "").join(" ") + " • "
                            : t.trim().split(" ").map(c => c? c[0].toUpperCase() + c.slice(1) : "").join(" ")
                          })
                          : item.topic.split(" / ").map((t, j) => {
                          return j < item.topic.slice(1).split(" / ").length - 1? 
                            t.trim().split(" ").map(c => c? c[0].toUpperCase() + c.slice(1) : "").join(" ") + " • "
                            : t.trim().split(" ").map(c => c? c[0].toUpperCase() + c.slice(1) : "").join(" ")
                          })
                        }
                      </div>
                      <Tooltip title="Indicates % of relevant answers covered by this topic" placement="topRight">
                        <div className="soco-list_item" style={{cursor: "default", fontSize: "15px"}}>
                          {parseFloat(item.portion).toFixed(2) + "%"}
                        </div>
                      </Tooltip>
                    </div>
                    <div style={{marginTop: "25px"}}>
                      {
                        item.sent.slice(0, 2).map((s, j) => (
                          <div key={item.topic + "-" + item.ids[j]} style={{fontSize: "16px", marginBottom: "10px"}}>
                            {"\"" + s + "\""}
                          </div>
                        ))
                      }
                    </div>
                    <div className="soco-list" style={{marginTop: "20px", justifyContent: "flex-end"}}>
                      <div className="soco-list_item soco-link" style={{cursor: "pointer"}} onClick={() => this.props.onClusterOpen(item.topic, this.props.cluster_page)}>View All ({item.sent.length})</div>
                    </div>
                  </div>
                )
              }) 
              : <div style={{fontSize: "18px", textAlign: "center", fontStyle: "italic", color: "#979797", margin: "10px 0 20px"}}>No Cluster for the Query</div>
            }
            {
              this.props.cluster.hasOwnProperty("cluster")? this.props.cluster.cluster.length !== 0 && 
              <Pagination
                style={{width: "100%", textAlign: window.innerWidth >= 768? "right" : "center", marginBottom: "20px"}}
                onChange={this.props.handlePageChange} 
                total={this.props.cluster.cluster.length}
                pageSize={10}
                size={window.innerWidth < 768? "small" : ""}
                current={this.props.cluster_page}
              /> : null
            }
          </div> 
          : <div>
            <div style={{marginBottom: "40px", fontSize: "15px"}}> 
              <Icon type="arrow-left" style={{color: "#979797", fontSize: "16px", cursor: "pointer", marginRight: "20px"}} 
                onClick={() => this.props.onClusterClose()}
              /> Showing {this.props.cluster.cluster.filter(c => c.topic === this.props.current_cluster)[0].ids.length} results for "{this.props.current_cluster}"
            </div>
            {this.props.cluster.cluster.filter(c => c.topic === this.props.current_cluster)[0].ids.map((id) => (
              <div key={id} style={{marginBottom: "40px"}}>
                <div className="soco-list" style={{justifyContent: "flex-start", marginBottom: "10px", width: "100%"}}>
                  <Tooltip title="Indicates relevance rank based on your query" placement="topLeft">
                    <div className="soco-list_item" style={{cursor: "default", width: "20%", textAlign: "center", width: "60px", borderRadius: "35px", backgroundColor: "#e4e5ff", color: "#918ef4", marginRight: "20px"}}>
                      {id + 1}
                    </div>
                  </Tooltip>
                  <div className="soco-list_item soco-url-list_item" style={{width: "80%", fontSize: "16px"}}>
                    {this.props.answers[id].hasOwnProperty("meta") && 
                      this.props.answers[id].meta.hasOwnProperty("URL")?
                      <a href={this.props.answers[id].meta["URL"]} style={{color: "#918ef4"}} target="_blank" className="soco-link">
                        {this.props.answers[id].meta["URL"]}
                      </a> : null
                    }
                  </div>
                </div>
                <div>
                  {
                    this.props.answers[id].a.highlight_value.length > 0 &&
                      <div style={{fontSize: "16px"}}>
                          {parse(this.props.answers[id].a.highlight_value.split("<b>").join('<b style="color: black;">'))}
                      </div>
                  }
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    )
  }
}
  
export default ActionCluster;
  