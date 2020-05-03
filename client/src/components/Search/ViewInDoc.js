import React from 'react';

// Soco Document Viewer URL
const ViewInDoc = ({t, item, meta, text}) => (
  <a 
    href={
      encodeURI(meta.preview_url+"?text="+item.a.value
      +"&title="+meta.title+"&question="+t.props.query_value.replace("?","")
      +"&task_id="+t.props.task_id+"&before="+item.a.highlight_value.split("<b>")[0].split(" ").slice(item.a.highlight_value.split("<b>")[0].split(" ").length-3,item.a.highlight_value.split("<b>")[0].split(" ").length).join(" ")
      +"&after="+item.a.highlight_value.split("</b>")[1].split(" ").slice(1, 3).join(" "))
    }
    className="soco-link"
    target="_blank"
  >
    {text}
  </a>
)

export default ViewInDoc;
