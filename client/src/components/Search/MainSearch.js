import React from 'react';
import {AutoComplete, Input, message, Skeleton, Tooltip} from 'antd';
import {botmakerUrl, socoUrl, example} from "../../configs";
import {connect} from "react-redux";
import FilterFunction from "./FilterFunction";
import FilterDrawer from "./FilterDrawer";


/* Functions */
// Get init search result
function getInit(t, showKG, showKT, showMD) {
    fetch(socoUrl + '/api/tasks/soco/init/'+ process.env.QUERY_API_KEY, {
      method: 'GET',
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      if (json.hasOwnProperty("error")) {
        t.setState({
            ifDist: false, ifTree: false, ifGraph: false
        })
      } else {
        // Sentiments
        if (!json.sentiments || !showMD) {
            t.setState({ ifDist: false })
        } else {
            let sentiments = [], filters = [], filters_visible = {}, filterItems = {};
            
            if (json.hasOwnProperty("sentiments")) {
                sentiments = json.sentiments;
                if (sentiments.category) {
                    filters = filters.concat(sentiments.category);
                    // Sentiment Check
                    let sentimentCheck = [...filters];
                    sentimentCheck = sentimentCheck.filter(m => 
                        !m.type.includes("_id")
                    );
                    if (sentimentCheck.length === 0)
                        t.setState({ ifDist: false });
                    // Generate filters
                    filterItems = FilterFunction.CreateFilters(filters, filters_visible);
                }
            }
            
            t.setState({ 
                filters: filterItems.filters || filters, 
                filters_visible: filterItems.filters_visible || filters_visible
            })
        }
        // Tree and Graph
        if (!json.tree || !showKT)
            t.setState({ ifTree: false })
        if (!json.graph || !showKG)
            t.setState({ ifGraph: false })
      }
      // Show buttons
      t.setState({showQuickButtons: true})
    })
}

// Use task preview url to get task and data
const getTaskAndData = (t) => {
    fetch(socoUrl + "/api/tasks/soco/find", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                query: {key: process.env.QUERY_API_KEY},
                fields: ["configs"]
            }
        )
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            if (json[0]) {
                // Configs
                let configs = json[0].configs.filter(c => c.key === "graph" || c.key === "tree" || c.key === "meta_dist"),
                    showKG = true, showKT = true, showMD = true;
                if (configs.length !== 0) {
                    configs.forEach(c => {
                        if (c.key === "graph") showKG = c.value === "true";
                        if (c.key === "tree") showKT = c.value === "true";
                        if (c.key === "meta_dist") showMD = c.value === "true";
                    })
                }

                // Init
                getInit(t, showKG, showKT, showMD);
            } else {
                message.error("Task not found. Please check if the query api key is correct.")
            }
        })
};

// Main Search Class
class MainSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search_value: example.promoted_question,
            match_loading: false, dataSource: example.promoted_data, 
            ifDist: true, ifTree: true, ifGraph: true, filter_drawer_visible: false, 
            filters: [], filters_visible: {}, filters_content: {}, showQuickButtons: false
        };
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }
    componentDidMount() {
        getTaskAndData(this);
    }
    // Autocompletion
    handleSearchChange = (value) => {
        let self = this;

        self.setState({ search_value: value, dataSource: [], match_loading: true });
        
        fetch(botmakerUrl + "/v1/search/autocomplete", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.QUERY_API_KEY
            },
            body: JSON.stringify(
                {
                    query: {
                        query: value,
                        n_best: 5,
                        query_args: {
                            func_type: "lm"
                        }
                    },
                    uid: "soco_preview_template"
                }
            )
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                self.setState({dataSource: json, match_loading: false})
            });
    };
    // Save search history and redirect to search result page
    handleSearch = (value, source) => {
        let self = this;

        fetch(socoUrl + '/api/feedback/save_log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    query: value,
                    meta: {"source": source},
                    query_api_key: process.env.QUERY_API_KEY
                }
            )
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                self.props.history.push('/search/result?query=' + value + "&filters_content=" + JSON.stringify(self.state.filters_content));
            });
    };
    // Open/Close filter drawer
    handleFiltersVisible = (type) => {
        let filters_visible = {...this.state.filters_visible};
        filters_visible[type] = !filters_visible[type];
        this.setState({ filters_visible });
    }
    // Handle filter changes
    handleCheckedFilters = (type, label, checked) => {
        let filters_content = {...this.state.filters_content};
        if (!filters_content.hasOwnProperty(type))
            filters_content[type] = [];
        if (label === "No " + type)
            label = ""
        if (checked)
            if (!filters_content[type].includes(label))
                filters_content[type].push(label);
            else {}
        else
            filters_content[type] = filters_content[type].filter(l => l !== label);
        if (filters_content[type].length === 0)
            delete filters_content[type];
        this.setState({ filters_content })
    }
    render() {
        const {
            search_value, match_loading, dataSource, showQuickButtons,
            ifDist, ifTree, ifGraph, filter_drawer_visible, filters, filters_visible, filters_content
        } = this.state;
        return (
            <div style={{background: "#fff", height: "100vh"}} className="soco-preview-page">
                {filters.length !== 0 && 
                    <FilterDrawer 
                        filter_drawer_visible={filter_drawer_visible} filters={filters} filters_visible={filters_visible} filters_content={filters_content}
                        onDrawerClose={() => this.setState({filter_drawer_visible: false})} 
                        handleFiltersVisible={this.handleFiltersVisible} handleCheckedFilters={this.handleCheckedFilters}
                    />
                }
                <div
                    className={"soco-list"}
                    style={{
                        backgroundColor: "#ffffff",
                        height: "60px",
                    }}
                >
                    <div className="soco-list" style={{marginLeft: "20px", justifyContent: "flex-start"}}>
                    </div>
                    <div className="soco-list" style={{justifyContent: "flex-end"}}>
                        <div className={"soco-list"} style={{margin: window.innerWidth >= 768? "0 30px 0 0" : "-20px 20px 0 0", justifyContent: "flex-start", cursor: filters.length > 0 ? "pointer" : "not-allowed"}} onClick={() => {
                            this.setState({filter_drawer_visible: true});
                        }}> 
                            <div className={"soco-list_item"}><img src="pic/svg/filter.svg" alt={"soco-filter"} /></div> 
                            <div className={"soco-list_item"} style={{margin: "2px 0 0 15px", fontSize: "16px", color: "#000"}}>Filter</div>
                        </div>
                    </div>
                </div>
                <div
                    className={"search-main-page"}
                    style={{paddingBottom: window.innerWidth >= 768? "150px" : "100px"}}
                >
                    <div
                      className={"soco-main-search"}
                    >
                        <div style={{}} className={"soco-logo"}>
                            <a href="https://www.soco.ai" target={"_blank"}>
                                <img
                                    className={"soco-image_logo"}
                                    src={"pic/SOCO_with_company_name.png"}
                                    alt={"soco-logo"}
                                    width={window.innerWidth >= 768? window.innerWidth * 0.2 : "250px"}
                                />
                            </a>
                        </div>
                        <AutoComplete
                            className={"search-box-main"}
                            dataSource={
                                match_loading? 
                                [1, 2, 3, 4, 5].map(s => <AutoComplete.Option key={"loading-" + s} style={{width: "100%"}}>
                                    <Skeleton loading={match_loading} active title={false} paragraph={{rows: 1, width: "100%"}} ></Skeleton>
                                </AutoComplete.Option>)
                                : dataSource.map((item, i) => (
                                    <AutoComplete.Option key={item.text}>{item.text}</AutoComplete.Option>
                                ))
                            }
                            size="large"
                            onChange={(e) => this.handleSearchChange(e)}
                            onSelect={(value) => this.handleSearch(value, "autocomplete")}
                            onMouseDown={() => {}}
                            onBlur={() => {}}
                            value={search_value}
                            defaultActiveFirstOption={false}
                        >
                            <Input
                                className="soco-preview-search"
                                size="large"
                                placeholder={"Ask a question in natural language"}
                                onPressEnter={() => this.handleSearch(search_value, "search_bar")}
                            />
                        </AutoComplete>
                        {/* Quick Buttons to Check Init Search Result and Also Soco Python Package Documentation */}
                        { showQuickButtons && <div className={"search-faq-container soco-list"} style={{justifyContent: "center", fontSize: "16px", flexDirection: "column"}}>
                            <div className="soco-init-search soco-list" style={{}}>
                                <div 
                                    className="soco-list_item soco-init-search_item" 
                                    style={{cursor: ifDist? "pointer" : "not-allowed", color: ifDist? "rgba(0, 0, 0, 0.65)" : "#979797", width: window.innerWidth >= 768? "50%" : "90%"}} 
                                    onClick={() => {
                                        if (ifDist)
                                            this.props.history.push('/search/result?tab=md')
                                    }}
                                >
                                    {ifDist? <span><span className="soco-init-search_icon"><img src="pic/svg/mdist.svg" /></span><span>Meta Distribution</span></span>
                                        : <Tooltip placement="bottom" title={"Please check if you set config values in setting page to hide the meta distribution."}>
                                            <span className="soco-init-search_icon"><img src="pic/svg/mdist_grey.svg" /></span><span>Meta Distribution</span>
                                        </Tooltip>
                                    }
                                </div>
                                {window.innerWidth >= 768 && <div 
                                    className="soco-list_item" 
                                    style={{cursor: ifTree? "pointer" : "not-allowed", color: ifTree? "rgba(0, 0, 0, 0.65)" : "#979797", width: "50%"}} 
                                    onClick={() => {
                                        if (ifTree)
                                            this.props.history.push('/search/result?tab=kt')
                                    }}
                                >
                                    {ifTree? <span style={{marginLeft: "80px"}}><span className="soco-init-search_icon"><img src="pic/svg/ktree.svg" /></span><span>Knowledge Tree</span></span>
                                        : <Tooltip placement="bottom" title={"Please check if you set config values in setting page to hide the knowledge tree."}>
                                            <span style={{marginLeft: "80px"}}><span className="soco-init-search_icon"><img src="pic/svg/ktree_grey.svg" /></span><span>Knowledge Tree</span></span>
                                        </Tooltip>
                                    }
                                </div>}
                            </div>
                            <div className="soco-init-search soco-list" style={{marginTop: window.innerWidth >= 768? "40px" : "initial"}}>
                                {window.innerWidth >= 768 && <div 
                                    className="soco-list_item" 
                                    style={{cursor: ifGraph? "pointer" : "not-allowed", color: ifTree? "rgba(0, 0, 0, 0.65)" : "#979797", width: "50%"}} 
                                    onClick={() => {
                                        if (ifGraph)
                                            this.props.history.push('/search/result?tab=kg')
                                    }}
                                >
                                    {ifGraph? <span><span className="soco-init-search_icon"><img src="pic/svg/kgraph.svg" /></span><span>Knowledge Graph</span></span>
                                        : <Tooltip placement="bottom" title={"Please check if you set config values in setting page to hide the knowledge graph."}>
                                            <span className="soco-init-search_icon"><img src="pic/svg/kgraph_grey.svg" /></span><span>Knowledge Graph</span>
                                        </Tooltip>
                                    }
                                </div>}
                                <a className="soco-list_item soco-init-search_item" style={{width: window.innerWidth >= 768? "50%" : "90%"}} href="https://docs.soco.ai/" target="_blank" style={{color: "rgba(0, 0, 0, 0.65)", marginLeft: window.innerWidth >= 768? "80px" : "initial"}} > 
                                    <span className="soco-init-search_icon"><img src="pic/svg/tutorial.svg" /></span><span>How to Use Soco</span>
                                </a>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        )
    };
}

function mapStateToProps(state) {
    return {
    }
}

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(MainSearch);
