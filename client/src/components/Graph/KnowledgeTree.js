import * as d3 from "d3";

const KnowledgeTree = (treeData, width, class_id) => {
  // Size Control, adjust graph height according to the number of nodes and the screen size
  var margin = {top: 20, right: 20, bottom: 20, left: 110},
    width = width - margin.right - margin.left,
    height = treeData.children.length <= 15? 
      window.innerHeight * 0.8 - margin.top - margin.bottom 
      : width * 3.5 - margin.top - margin.bottom;

  // Define several variables about the tree
  var i = 0, duration = 750, root;
  var tree = d3.layout.tree()
    .size([height, width]);
  var h_span = width * 0.001
  var diagonal = d3.svg.diagonal()
    .projection(function (d) {
      return [d.y * h_span, d.x];
    });
  
  // Select an empty div to feed in the tree
  d3.selectAll(class_id + " > #report-knowledge-tree-svg").remove();
  // Select an empty div to feed in node value as tooltip
  d3.selectAll(class_id + " > .report-tooltip").remove();

  var div = d3.select(class_id).append("div")
    .attr("class", "report-tooltip")
    .style("opacity", 0);

  var svg = d3.select(class_id).append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "report-knowledge-tree-svg")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root = treeData;
  root.x0 = height / 2;
  root.y0 = 0;

  // Call update function to draw the tree starting from the root node
  update(root);

  d3.select(self.frameElement).style("height", width * 2.8);

  /* Functions */
  // Draw the tree
  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
      d.y = d.depth * 180;
    });

    // Update the nodes
    var node = svg.selectAll("g.kt_node")
      .data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr("class", "kt_node")
      .attr("transform", function (d) {
        return "translate(" + source.y0 * h_span + "," + source.x0 + ")";
      })
      .on("click", click).
      on("mouseover", function(d) {
        // Parse node info and feed in "TreeValue"
        let left = d.children || d._children ? d.y * h_span + 130 : d.y * h_span - 60
        div.transition()
          .duration(200)
          .style("opacity", .8);
        div.html("<div id='report-tooltip-text'>" + d.name.toUpperCase() + "</div>")
          .style("left", left + "px")
          .style("top", d.x + "px");
          
        document.getElementById("kt-node-name").innerText = d.name.toUpperCase();
        if (d.hasOwnProperty("source"))
          if (d.source.length !== 0)
            document.getElementById("kt-node-value").innerHTML = d["source"][0];
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })

    nodeEnter.append("circle")
      .attr("r", 1e-7)
      .style("fill", function (d) {
        return d._children ? "#7eb2dd" : "#fff";
      })

    nodeEnter.append("text")
      .attr("x", function (d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function (d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function (d) {
        let name = d.name.length > 20 ? d.name.slice(0, 20) + "..." : d.name;
        return name.toUpperCase();
      })
      .style("fill-opacity", 1e-6)
      .call(wrap, 120);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y * h_span + "," + d.x + ")";
      });

    nodeUpdate.select("circle")
      .attr("r", 10)
      .style("fill", function (d) {
        return d._children ? "#7eb2dd" : "#fff";
      });

    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y * h_span + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-7);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

    // Update the links
    var link = svg.selectAll("path.kt_link")
      .data(links, function (d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "kt_link")
      .attr("d", function (d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", diagonal);
  
    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function (d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
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
  
export default KnowledgeTree;
