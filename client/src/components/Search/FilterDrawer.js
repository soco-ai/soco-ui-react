import React from 'react';
import {Checkbox, Drawer} from "antd";


class FilterDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { }
    }
    render() {
        return (
            <Drawer
                width={window.innerWidth >= 768? "25%" : "80%"}
                placement="right"
                closable={false}
                maskClosable={true}
                visible={this.props.filter_drawer_visible}
                style={{
                    height: '100%',
                    fontFamily: "'Nunito Sans', sans-serif"
                }}
                onClose={this.props.onDrawerClose}
            >
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "30px"}}>
                    <div style={{fontSize: "18px", color: "#4a4a4a"}}>Filter</div>
                    <div style={{marginTop: "-10px", fontSize: "28px", cursor: "pointer"}} onClick={this.props.onDrawerClose}>x</div>
                </div>
                <div>
                    {
                        this.props.filters.map((f, i) => (
                            <div style={{marginBottom:  i === this.props.filters.length - 1? "10px" : "25px"}} key={i}>
                                <div className="soco-list" style={{cursor: "pointer", justifyContent: "flex-start"}} onClick={() => this.props.handleFiltersVisible(f.type) }>
                                    <div className="soco-list_item">
                                        {
                                            this.props.filters_visible[f.type]? 
                                            <img src="pic/svg/less.svg" alt={"soco-less"} /> 
                                            : <img src="pic/svg/more.svg" alt={"soco-more"} />
                                        }
                                    </div>
                                    <div className="soco-list_item" style={{marginLeft: "15px"}}>{f.type}</div>
                                    <div className="soco-list_item" style={{marginLeft: "10px"}}>{"(" + f.total_value + ")"}</div>
                                </div>
                                {
                                    f.hasOwnProperty("labels") && f.hasOwnProperty("values") && this.props.filters_visible[f.type] && f.labels.map((l, j) => (
                                        <div className="soco-list" style={{justifyContent: "flex-start", margin: j === 0? "10px 0 5px 15px" : "5px 0 5px 15px"}} key={j}>
                                            <div className="soco-list_item">
                                                <Checkbox defaultChecked={this.props.filters_content.hasOwnProperty(f.type)? 
                                                    l === "No " + f.type? this.props.filters_content[f.type].includes("") : this.props.filters_content[f.type].includes(l) : false} onChange={(e) => this.props.handleCheckedFilters(f.type, l, e.target.checked)}/>
                                            </div>
                                            <div className="soco-list_item" style={{marginLeft: "15px"}}>{l}</div>
                                            <div className="soco-list_item">{"(" + (f.values[j] / f.total_value * 100).toFixed(2) + "%)"}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
            </Drawer>
        )
    }
}

export default FilterDrawer ;
