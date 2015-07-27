var targetData = [
    { name: "localhost", url: "/procs" },
    { name: "nuc", url: "http://10.18.17.157:8080/procs" },
];

/* Show two trees - one for localhost and one for 10.18.17.157 (the NUC).
 * TODO: don't hardcode this. */
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
    .attr({ width : "100%", height : "500" })
    .each(function(d) {
      new PSTree(d3.select(this)).listen(d.url);
    });
