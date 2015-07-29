/* Show two trees.
 * TODO: don't hardcode this. */
var targetData = [
    { name: "localhost", address: "" },
    { name: "beaker machine", address: "http://hp-dl360pgen8-08.khw.lab.eng.bos.redhat.com:8080" },
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
