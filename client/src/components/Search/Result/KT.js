import React from 'react';
import {Button, Icon, message} from "antd";
import Code from "../Code";
const moment = require('moment');

// Content under "Knowledge Tree" Tab
class KT extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_code: false
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.query_value !== prevProps.query_value)
      this.setState({show_code: false})
  }
  // Download Original Json
  handleDownload = () => {
    if (Object.entries(this.props.tree).length !== 0)
      this.props.handleDownload(this.props.tree, "knowledge_tree_" + moment().valueOf().toString())
    else
      message.warning("No knowledge tree")
  }
  render() {
    const {
      show_code
    } = this.state;
    return (
        !this.props.loading && <div style={{
          margin: "20px 0",
          display: "flex",
          flexDirection: "column"
        }}>
          {window.innerWidth >= 768 && <Button type="primary" style={{width: "160px", borderRadius: "20px", justifyContent: "center"}} className={"soco-list report-btn-1"} onClick={this.handleDownload}>
            <Icon style={{display: "inline-block"}} type="download" />
            <div style={{display: "inline-block", marginLeft: "5px"}}>Download JSON</div>
          </Button>}
          { window.innerWidth >= 768 && (
            show_code?
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
                  "[VAR_NAME]": {"knowledge_tree": { "size": 15 }},
                },
                "uid": "soco_preview_template"
              }}
              python={"from soco import graph\nprint(graph.get_tree(" + this.props.query_value + "))"}
          />}
          {
            (Object.entries(this.props.tree).length === 0) &&
            <div style={{fontSize: "18px", width: "100%", textAlign: "center", fontStyle: "italic", color: "#979797", margin: "10px 0 20px"}}>Ready for Search</div>
          }
          {/* Empty div for Drawing the Knowledge Tree when Feeding in a set of Nodes */}
          {
            <div style={{
              width: "100%",
              margin: "0 auto 20px",
              display: "flex",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              position: "relative"}} id={"report-knowledge-tree"}
            >

            </div>
          }
        </div>
    )
  }
}

export default KT;
