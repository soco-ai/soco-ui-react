import React from 'react';
import {Card} from "antd";

// Viewer of Tree Node Value on Top of the Right Column When Clicking the "Knowledge Tree" Tab
class TreeValue extends React.Component {
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
                    <h5 id="kt-node-name">Knowledge Tree Node Name</h5>
                    <div id="kt-node-value"> 
                        <div style={{fontStyle: "italic", color: "#979797"}}>Check knowledge tree node value here</div>
                    </div>
                </Card>               
          </div>
        )
    }
}

export default TreeValue;
