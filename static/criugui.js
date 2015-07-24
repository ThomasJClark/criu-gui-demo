var linkGroup, nodeGroup, diagonal, tree, dragging = false;

var nodeLabelOffset = { x:6, y:3 };

function setup() {
  group = d3.select("svg").append("g").attr(
      {"width" : 800, "height" : 600, "transform" : "translate(25, 0)"});

  linkGroup = group.append("g");
  nodeGroup = group.append("g");

  diagonal = d3.svg.diagonal().projection(function(d) { return [ d.y, d.x ]; });

  tree = d3.layout.tree()
             .size([ group.attr("height"), group.attr("width") ])
             .children(function(d) { return d.children; })
             .sort(function(a, b) { return d3.ascending(a.name, b.name); });

  drag = d3.behavior.drag()
      .on("dragstart", function(d) {
        dragging = true;

        this["ghost-x"] = nodeLabelOffset.x;
        this["ghost-y"] = nodeLabelOffset.y;

        /* When a node is dragged, crated a new "ghost" node with the same text
         * for the user to drag around. */
        d3.select(this)
            .classed("dragging-node", true)
            .append("text")
            .text(d.name)
            .classed("ghost", true)
            .attr("transform", "translate(" + this["ghost-x"] + "," + this["ghost-y"] + ")");
      })
      .on("drag", function(d) {
        this["ghost-x"] += d3.event.dx;
        this["ghost-y"] += d3.event.dy;

        /* Move the ghost node as the user drags. */
        d3.select(this)
            .select("text.ghost")
            .attr("transform", "translate(" + this["ghost-x"] + "," + this["ghost-y"] + ")");

        /* If dragging over a migration target, highlight that target to show
         * that it can be dropped onto. */
        var target = getMigrationTarget(d3.mouse(d3.select("html").node()));
        d3.selectAll(".migration-target").classed("migration-target-active", false);
        target.classed("migration-target-active", true);
      })
      .on("dragend", function() {
        dragging = false;

        var target = getMigrationTarget(d3.mouse(d3.select("html").node()));
        if (target.node()) {
          /* If it was dropped onto a migration target, perform the migration.
           * (TODO) */
          target.classed("migration-target-active", false);
          d3.select(this).select("text.ghost")
              .transition()
              .duration(1000)
              .ease("cubic-out")
              .style("opacity", 0)
              .remove();
        } else {
          /* If the drag was cancelled, move the ghost node back to its original
           * position and remove it. */
          d3.select(this).select("text.ghost")
              .transition()
              .duration(500)
              .ease("cubic-out")
              .attr("transform", "translate(" + nodeLabelOffset.x + "," + nodeLabelOffset.y + ")")
              .style("opacity", 0)
              .remove();

          d3.select(this).classed({"active-node" : false, "dragging-node" : false});
        }
      });


  /* Wait for server-sent events containing the process data and redraw the
   * tree whenever new data arrives. */
  new EventSource("/procs").addEventListener("procs", function(e) {
    redraw(JSON.parse(e.data));
  });
}


/* Returns a d3.js selection of the item representing the migration target
 * below the mouse position, if the mouse is indeed over a migration target. */
function getMigrationTarget(mouse) {
  var target;

  d3.selectAll(".migration-target").each(function() {
    var bbox = this.getBoundingClientRect();
    if (mouse[0] >= bbox.left && mouse[0] <= bbox.right &&
        mouse[1] >= bbox.top && mouse[1] <= bbox.bottom) {
      target = this;
    }
  });

  return d3.select(target);
}


function redraw(data) {
  /* Update the nodes with the latest data. A node is created for every
   * process on the system, and they're arrange in a tree that shows
   * parent/child processes. */
  var nodeData = tree.nodes(data);
  var nodes = nodeGroup.selectAll("g.node").data(nodeData, function(d) { return d.id; });

  /* Nodes are drawn as an SVG group containing a circle and a text label,
   * which indicates the name of the process.  */
  var nodeGroups = nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 0)
      .call(drag)
      .on("mouseover", function(d) {
        if (dragging) return;

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
      });

  nodeGroups.append("circle").attr({r: 3.0});
  nodeGroups.append("text").attr(nodeLabelOffset).classed("node-label", true);

  nodes
      .transition()
      .duration(200)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  nodes.each(function () { d3.select(this).select("text.node-label").text(); });
  nodeGroup.selectAll("text.node-label").text(function(d) { return d.name; });

  nodes.exit()
      .transition()
      .duration(200)
      .style("opacity", 0)
      .remove();

  /* Update the links between the nodes with the latest data. */
  var linkData = tree.links(nodeData);
  var links = linkGroup.selectAll("path.link").data(linkData, function(d) { return d.target.id; });

  /* Links are drawn as SVG paths using d3's svg.diagonal helper. */
  links.enter()
      .append("path")
      .attr("class", "link")
      .style("opacity", 0);

  links
      .transition()
      .duration(200)
      .attr("d", diagonal)
      .style("opacity", 1);

  links.exit()
      .transition()
      .duration(200)
      .style("opacity", 0)
      .remove();
}

setup();
