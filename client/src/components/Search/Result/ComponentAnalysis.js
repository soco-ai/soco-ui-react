import React from 'react';
import {Button, Card, Icon, message} from "antd";
import Code from "../Code";
import Plot from 'react-plotly.js';
const moment = require('moment');

// Meta Distribution Plot Configuration
const MetaPlot = ({z}) => (
    <Plot
        data={[{
            values: z.values,
            labels: z.labels,
            marker: {
                colors: z.colors
            },
            type: 'pie',
            showlegend: false
        }]}
        layout={{
            height: window.innerWidth >= 768? window.innerWidth * 0.22 * 1.1 : window.innerWidth * 0.8 * 1.1,
            width: window.innerWidth >= 768? window.innerWidth * 0.22 : window.innerWidth * 0.8,
            margin: {
                l: 50,
                r: 50,
                b: 0,
                t: 30,
                pad: 4
            },
            title: {
                text: z.type,
                font: {
                    family: "'Nunito Sans', sans-serif",
                    size: 18
                }
            },
            legend: {"orientation": "h"}
        }}
        displayModeBar={false}
    />
)

// Content under "Meta Distribution/Meta" Tab
class ComponentAnalysis extends React.Component {
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
        if (this.props.meta_distribution.length !== 0)
            this.props.handleDownload(this.props.meta_distribution, "meta_distribution_" + moment().valueOf().toString())
        else
            message.warning("No meta distribution")
    }
    render() {
        const {
            show_code
        } = this.state;
        return (
            !this.props.loading && <div style={{
                margin: "20px 0",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                width: "100%"
            }}>
                { window.innerWidth >= 768 && <Button type="primary" style={{width: "160px", borderRadius: "20px", justifyContent: "center"}} className={"soco-list report-btn-1"} onClick={this.handleDownload}>
                    <Icon style={{display: "inline-block"}} type="download" />
                    <div style={{display: "inline-block", marginLeft: "5px"}}>Download JSON</div>
                </Button>}
                {
                    window.innerWidth >= 768 && (show_code? 
                    <div className="soco-list" style={{width: "100%", justifyContent: "flex-end", textAlign: "right", marginBottom: "10px", color: "#979797"}} >
                    <div style={{display: "inline-block", marginTop: "5px", cursor: "pointer"}} onClick={() => this.setState({show_code: false})}><img src="pic/svg/less.svg" /></div>
                    <div style={{display: "inline-block", marginLeft: "10px", cursor: "pointer"}} onClick={() => this.setState({show_code: false})}>Hide Code Snippet </div>
                    </div> 
                    : <div className="soco-list" style={{width: "100%", justifyContent: "flex-end", textAlign: "right", marginBottom: "20px", color: "#979797"}}>
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
                        "[VAR_NAME]": {"distribution": {}},
                      },
                      "uid": "soco_preview_template"
                    }} 
                    python={"from soco import sentiment\nprint(QA.get_sentiment(" + this.props.query_value + "))"}
                />}
                <div style={{width: "100%", flexWrap: "wrap" }} className="soco-list">
                    {/* Different Layout of Plot Group based on Screen Size */}
                    {
                        this.props.meta_distribution.length !== 0? 
                        this.props.meta_distribution.map((z,i)=> {
                            if (window.innerWidth >= 768)
                                return (
                                    <Card style={{margin: "10px 10px 20px"}} className={"soco-list_item report-card report-meta"} key={i}>
                                        <MetaPlot z={z} />
                                    </Card>
                                )
                            else
                                return (
                                    <div style={{margin: "10px"}} className={"soco-list_item report-meta"} key={i}>
                                        <MetaPlot z={z} />
                                    </div>
                                )   
                            }  
                        )
                        :<div style={{fontSize: "18px", width: "100%", textAlign: "center", fontStyle: "italic", color: "#979797", margin: "10px 0 20px"}}>Ready for Search</div>
                    }
                </div>
            </div>
        )
    }
}

export default ComponentAnalysis;
