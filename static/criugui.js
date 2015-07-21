d3.select("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 1000 500");

var nameLabel = d3.select("#process-name");
var idLabel = d3.select("#process-id");
var childrenLabel = d3.select("#process-children");
var g = d3.select("svg").append("g").attr("width", 1000).attr("height", 500);

var diagonal = d3.svg.diagonal();

var tree = d3.layout.tree()
               .size([ g.attr("width"), g.attr("height") ])
               .children(function(d) { return d.children; })
               .value(function(d) { return d.name; });

function redraw(data) {
  console.log("redrawing...");

  var nodeData = tree.nodes(data);
  var linkData = tree.links(nodeData);

  var links = g.selectAll("path.link").data(linkData);
  var nodes = g.selectAll("circle.node").data(nodeData);

  links.attr("d", diagonal);

  links.enter()
      .append("path")
      .attr("class", "link")
      .attr("d", diagonal)
      .style("fill", "none")
      .style("stroke", "#dddddd");

  links.exit().remove();

  nodes.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  nodes.enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 8.0)
      .style("fill", "#333333")
      .on("mouseover", function(d) {
        d3.select(this).style("fill", "teal");
        nameLabel.text(d.name);
        idLabel.text(d.id);
        if (d.children) {
          childrenLabel.text(
              d.children.map(function(d) { return d.name; }).join(", "));
        } else {
          childrenLabel.text("none");
        }
      })
      .on("mouseout", function(d) {
        d3.select(this).style("fill", "#333333");
        nameLabel.text("");
        idLabel.text("");
        childrenLabel.text(
            "Hover over a node to see more information about that process.");
      });

  nodes.exit().remove();
}

function reload() {
  d3.json("/procs", function(error, data) {
    if (error) {
      console.warn(error);
    } else {
      redraw(data);
    }

    window.setTimeout(reload, 500);
  });
}

reload();
