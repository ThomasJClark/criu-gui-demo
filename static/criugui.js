var linkGroup, nodeGroup, diagonal, tree;

function setup() {
  d3.select("svg").attr("preserveAspectRatio", "xMidYMid meet").attr(
      "viewBox", "0 0 1000 500");

  group = d3.select("svg").append("g").attr(
      {"width" : 800, "height" : 500, "transform" : "translate(25, 0)"});

  linkGroup = group.append("g");
  nodeGroup = group.append("g");

  diagonal = d3.svg.diagonal().projection(function(d) { return [ d.y, d.x ]; });

  tree = d3.layout.tree()
             .size([ group.attr("height"), group.attr("width") ])
             .children(function(d) { return d.children; })
             .sort(function(a, b) { return d3.ascending(a.name, b.name); });
}

function redraw(data) {
  /* Update the nodes with the latest data. A node is created for every
   * process on the system, and they're arrange in a tree that shows
   * parent/child processes. */
  var nodeData = tree.nodes(data);
  var nodes = nodeGroup.selectAll("g.node").data(nodeData);

  /* Nodes are drawn as an SVG group containing a circle and a text label,
   * which indicates the name of the process.  */
  var nodeGroups = nodes.enter()
      .append("g")
      .attr("class", "node")
      .on("mouseover", function(d) {
        d3.select(this).classed("active-node", true);

        /* Show more detailed information about this process when it's hovered
         * over. */
        d3.select("#process-name").text(d.name);
        d3.select("#process-id").text(d.id);
        if (d.children) {
          d3.select("#process-children")
              .text(d.children.map(function(d) { return d.name; }).join(", "));
        } else {
          d3.select("#process-children").text("none");
        }
      })
      .on("mouseout", function(d) {
        d3.select(this).classed("active-node", false);

        d3.select("#process-name").text("");
        d3.select("#process-id").text("");
        d3.select("#process-children")
            .text("Hover over a node to see more information " +
                  "about that process.");
      });

  nodeGroups.append("circle").attr({r: 3.0});
  nodeGroups.append("text").attr({x: 8, y: 3});

  nodes.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
  nodes.each(function () { d3.select(this).select("text").text(); });
  nodeGroup.selectAll("text").text(function(d) { return d.name; });

  nodes.exit().remove();

  /* Update the links between the nodes with the latest data. */
  var linkData = tree.links(nodeData);
  var links = linkGroup.selectAll("path.link").data(linkData);

  /* Links are drawn as SVG paths using d3's svg.diagonal helper. */
  links.enter().append("path").attr("class", "link");
  links.attr("d", diagonal);
  links.exit().remove();
}

function reload() {
  /* Reload the process data and redraw the tree every 500 milliseconds. */
  d3.json("/procs", function(error, data) {
    if (error) {
      console.warn(error);
    } else {
      redraw(data);
    }

    window.setTimeout(reload, 500);
  });
}

setup();
reload();
