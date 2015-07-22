d3.select("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 1000 500");

var nameLabel = d3.select("#process-name");
var idLabel = d3.select("#process-id");
var childrenLabel = d3.select("#process-children");
var g = d3.select("svg").append("g").attr(
    {"width" : 800, "height" : 500, "transform" : "translate(25, 0)"});

var diagonal =
    d3.svg.diagonal().projection(function(d) { return [ d.y, d.x ]; });

var tree = d3.layout.tree()
               .size([ g.attr("height"), g.attr("width") ])
               .children(function(d) { return d.children; })
               .value(function(d) { return d.name; });

function redraw(data) {
  var nodeData = tree.nodes(data);
  var linkData = tree.links(nodeData);

  var links = g.selectAll("path.link").data(linkData);
  var nodes = g.selectAll("g.node").data(nodeData);

  links.attr("d", diagonal);
  links.enter().append("path").attr("class", "link").attr("d", diagonal);
  links.exit().remove();

  nodes.attr("transform",
             function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform",
            function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .on("mouseover", function(d) {
        d3.select(this).classed("active-node", true);

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
        d3.select(this).classed("active-node", false);

        nameLabel.text("");
        idLabel.text("");
        childrenLabel.text("Hover over a node to see more information " +
                           "about that process.");
      })
      .append("circle")
      .attr("r", 4.0);

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
