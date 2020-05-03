import React from 'react';
import {Card} from "antd";
import {Carousel} from "react-bootstrap";

// Cluster Name list on Top of the Right Column When Clicking the "Response Cluster/Cluster" Tab
// Note: Cluster names are clickable. Each name link will direct you to the detail items under each cluster.
class ClusterValue extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      }
    }
    render() {
      const {
      } = this.state;
        return (
            <div className="report-keywords-container" style={{
            }}>
                <div className={"soco-list"} style={{marginBottom: "10px", color: "#979797"}}>
                    <div style={{fontSize: "18px", display: "inline-block"}}>
                        Clusters <span style={{fontSize: "15px"}}>{this.props.cluster.cluster.length >= 50? "(50/" + this.props.cluster.cluster.length + ")" : "(" + this.props.cluster.cluster.length + ")"}</span>
                    </div>
                    
                </div>
                {
                    <Carousel interval={null} indicators={true} controls={false}>
                        {this.props.cluster_pad.map((key, j) => 
                            <Carousel.Item key={j}>
                                <Card className="report-card" style={{marginTop: "10px"}}>
                                    <div className={"soco-list"} style={{marginBottom: "20px", fontSize: "17px", color: "#979797"}}>
                                        <div className={"soco-list_item"} style={{cursor: "pointer"}}>Topics</div>
                                        <div className={"soco-list_item"}>Portion</div>
                                    </div>
                                    {this.props.cluster.cluster.slice(key, key + 10).map((item, index) =>
                                        <div key={j + index} className={"soco-list"} style={{marginBottom: index === 9? "25px" : "10px"}}>
                                            <div 
                                                className={"report-keywords"}
                                                style={{display: "inline-block", cursor: "pointer", fontSize: "16px", fontWeight: 600, paddingRight: "20px"}} 
                                                onClick={()=>this.props.onClusterOpen(item.topic, j + 1)} 
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
                                            <div style={{display: "inline-block"}}>{parseFloat(item.portion).toFixed(2) + "%"}</div>
                                        </div>
                                    )}
                                </Card>
                            </Carousel.Item>
                        )}
                    </Carousel>
                }
          </div>
        )
    }
}

export default ClusterValue;
