import React from 'react';
import {Button, Icon, message, Pagination} from "antd";
import {Table} from "react-bootstrap";
import Code from "../Code";
import ViewInDoc from "../ViewInDoc";
import parse from 'html-react-parser';
import {socoUrl} from "../../../configs";
const moment = require('moment');

/* QA stateless components */
// Extract two keywords of each answer
const MetaKeyword = ({t, item, i}) => (
  item.meta.hasOwnProperty("keywords")? 
    item.meta.keywords.length !== 0 &&
    item.meta.keywords.slice(0, 2).map((k, j) => {
      if (!k)
        return
      if (i === 0)
        return <span 
          key={k.keyword + k.score} 
          style={{cursor: "pointer", color: "white", backgroundColor: "#918ef4", borderRadius: "20px", margin: "0 10px", padding: "5px 10px"}}
          onClick={()=>{
            t.props.history.push('/search/result?query=' + k.keyword);
            t.props.handleQuickSearch(k.keyword, "keywords")
          }} 
        >
          {k.keyword.toUpperCase()}
        </span>;
      else 
        return j === 0? <span 
          key={k.keyword + k.score} 
          style={{color: "#918ef4", cursor: "pointer"}}
          onClick={()=>{
            t.props.history.push('/search/result?query=' + k.keyword);
            t.props.handleQuickSearch(k.keyword, "keywords")
          }} 
        >{k.keyword.toUpperCase()}</span> 
        : <span 
          key={k.keyword + k.score} 
          style={{color: "#918ef4", cursor: "pointer"}}
          onClick={()=>{
            t.props.history.push('/search/result?query=' + k.keyword);
            t.props.handleQuickSearch(k.keyword, "keywords")
          }} 
        >{"  |  " + k.keyword.toUpperCase()}</span>;
    }) : null
)

// Format the file update time
const UpdateTime = ({item}) => (
  item.meta.hasOwnProperty("Published Date (GMT-04:00) New York")?
    <div style={{color: "#979797"}}>
      {window.innerWidth >= 768? "Updated: " : ""}<span>{moment(item.meta["Published Date (GMT-04:00) New York"]).format("YYYY-MM-DD")}</span>
    </div> 
    : item.meta.hasOwnProperty("Published_Date_(GMT-04:00)_New_York")?
    <div style={{color: "#979797"}}>
      {window.innerWidth >= 768? "Updated: " : ""}<span>{moment(item.meta["Published_Date_(GMT-04:00)_New_York"]).format("YYYY-MM-DD")}</span>
    </div> 
    : <div style={{color: "#979797"}}>
      {window.innerWidth >= 768? "Updated: " : ""}<span>{moment(item.creation_time).format("YYYY-MM-DD")}</span>
    </div>
)

// Component that contains file update time and meta keywords/file viewer link
const Meta = ({t, item, i}) => (
  window.innerWidth >= 768? 
    <div className="soco-list" style={{margin: "15px 0 10px", fontSize: "14px"}}>
      <div className="soco-list_item" style={{width: "20%"}}>
      </div>
      <div className="soco-list_item" style={{width: "60%", textAlign: "center"}}>
        <MetaKeyword t={t} item={item} i={i}/>
      </div>
      <div className="soco-list_item" style={{width: "20%", textAlign: "right"}}>
        <UpdateTime item={item} />
      </div>
    </div> 
    : <div style={{margin: "15px 0 10px", fontSize: "14px"}}>
      <div className="soco-list">
        <div className="soco-list_item" style={{width: "50%"}}><UpdateTime item={item} /></div>
        <div className="soco-list_item" style={{width: "50%", textAlign: "right"}}><ViewInDoc t={t} item={item} meta={item.meta} /></div>
      </div>
    </div>
)

// Feedback buttons
const Action = ({t, answer, i}) => (
  <div style={{textAlign: window.innerWidth >= 768? "right" : "center"}} className={""}>
    {window.innerWidth >= 768 && <span style={{fontSize: "15px", marginRight: "10px"}}>Is this useful?</span>}
    <Button 
      onClick={() => t.feedback(answer, "positive")} size={"small"} shape={"round"}
      style={{marginRight: "5px", width: "60px"}} className="soco-btn"
      onMouseOver={() => t.props.handleQARelatedArgvs("a_likes", i, true)}
      onMouseOut={() => t.props.handleQARelatedArgvs("a_likes", i, false)}
    >
      {t.props.a_likes[i]? <img src={"pic/svg/like_selected.svg"} width={"17px"}/> 
      : <img src={"pic/svg/like.svg"} width={"17px"} />}
    </Button>
    <Button 
      onClick={() => t.feedback(answer, "negative")} size={"small"} shape={"round"}
      style={{marginRight: "5px", width: "60px"}} className="soco-btn"
      onMouseOver={() => t.props.handleQARelatedArgvs("a_dislikes", i, true)}
      onMouseOut={() => t.props.handleQARelatedArgvs("a_dislikes", i, false)}
    >
      {t.props.a_dislikes[i]? <img src={"pic/svg/dislike_selected.svg"} width={"17px"}/> 
      : <img src={"pic/svg/dislike.svg"} width={"17px"} />}
    </Button>
  </div>
);

// Draw a table to list meta details
const MetaTable = ({t, item, meta, show_tables, i}) => (
  <div style={{marginTop: "10px"}}>
    {
      Object.keys(meta).filter(m => typeof meta[m] === "string" && meta[m] && m[0] !== "_").length !== 0 && (show_tables[i]? 
      <div className="soco-list soco-expand" style={{justifyContent: "flex-end", textAlign: "right", color: "#979797"}} >
        <div style={{display: "inline-block", marginTop: "5px", cursor: "pointer"}} onClick={() => t.props.handleQARelatedArgvs("show_tables", i, false)}><img src="pic/svg/less.svg" /></div>
        <div style={{display: "inline-block", marginLeft: "10px", cursor: "pointer"}} onClick={() => t.props.handleQARelatedArgvs("show_tables", i, false)}>Hide Meta Table </div>
      </div> 
      : <div className="soco-list soco-expand" style={{justifyContent: "flex-end", textAlign: "right", color: "#979797"}}>
        <div style={{display: "inline-block", marginTop: "-5px", cursor: "pointer"}} onClick={() => t.props.handleQARelatedArgvs("show_tables", i, true)}><img src="pic/svg/more.svg" /></div>
        <div style={{display: "inline-block", marginLeft: "10px", cursor: "pointer"}} onClick={() => t.props.handleQARelatedArgvs("show_tables", i, true)}>Show Meta Table</div>
      </div>)
    }
    {
      show_tables[i] && Object.keys(meta).filter(m => typeof meta[m] === "string" && meta[m] && m[0] !== "_" ).length !== 0 &&
      <Table style={{fontSize: window.innerWidth >= 768? "14px" : "12px"}} responsive>
        <thead>
          <tr>
            <th scope="col">Meta Keys</th>
            <th scope="col">Values</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(meta).map((m, j) => {
              if (typeof meta[m] === "string" && meta[m] && m[0] !== "_")
                if (m === "preview_url")
                {
                  return (
                    <tr key={m + j.toString()}>
                      <th scope="row">{m}</th>
                      <td>
                        <ViewInDoc 
                          t={t} item={item} meta={meta}
                        />
                      </td>
                    </tr>
                  )
                }
                else {
                  return (
                    <tr key={m + j.toString()}>
                      <th scope="row">{m}</th>
                      <td>{meta[m]}</td>
                    </tr>
                  )
                }
            })
          }
        </tbody>
      </Table>
    }
  </div>
)

// Content under "QA" Tab
class QA extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_code: false, page: 1
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
    if (this.props.answers.length !== 0) {
      let answers = [...this.props.answers];
      let new_answers = answers.map(a => {
        delete a["term_scores"];
        return a
      });
      this.props.handleDownload(new_answers, "qa_" + moment().valueOf().toString())
    }
    else
      message.warning("No anwsers")
  }
  handlePageChange = (page, pageSize) => {
    this.setState({page});
    let answerElement = document.getElementById("soco-tabpane-qa");
    answerElement.scrollTop = 0;
  }
  // Call feedback api to save user feedback of the answer's quality in DB
  feedback = (item, answer) => {
    fetch(socoUrl + '/api/feedback/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          type: "qa_result",
          query: this.props.query_alue,
          response: item,
          feedback: answer,
          user: "soco_core_dashboard_preview",
          query_api_key: process.env.QUERY_API_KEY
        }
      )
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        message.success("Thank you for your feedback!")
      })
  };
  render() {
    const {
      show_code, page
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
            "uid": "soco_core_dashboard_preview"
          }}
          python={"from soco import QA\nprint(QA.get_answer(" + this.props.query_value + "))"}
        />}
        {/* Different Styles between the Top 1 Result and the Rest */}
        {
          this.props.answers.length !== 0? this.props.answers.slice((page - 1) * 10, page * 10).map((item, i) => {
            if ((page - 1) * 10 + i === 0) {
              return (
                <div key={i} style={{marginBottom: "40px"}}>
                  <div style={{}} id={"answer-" + ((page - 1) * 10 + i).toString()}>
                    <div style={{fontWeight: 600, marginBottom: "15px"}} id="answer-0-title">{item.a.value}</div>
                    {
                      item.a.highlight_value.length > 0 &&
                        <div style={{marginBottom: "15px"}} id="answer-0-content">
                            {parse(item.a.highlight_value.split("<b>").join('<b style="color: black;">'))}
                        </div>
                    }
                    {
                      item.hasOwnProperty("meta") && (item.meta.hasOwnProperty("URL") || item.meta.hasOwnProperty("preview_url")) 
                      && <div className="soco-list">
                        <div className="soco-list_item soco-url-list_item" style={{width: "70%"}}>
                          {item.meta.hasOwnProperty("URL") && 
                            <a href={item.meta["URL"]} style={{}} target="_blank" className="soco-link">{item.meta["URL"]}</a>}
                        </div>
                        <div className="soco-list_item" style={{width: "30%", textAlign: "right"}}>
                          {window.innerWidth >= 768 && item.meta.hasOwnProperty("preview_url") && <ViewInDoc t={this} item={item} meta={item.meta}/>}
                        </div>
                      </div>
                    }
                    {item.hasOwnProperty("meta") && <Meta t={this} item={item} i={0} />}
                    <Action t={this} answer={item.a.value} i={0}/>
                  </div>
                  {item.hasOwnProperty("meta") && <MetaTable t={this} item={item} meta={item.meta} show_tables={this.props.show_tables} i={0}/>}
                </div>
              )
            } else {
              return (
                <div key={i} style={{
                  marginBottom: "35px"
                }} id={"answer-" + ((page - 1) * 10 + i).toString()} className="report-qa-answer">
                  {
                    item.a.highlight_value.length > 0 &&
                      <div style={{marginBottom: "15px"}}>
                          {parse(item.a.highlight_value.split("<b>").join('<b style="color: black;">'))}
                      </div>
                  }
                  {
                    item.hasOwnProperty("meta") && (item.meta.hasOwnProperty("URL") || item.meta.hasOwnProperty("preview_url")) 
                    && <div className="soco-list">
                      <div className="soco-list_item soco-url-list_item" style={{width: "70%"}}>
                        {item.meta.hasOwnProperty("URL") && 
                          <a href={item.meta["URL"]} style={{}} target="_blank" className="soco-link">{item.meta["URL"]}</a>}
                      </div>
                      <div className="soco-list_item" style={{width: "30%", textAlign: "right", marginLeft: "15px"}}>
                        {window.innerWidth >= 768 && item.meta.hasOwnProperty("preview_url") && 
                        <ViewInDoc t={this} item={item} meta={item.meta} text={"View in Document"}/>}
                      </div>
                    </div>
                  }
                  {item.hasOwnProperty("meta") && <Meta t={this} item={item} i={(page - 1) * 10 + i} />}
                  <Action t={this} answer={item.a.value} i={(page - 1) * 10 + i}/>
                  {item.hasOwnProperty("meta") && <MetaTable t={this} item={item} meta={item.meta} show_tables={this.props.show_tables} i={(page - 1) * 10 + i}/>}
                </div>
              )
            }
          }) : <div style={{fontSize: "18px", textAlign: "center", fontStyle: "italic", color: "#979797", margin: "10px 0 20px"}}>Ready for Search</div>
        }
        {
          this.props.answers.length !== 0 && 
          <Pagination
            style={{width: "100%", textAlign: window.innerWidth >= 768? "right" : "center", marginBottom: "20px"}}
            onChange={this.handlePageChange} 
            total={this.props.answers.length}
            pageSize={10}
            size={window.innerWidth < 768? "small" : ""}
          />
        }
      </div>
    )
  }
}

export default QA;
