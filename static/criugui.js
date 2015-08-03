/* Show two trees.
 * TODO: don't hardcode this. */
var targetData = [
    { name: "localhost", address: "http://127.0.0.1:8080" },
    { name: "other machine", address: "http://some-other-machine-also-running-criugui.py:8080" },
];

var pstrees = d3.select("#pstree-container").selectAll("div").data(targetData);
var enter = pstrees.enter().append("div")
    .classed("col-md-6", true)
    .append("div")
    .classed({"panel" : true, "panel-default" : true, "pstree" : true});

enter.append("div")
    .classed("panel-heading", true)
    .text(function(d) { return d.name; });

enter.append("svg")
    .classed("panel-body", true)
    .attr({ width : "100%", height : "450" })
    .each(function(d) {
      new PSTree(d3.select(this)).listen(d.address);
    });
