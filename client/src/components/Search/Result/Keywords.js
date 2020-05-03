import React from 'react';
import {Card, Tag} from "antd";
import {Carousel} from "react-bootstrap";
import Code from "../Code";


class Keywords extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show_code: false
      }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.query_value !== prevProps.query_value) {
            this.setState({show_code: false})
        }
    }
    render() {
      const {
        show_code, keyword_pad
      } = this.state;
        return (
            <div className="report-keywords-container" style={{
                // display: "flex",
                // flexDirection: "column"
            }}>
                <div className={"soco-list"} style={{marginBottom: "10px", color: "#979797"}}>
                    <div style={{fontSize: "18px", display: "inline-block"}}>
                        Keywords <span style={{fontSize: window.innerWidth >= 768 ? "15px" : "14px"}}>{this.props.keywords.length >= 100? "(100/" + this.props.keywords.length + ")" : "(" + this.props.keywords.length + ")"}</span>
                    </div>
                    { window.innerWidth >= 768 && (
                        show_code? <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", cursor: "pointer"}} onClick={() => this.setState({show_code: false})}>
                            <div style={{display: "inline-block", marginTop: "5px"}}><img src="pic/svg/less.svg" /></div>
                            <div style={{display: "inline-block", marginLeft: "10px"}}>Hide Code Snippet </div>
                        </div> : <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", cursor: "pointer"}} onClick={() => this.setState({show_code: true})}>    
                            <div style={{display: "inline-block", marginTop: "-5px"}}><img src="pic/svg/more.svg" /></div>
                            <div style={{display: "inline-block", marginLeft: "10px"}}>Show Code Snippet</div>
                        </div>)
                    }
                </div> 
                { window.innerWidth >= 768 && show_code && <Code
                    sql={{
                      "query": {
                        "n_best": 5,
                        "query": this.props.query_value
                      },
                      "aggs": {
                        "[VAR_NAME]": {"keywords": {"size": 10}},
                      },
                      "uid": "soco_core_dashboard_preview"
                    }}
                    python={"from soco import keywords\nprint(keywords.get_lists(" + this.props.query_value + "))"}
                    marginBottom={"10px"}
                />}
                {
                    window.innerWidth >= 768 ? <Carousel interval={null} indicators={true} controls={false}>
                        {this.props.keyword_pad.map((key, j) => 
                            <Carousel.Item key={j}>
                                <Card className="report-card" style={{marginTop: "10px"}}>
                                    {this.props.keywords.slice(key, key + 10).map((item, index) =>
                                        <div key={j + index} className={"soco-list"} style={{marginBottom: index === 9? "20px" : "10px"}}>
                                            <div 
                                                className={"report-keywords"}
                                                style={{display: "inline-block", cursor: "pointer", fontWeight: 600}} 
                                                onClick={()=>{
                                                    this.props.history.push('/search/result?query=' + item.text);
                                                    this.props.handleQuickSearch(item.text, "keywords")
                                                }} 
                                            >{item.text.toUpperCase()}</div>
                                            <div style={{display: "inline-block"}}>{"(" + item.value.toFixed(2) + ")"}</div>
                                        </div>
                                    )}
                                </Card>
                            </Carousel.Item>
                        )}
                    </Carousel> : <div style={{width: "90%"}}>
                        {
                            this.props.keywords.slice(0, 100).map((item, index) => 
                                <Tag 
                                    key={index}
                                    onClick={()=>{
                                        this.props.history.push('/search/result?query=' + item.text);
                                        this.props.handleQuickSearch(item.text, "keywords")
                                    }} 
                                    style={{margin:"5px", cursor: "pointer", fontSize: "14px"}} 
                                    color={item.color}
                                >
                                    {item.text.toUpperCase() + " (" + (item.value.toFixed(2)) + ")"}
                                </Tag>
                            )
                        }
                    </div>
                }
          </div>
        )
    }
}

export default Keywords;
