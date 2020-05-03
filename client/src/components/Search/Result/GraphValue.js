import React from 'react';
import {Card} from "antd";

// Viewer of Graph Node Value on Top of the Right Column When Clicking the "Knowledge Graph" Tab
class GraphValue extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      }
    }
    render() {
      const {
      } = this.state;
        return (
            <div style={{
                marginBottom: "30px"
            }}>
                <Card className="report-card" style={{width: "100%"}}>
                    <h5 id="kg-node-name">Knowledge Graph Node Value</h5>
                    <div id="kg-node-value"> 
                        <div style={{fontStyle: "italic", color: "#979797"}}>Check knowledge graph node value here</div>
                    </div>
                </Card>               
          </div>
        )
    }
}

export default GraphValue;
