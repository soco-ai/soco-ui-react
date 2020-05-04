import React from 'react';
import {connect} from 'react-redux';
import {AutoComplete, Col, Input, message, Row, Skeleton, Spin, Tabs} from 'antd';
import { StickyContainer, Sticky } from 'react-sticky';
import queryString from 'query-string';
import {botmakerUrl, socoUrl, colors, example} from "../../configs";
import FilterFunction from "./FilterFunction";
import FilterDrawer from "./FilterDrawer";
import KnowledgeTree from "../Graph/KnowledgeTree";
import KnowledgeGraph from "../Graph/KnowledgeGraph";
import QA from "./Result/QA";
import KT from "./Result/KT";
import KG from "./Result/KG";
import ActionCluster from "./Result/ActionCluster";
import ClusterValue from "./Result/ClusterValue";
import ComponentAnalysis from "./Result/ComponentAnalysis";
import GraphValue from "./Result/GraphValue";
import Keywords from "./Result/Keywords";
import TreeValue from "./Result/TreeValue";

const stringify = require('json-stringify-safe');
const {TabPane} = Tabs;


/* Stateless Components */
// Company Logo
const Logo = ({t}) => (
  <div style={{display: "inline-block", top: "20px", left: "20px", marginRight: "20px"}}>
    <img
      onClick={() => t.props.history.push('/')}
      style={{cursor: "pointer"}} width={"120px"}
      src={"pic/SOCO_with_company_name.png"}
      alt={"logo"}/>
  </div>
);

// Search Bar
const SearchContainer = ({t}) => (
  <div 
    className={"soco-search-container"}
    style={{ }}
  >
    <AutoComplete
      className={"search-box-sub"} 
      dataSource={
        t.state.match_loading? 
        [1, 2, 3, 4, 5].map(s => <AutoComplete.Option key={"loading-" + s} style={{width: "100%"}}>
          <Skeleton loading={t.state.match_loading} active title={false} paragraph={{rows: 1, width: "100%"}} ></Skeleton>
        </AutoComplete.Option>)
        : 
        t.state.dataSource.map((item, i) => (
          <AutoComplete.Option key={item.text}>{item.text}</AutoComplete.Option>
        ))
      }
      size="large"
      onChange={(e) => t.handleSearchChange(e)}
      onSelect={(value) => {
        t.props.history.push('/search/result?query=' + value);
        t.handleQuickSearch(value, "autocomplete")
      }}
      onMouseDown={() => {}}
      onBlur={() => {}}
      value={t.state.search_value}
      defaultActiveFirstOption={false}
    >
      <Input
        className="soco-preview-search"
        size="large"
        placeholder={"Ask a question in natural language"} 
        onPressEnter={() => {
          t.props.history.push('/search/result?query=' + t.state.search_value);
          t.handleQuickSearch(t.state.search_value, "search_bar")
        }}
      />
    </AutoComplete>
  </div>
);

// Tab Bar Setting
const renderTabBar = (props, DefaultTabBar) => (
  <Sticky bottomOffset={80}>
    {({ style }) => (
      <DefaultTabBar
        {...props}
        style={{
          ...style,
          zIndex: 1,
          background: "#fff",
          height: window.innerWidth >= 768? "47px" : "44px"
        }} />
    )}
  </Sticky>
);

/* Functions */
// Select colors for meta distribution sections
function selectColor(l) {
  let picked_colors = [], remain_colors = colors;
  for (let i = 0; i < l; i++) {
    let num = Math.floor(Math.random() * remain_colors.length);
    let color = remain_colors[num];
    picked_colors.push(color);
    remain_colors = remain_colors.filter(item => item !== color)
  }
  return picked_colors
}

// Whether show init search result or just for filter update
function getInit(t, tab, ifQuery) {
  fetch(socoUrl + '/api/tasks/soco/init/' + process.env.QUERY_API_KEY, {
    method: 'GET',
  }).then(function (response) {
    return response.json();
  }).then(function (json) {
    let sentiments = {}, filters = [], filters_visible = {}, filterItems = [];

    if (json.hasOwnProperty("sentiments"))
      sentiments = json.sentiments;

    /*** Init call ***/
    if (!ifQuery) {
      // Init Err
      if (json.hasOwnProperty("error")) {
        message.error(json.error);
        t.props.history.push('/');
        return
      }
      let meta_distribution = [], keywords=[], keyword_pad=[];
      // Sentiments
      if (sentiments.category) {
        meta_distribution = meta_distribution.concat(sentiments.category)

        meta_distribution = meta_distribution.filter(m => 
          !m.type.includes("_id") && m.type[0] !== "_"
        );
        meta_distribution = meta_distribution.map(m => {
          m.labels = m.labels.slice(0, 18);
          m.values = m.values.slice(0, 18);
          return m
        });
        meta_distribution.forEach(a => {
          a.colors = selectColor(a.labels.length)
        })
      }
      // Keywords
      if (json.keywords_list.hasOwnProperty("keywords")) {
        keywords = json.keywords_list.keywords;

        keywords = keywords.map((item, index) => {
          item.color = colors[index % 18]
          return item
        });

        if (keywords.length < 90) {
          let keyword_pad_length = Math.ceil(keywords.length / 10);
          for (let i=0; i<keyword_pad_length; i++) {
              keyword_pad.push(i * 10);
          }
        } else {
          keyword_pad = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
        }
      }
      // Links and Nodes
      let graph = t.handleLinkAndNode(json.graph);
      t.setState({
        loading: false,
        keywords, keyword_pad, sentiments, 
        meta_distribution,
        tree: json.tree
      })
      // Graphs
      if (tab === "kg")
        setTimeout(KnowledgeGraph(graph.links, graph.nodes, window.innerWidth * 0.6, "#report-knowledge-graph"), 1000);
      if (tab === "kt")
        setTimeout(KnowledgeTree(json.tree, window.innerWidth * 0.7, "#report-knowledge-tree"), 1000);
    }

    /*** Filters ***/
    if (sentiments.category) {
      filters = filters.concat(sentiments.category);
      filterItems = FilterFunction.CreateFilters(filters, filters_visible);
    }
    t.setState({ 
      filters: filterItems.filters || filters, 
      filters_visible: filterItems.filters_visible || filters_visible
    })
  });
}

// Get task using preview url and decide wether to call init search or query aggregate result
const getTaskAndInit = (t, query, tab, filters_content) => {
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
          let ifQuery = false;

          // Configs
          let configs = json[0].configs.filter(c => c.key === "graph" || c.key === "tree" || c.key === "meta_dist");
          if (configs.length !== 0) {
            configs.forEach(c => {
              if (c.key === "graph") t.setState({showKG: c.value === "true"});
              if (c.key === "tree") t.setState({showKT: c.value === "true"});
              if (c.key === "meta_dist") t.setState({showMD: c.value === "true"});
            })
          }
          t.setState({lang: json[0].lang});

          // Query aggregate result if query feeded in
          if (query) {
            t.handleSearchChange(query);
            t.handleQuickSearch(query, "", filters_content);
            ifQuery = true;
          } 
          
          getInit(t, tab, ifQuery);
        } else {
          message.error("Task not found. Please check if the query api key is correct.");
          t.props.history.push('/');
        }
      })
};

/* Class */
class AggregateSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: "en", 
      query_value: "", search_value: example.promoted_question, dataSource: example.promoted_data,
      n_best: 120, ifEmbed: false, use_embed: true, keep_vectors: true, return_results: true,
      filters: [], target_answers: [], target_meta: [], keywords: [], keyword_pad: [],
      loading: true, match_loading: false,
      answers:[], show_tables: [], a_likes: [], a_dislikes: [], 
      knowledge_graph: {graph: {nodes:[], links: []}, table: [], desc:[], tree:{}}, 
      sentiments:{}, meta_distribution: [], links: [], nodes: {}, tree: {},
      cluster: {}, cluster_pad: [], current_cluster: "", prev_cluster: "", cluster_page: 1,
      keyword_total: 0, current_name: "", wordcloud: "", open_search: false, tab: "qa",
      filters_visible: {}, filters_content: {}, filter_drawer_visible: false,
      showMD: true, showKG: true, showKT: true
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.handleQuickSearch = this.handleQuickSearch.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }
  componentDidMount() {
    let data = queryString.parse(window.location.search);

    // Filters
    let filters_content = {};
    if (data.filters_content) {
      filters_content = JSON.parse(data.filters_content);
      this.setState({ filters_content });
    }
    
    if (!data.query) {
      if (data.tab) {
        this.setState({tab: data.tab});
        getTaskAndInit(this, "", data.tab, filters_content);
      } else {
        message.error("Query not found");
        this.props.history.push('/');
      }
    } else {
      this.setState({query_value: data.query});
      getTaskAndInit(this, data.query, "", filters_content);
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    // Cluster Tab
    if (!this.state.current_cluster && this.state.current_cluster !== prevState.current_cluster && this.state.prev_cluster) {
      // Scroll
      let answerElement = document.getElementById("soco-action-cluster_" + this.state.prev_cluster);
      answerElement.scrollIntoView({ behavior: 'smooth', block: 'center'});
    }
  }
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
        self.setState({
          dataSource: json, match_loading: false
        })
      });
  };
  // Reset several state before search or when errors caught
  handleInitState = () => {
    this.setState({
      sentiments: {},
      meta_distribution: [],
      keywords: [],
      answers: [], show_tables: [],
      knowledge_graph: {graph: {nodes:[], links: []}, table: [], desc:[], tree: {}},
      links: [], nodes: {}, tree: {},
      json_results: {},
      links: [],
      nodes: {},
      keyword_pad: []
    })
  }
  // Aggregate Search
  handleSearch = (value, filters_content) => {
    let self = this;
    let new_filters = filters_content || self.state.filters_content;

    if (value) {
      this.handleInitState();
      this.setState({query_value: value, loading: true});

      let query_args = {
        use_embed: self.state.use_embed,
        keep_vectors: self.state.keep_vectors,
        return_results: self.state.return_results
      }
      let aggs = {
        keywords: {keywords: {}},
        meta_distribution: {distribution: {}},
        knowledge_tree: {knowledge_tree: {}},
        knowledge_graph: {knowledge_graph: {}},
        cluster: {cluster: {
          min_word: self.state.lang === "en"? 1 : 0
        }}
      }
      // Apply filters
      if (Object.entries(new_filters).length !== 0){
        query_args["filters"] = [];
        Object.keys(new_filters).map(k => {
          let filter = {};
          if (new_filters[k].length <= 1) {
            filter["term"] = {};
            filter["term"]["meta." + k + ".keyword"] = new_filters[k][0];
          } else {
            filter["terms"] = {};
            filter["terms"]["meta." + k + ".keyword"] = new_filters[k];
          }
          query_args["filters"].push(filter);
        })
      };

      fetch(socoUrl + '/api/soco-aggregate/' + process.env.QUERY_API_KEY, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            query: {
              query: value,
              n_best: self.state.n_best,
              query_args: query_args,
            },
            uid: "soco_core_dashboard_preview",
            aggs: aggs
          }
        )
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (json) {
          if (!json.hasOwnProperty("error")) {
            let keywords = [], keyword_pad = [], cluster_pad = [],
              meta_distribution=[], tree={}, knowledge_graph={};

            // Meta Dist
            if (json.agg_results.hasOwnProperty("meta_distribution")) {
              meta_distribution = json.agg_results.meta_distribution;

              meta_distribution = meta_distribution.filter(m => !m.type.includes("_id") && m.type[0] !== "_")
              meta_distribution = meta_distribution.map(m => {
                m.labels = m.labels.slice(0, 18);
                m.values = m.values.slice(0, 18);
                return m
              });
              meta_distribution.forEach(a => {
                a.colors = selectColor(a.labels.length)
              })
            }

            // Keywords
            if (json.agg_results.hasOwnProperty("keywords")) {
              keywords = json.agg_results.keywords;
              
              keywords = keywords.map((item, index) => {
                item.color = colors[index % 18]
                return item
              });

              if (keywords.length < 90) {
                let keyword_pad_length = Math.ceil(keywords.length / 10);
                for (let i=0; i<keyword_pad_length; i++) {
                    keyword_pad.push(i * 10);
                }
              } else {
                keyword_pad = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
              }
            }

            // Knowledge Graph & Tree
            if (json.agg_results.hasOwnProperty("knowledge_graph")) {
              knowledge_graph = json.agg_results.knowledge_graph;
              self.handleLinkAndNode(knowledge_graph);
            }
            if (json.agg_results.hasOwnProperty("knowledge_tree")) {
              tree = json.agg_results.knowledge_tree;
            }

            // Answers (QA)
            let answers = json.hasOwnProperty("results")? json.results : [];
            let show_tables = answers.map(a => false);
            let a_likes = [...show_tables];
            let a_dislikes = [...show_tables];

            // Cluster
            let cluster = json.agg_results.hasOwnProperty("cluster")? json.agg_results.cluster : {};
            if (cluster.cluster.length < 40) {
              let cluster_pad_length = Math.ceil(cluster.cluster.length / 10);
              for (let i=0; i<cluster_pad_length; i++) {
                cluster_pad.push(i * 10);
              }
            } else {
              cluster_pad = [0, 10, 20, 30, 40]
            }

            // Tab Control
            if (answers.length !== 0) {
              self.setState({tab: "qa"})
            } else if (Object.entries(cluster).length !== 0) {
              self.setState({tab: "ac"})
            } else if (meta_distribution.length !== 0) {
              self.setState({tab: "md"})
            } else {
              if (window.innerWidth >= 768)
                self.setState({tab: "kt"})
              else
                self.setState({tab: "kw"})
            }

            self.setState({
              loading: false,
              keywords, keyword_pad, tree,
              answers, show_tables, a_likes, a_dislikes,
              meta_distribution, cluster, cluster_pad,
              current_cluster: "", prev_cluster: "", cluster_page: 1
            });
            // Graphs
            if (self.state.tab === "kt")
              setTimeout(KnowledgeTree(tree, window.innerWidth * 0.7, "#report-knowledge-tree"), 1000);
          } else {
            message.error(json.error.exception);
            self.handleInitState();
            self.setState({loading: false});
            self.props.history.push('/');
          }
        })
        .catch(e => {
          console.log("Error", e);
          message.error(e.toString());
          self.handleInitState();
          self.setState({loading: false});
          self.props.history.push('/');
        })
    } else {
      let msg = "Please enter a question";
      message.warning(msg)
    }
  };
  // Preprocess before Aggregate Search
  handleQuickSearch = (value, source, filters_content) => {
    let self = this;

    if (source)
      self.handleSearchChange(value);
    self.handleSearch(value, filters_content);

    // Save search log
    if (source) {
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
        })
    }
  }
  // Compute links and nodes for knowledge graph
  handleLinkAndNode = (data) => {
    var links = data.links; // Compute the distinct nodes from the links.

    links.sort(function(a,b) {
      if (a.source.weight > b.source.weight) {return 1;}
      else if (a.source.weight < b.source.weight) {return -1;}
      else {
        if (a.target.weight > b.target.weight) {return 1;}
        if (a.target.weight < b.target.weight) {return -1;}
        else {return 0;}
      }
    });

    // Any links with duplicate source and target get an incremented 'linknum'
    for (var i=0; i<links.length; i++) {
      if (i != 0 &&
          links[i].source == links[i-1].source &&
          links[i].target == links[i-1].target) {
        links[i].linknum = links[i-1].linknum + 1;
      }
      else {links[i].linknum = 1;};
      links[i].left = false;
      links[i].right = true;
    };

    // Compute the distinct nodes from the links.
    var nodes = {};
    links.forEach(function(link) {
      link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, "root": link.source === data.root || link.type === "co-occur"});
      link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    });
    this.setState({ links, nodes });
    return { links, nodes }
  }
  // Special Changes for Different Tabs
  handleTabChange = (key) => {
    this.setState({tab: key});
    // Knowledge Graph
    if (key === "kg") {
      setTimeout(
        () => {
          if (this.state.links.length !== 0 && Object.entries(this.state.nodes).length !== 0 ) {
            KnowledgeGraph(this.state.links, this.state.nodes, window.innerWidth * 0.6, "#report-knowledge-graph")
          } else {
            let graph = this.handleLinkAndNode(this.state.knowledge_graph.graph);
            if (!document.getElementById("report-knowledge-svg"))
              KnowledgeGraph(graph.links, graph.nodes, window.innerWidth * 0.6, "#report-knowledge-graph")
          }
        }, 1000
      )
    }
    // Knowledge Tree
    if (key === "kt") {
      setTimeout(
        () => {
          if ( Object.entries(this.state.tree).length !== 0 ) {
            if (!document.getElementById("report-knowledge-tree-svg"))
              KnowledgeTree(this.state.tree, window.innerWidth * 0.7, "#report-knowledge-tree")
          }
        }, 1000
      )
    }
    // Q&A
    if (key === "qa") {
      let answerElement = document.getElementById("soco-tabpane-qa");
      answerElement.scrollTop = 0;
    }
  }
  // Download raw json of aggregate result
  handleDownload = (obj, filename) => {
    let result = {};
    if (filename.includes("faq")) {
      result = {
        result: obj
      }
    } else {
      result = {
        query: this.state.query_value,
        result: obj
      }
    }
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(stringify(result, null, 2));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", filename + ".json");
    dlAnchorElem.click();
  }
  // QA related state set
  handleQARelatedArgvs = (type, i, ifShow) => {
    if (type === "show_tables") {
      let show_tables = [...this.state.show_tables];
      show_tables[i] = ifShow;
      this.setState({ show_tables });
    }
    if (type === "a_likes") {
      let a_likes = [...this.state.a_likes];
      a_likes[i] = ifShow;
      this.setState({ a_likes });
    }
    if (type === "a_dislikes") {
      let a_dislikes = [...this.state.a_dislikes];
      a_dislikes[i] = ifShow;
      this.setState({ a_dislikes });
    }
  }
  // Cluster Functions (handlePageChange, onClusterOpen, onClusterClose)
  handlePageChange = (page, pageSize) => {
    this.setState({cluster_page: page});
    let answerElement = document.getElementById("soco-tabpane-ac");
    answerElement.scrollTop = 0;
  }
  onClusterOpen = (topic, page) => {
    this.setState({
      current_cluster: topic, prev_cluster: topic, cluster_page: page 
    });
    // Scroll
    let answerElement = document.getElementById("soco-tabpane-ac");
    answerElement.scrollTop = 0;
  }
  onClusterClose = () => {
    this.setState({current_cluster: ""});
  }
  render() {
    const {
      query_value, loading, keywords, keyword_pad, answers, show_tables, a_likes, a_dislikes,
      meta_distribution, links, nodes, tree, tab, filter_drawer_visible, filters, filters_visible, filters_content,
      showKG, showKT, showMD, cluster, cluster_pad, current_cluster, prev_cluster, cluster_page
    } = this.state;
    return (
      <div className={"soco-report"} style={{fontFamily: "'Nunito Sans', sans-serif", overflow: "hidden"}}>
        <div className={"soco-report-container"} style={{width: "100%", overflow: "hidden"}}>
          {filters.length !== 0 && 
            <FilterDrawer 
              filter_drawer_visible={filter_drawer_visible} filters={filters} filters_visible={filters_visible} filters_content={filters_content}
              onDrawerClose={() => this.setState({filter_drawer_visible: false})} 
              handleFiltersVisible={this.handleFiltersVisible} handleCheckedFilters={this.handleCheckedFilters}
            />
          }
          {/* Search Banner (Search Bar, Logo, Filters, etc.) */}
          <div className={"soco-report-banner soco-aggregate-search-banner"} style={{}}>
            {
              window.innerWidth >= 768?
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%"
                  }}
                >
                  <div className={"soco-list"} style={{marginLeft: "20px", justifyContent: "flex-start", width: "60%"}}>
                    <Logo t={this} />
                    <SearchContainer t={this} />
                    <div className={"soco-list"} style={{marginLeft: "20px", justifyContent: "flex-start", cursor: filters.length > 0 ? "pointer" : "not-allowed"}} onClick={() => {
                      this.setState({filter_drawer_visible: true});
                    }}> 
                      <div className={"soco-list_item"}><img src="pic/svg/filter.svg" alt={"soco-filter"} /></div> 
                      <div className={"soco-list_item"} style={{marginLeft: "15px", fontSize: "16px", color: "#000"}}>Filter</div>
                    </div>
                  </div>
                  <div style={{display: "inline-block", marginRight: "20px"}}>
                  </div>
                </div>
                : <div style={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "20px",
                  width: "100%"
                }}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                    <div style={{display: "inline-block", marginLeft: "20px"}}>
                      <Logo t={this} />
                    </div>
                    <div style={{display: "inline-block", marginRight: "20px"}}>
                      <div className={"soco-list"} style={{justifyContent: "flex-start", cursor: filters.length > 0 ? "pointer" : "not-allowed"}} onClick={() => {
                        this.setState({filter_drawer_visible: true});
                      }}> 
                        <div className={"soco-list_item"}><img src="pic/svg/filter.svg" alt={"soco-filter"} /></div> 
                        <div className={"soco-list_item"} style={{marginLeft: "15px", fontSize: "16px", color: "#000"}}>Filter</div>
                      </div>
                    </div>
                  </div>
                  <div className={""} style={{width: "100%", display: "flex", justifyContent: "center", marginTop: "10px"}}>
                    <SearchContainer t={this} />
                  </div>
                </div>
            }
          </div>
          <div
            className={"soco-report-body soco-aggregate-search"}
            style={{}}
          >
            {/* Link for Download */}
            <a id="downloadAnchorElem" style={{display: "none"}}> </a>
            <Row style={{width: "100%", height: "100%", padding: "5px 20px"}}>
              {/* Left Column */}
              <Col xs={24} sm={24} md={17} lg={17} xl={17} xxl={17} className="soco-left-col" style={{
                height: "100%"
              }}>
                {
                  loading ? 
                  <Spin 
                    spinning={loading} 
                    style={{
                      marginTop: window.innerHeight / 3, 
                      height: "100%", 
                      width: window.innerWidth >= 768 ? window.innerWidth * 0.5 : window.innerWidth * 0.8
                    }} 
                    size="large"
                  >
                  </Spin> : <StickyContainer style={{height: "100%"}}>
                    <Tabs
                      className={"soco-tabs"}
                      activeKey={tab}
                      renderTabBar={renderTabBar}
                      style={{height: "100%"}}
                      onChange={this.handleTabChange}
                    >
                      {/* QA */}
                      {answers.length !== 0 && <TabPane className={"soco-tabpane soco-scroll-tabpane"} id={"soco-tabpane-qa"} tab="QA" key="qa" style={{ height: "100%", overflowY: "scroll"}}>
                        <QA
                          history={this.props.history}
                          loading={loading} answers={answers} query_value={query_value} show_tables={show_tables} a_dislikes={a_dislikes} a_likes={a_likes}
                          handleDownload={this.handleDownload} handleQARelatedArgvs={this.handleQARelatedArgvs} handleQuickSearch={this.handleQuickSearch} 
                        />
                      </TabPane>}
                      {/* Response Cluster */}
                      {
                        Object.entries(cluster).length !== 0 && answers.length !== 0 && <TabPane className={"soco-tabpane soco-scroll-tabpane"} id={"soco-tabpane-ac"} tab={window.innerWidth >= 768? "Response Cluster" : "Cluster"} key="ac" style={{ height: "100%", overflowY: "scroll"}}>
                          <ActionCluster 
                            loading={loading} query_value={query_value} cluster={cluster}
                            answers={answers} handleDownload={this.handleDownload}
                            current_cluster={current_cluster} prev_cluster={prev_cluster} cluster_page={cluster_page}
                            onClusterOpen={this.onClusterOpen} onClusterClose={this.onClusterClose} handlePageChange={this.handlePageChange}
                          />
                        </TabPane>
                      }
                      {/* Meta Distribution */}
                      {showMD && meta_distribution.length !== 0 && <TabPane className={"soco-tabpane soco-scroll-tabpane"} tab={window.innerWidth >= 768? "Meta Distribution" : "Meta"} key="md" style={{ height: "100%", overflowY: "scroll"}}>
                        <ComponentAnalysis 
                          loading={loading} meta_distribution={meta_distribution} query_value={query_value}
                          handleDownload={this.handleDownload} 
                        />
                      </TabPane>}
                      {/* Knowledge Tree */}
                      {showKT && window.innerWidth >= 768 && Object.entries(tree).length !== 0 && 
                        <TabPane className={"soco-tabpane soco-scroll-tabpane"} tab="Knowledge Tree" key="kt" style={{ height: "100%", overflowY: "scroll"}}>
                          <KT
                            loading={loading} query_value={query_value}
                            tree={tree} handleDownload={this.handleDownload}
                          />
                        </TabPane>
                      }
                      {/* Knowledge Graph */}
                      {showKG && window.innerWidth >= 768 && (links.length !== 0 && Object.entries(nodes).length !== 0) &&
                        <TabPane className={"soco-tabpane soco-scroll-tabpane"} tab="Knowledge Graph" key="kg" style={{ height: "100%", overflowY: "scroll"}}>
                          <KG 
                            loading={loading} links={links} nodes={nodes} query_value={query_value} 
                            handleDownload={this.handleDownload}  
                          />
                        </TabPane>
                      }
                      {/* Keywords (Mobile Version) */}
                      {
                        window.innerWidth < 768 && keywords.length > 0 && <TabPane className={"soco-tabpane soco-scroll-tabpane"} tab="Keywords" key="kw" style={{ height: "100%", overflowY: "scroll"}}>
                          <Keywords 
                            history={this.props.history} keywords={keywords} keyword_pad={keyword_pad}
                            query_value={query_value} handleQuickSearch={this.handleQuickSearch} 
                          />
                        </TabPane>
                      }
                    </Tabs>
                  </StickyContainer>
                }
              </Col>
              {/* Right Column */}
              {window.innerWidth >= 768 && <Col className="report-col" xs={24} sm={24} md={7} lg={7} xl={7} xxl={7} style={{padding: "50px 20px 0 30px", height: "100%", overflowY: "scroll"}}>
                {/* Tree or Graph Node Value */}
                { !loading && tab === "kt" && <TreeValue /> }
                { !loading && tab === "kg" && <GraphValue /> }
                {/* Cluster Theme List */}
                { !loading && tab === "ac" && 
                  <ClusterValue 
                    cluster={cluster} cluster_pad={cluster_pad} onClusterOpen={this.onClusterOpen}
                  />
                }
                {/* Keyword List (PC Version) */}                                                        
                {
                  keywords.length > 0 &&
                  <Keywords 
                    history={this.props.history} keywords={keywords} keyword_pad={keyword_pad}
                    query_value={query_value} handleQuickSearch={this.handleQuickSearch} 
                  />
                }
              </Col>}
            </Row>
          </div>
        </div>
      </div>
  )};
}

function mapStateToProps(state) {
  return {
  }
}

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(AggregateSearch);
