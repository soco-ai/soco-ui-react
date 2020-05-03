import * as d3 from "d3";

const KnowledgeGraph = (links, nodes, width, class_id) => {
  // Size Control, adjust graph height according to the number of nodes
  var w = width,
    h = Object.keys(nodes).length * 16 <= 500? 500 : Object.keys(nodes).length * 16;

  // d3 force setting
  var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([w, h])
    .gravity(.1)
    .linkDistance((link) => {
      if (link.type === "co-occur") return 0
      else return 20
    })
    .linkStrength(0.5)
    .friction(0.85)
    .charge(-w)
    .chargeDistance(w)
    .on("tick", tick)
    .start();

  // Select the empty div and set attributes and style setting
  d3.selectAll(class_id + " > #report-knowledge-svg").remove();
  var svg = d3.select(class_id).append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("position", "absolute")
    .style("border", "1px solid #d8d8d8")
    .style("border-radius", "20px")
    .attr("id", "report-knowledge-svg");

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
    .data(["co-occur", "end"])
    .enter().append("marker")
    .attr("id", function(d){ return 'kg-marker_' + d})
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -0.5)
    .attr("markerWidth", 7)
    .attr("markerHeight", 7)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");

  // Link Setting
  var path = svg.append("g").selectAll("path")
    .data(force.links())
    .enter().append("path")
    .attr("class", function(d) { return "kg-link " + d.type; })
    .attr("id", function(d, i) { return "kg-linkId_" + i; })
    .attr("marker-end", function(d) {
      return d.type === "co-occur"? "url(#kg-marker_co-occur)" : "url(#kg-marker_end)";
    })

  // Node Setting
  var circle = svg.append("g").selectAll("circle")
    .data(force.nodes())
    .enter().append("circle")
    .attr("class", "kg-node")
    .attr("r", (d) => {
      return d.hasOwnProperty("root")? d.root? 20: 13: 5;
    })
    .style("fill", (d) => {
      return d.hasOwnProperty("root")? "#ffffff": "#beb7a4";
    })
    .style("stroke", (d) => {
      return "beb7a4";
    })
    .style("stroke-width", (d) => {
      return d.hasOwnProperty("root")? d.root? "8px": "6px": "0px";
    })
    .on("mouseover", function(d) {
      // Parse node info and feed in "GraphValue"
      let list_html = [];
      links.map(x=> {
        if (x.target.name === d.name && x.sents.length !== 0 ) {
          list_html.push("<div style=\"margin-bottom: 15px\">" + x.sents[0] + "</div>")
        }
      });
      if (list_html.length > 0 ) {
        document.getElementById("kg-node-name").innerText = d.name.toUpperCase();
        document.getElementById("kg-node-value").innerHTML = "<div>" + list_html.join(" ") + "</div>";
      } else { }
    })
    .on("mouseout", function(d) {
    })
    .call(force.drag);

  // Node Text Setting
  var text = svg.append("g").selectAll("g")
    .data(force.nodes())
    .enter().append("g");
  text.append("text")
    .attr("x", "0")
    .attr("y", "20")
    .style("font-size", (d) => {
      return d.hasOwnProperty("root")? d.root? "22px": "16px": "12px";
    })
    .style("fill", (d) => {
      return "#000";
    })
    .text(function(d) { 
      return d.name.toUpperCase() 
    })
    .on("mouseover", function(d) {
      // Parse node info and feed in "GraphValue"
      let list_html = [];
      links.map(x=> {
        if (x.target.name === d.name && x.sents.length !== 0 ) {
          list_html.push("<div style=\"margin-bottom: 15px\">" + x.sents[0] + "</div>")
        }
      });
      if (list_html.length > 0 ) {
        document.getElementById("kg-node-name").innerText = d.name.toUpperCase();
        document.getElementById("kg-node-value").innerHTML = "<div>" + list_html.join(" ") + "</div>";
      } else { }
    })
    .on("mouseout", function(d) {
    })
    .call(wrap, 120)
    .call(getBB);

  // Node Text Background
  text.insert("rect","text")
    .attr("width", function(d){return d.bbox.width})
    .attr("height", function(d){return d.bbox.height + 20})
    .style("fill", function(d){
      return d.hasOwnProperty("root")? d.root? "#f6ae2d": "#59c3c3": "#f2f2f2";
    });

  // Get box
  function getBB(selection) {
    selection.each(function(d){
      d.bbox = this.getBBox();
      d.bbox.x = 1;
      d.bbox.y = 1;
    })
  }

  /* Functions */
  // Transform of Link, Node and Text on Node
  function tick() {
    path.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = 0;  //linknum is defined above
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    });

    circle.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    text.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  // Wrap text
  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.0, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0, //parseFloat(text.attr("dy")),
        tspan = text.text(null)
                  .append("tspan")
                  .attr("x", x)
                  .attr("y", y)
                  .attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
        }
      }
    });
  }
}

export default KnowledgeGraph;
