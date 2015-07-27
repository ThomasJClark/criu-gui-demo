var targetData = [
		{ name: "localhost", url: "/procs" },
		{ name: "nuc", url: "http://10.18.17.157:8080/procs" },
];

/* Show two trees - one for localhost and one for 10.18.17.157 (the NUC).
 * TODO: don't hardcode this. */
var svgs = d3.select("tr#svg-container").selectAll("svg").data(targetData);

var enter = svgs.enter().append("td");
enter.append("h2").text(function(d) { return d.name; });
enter.append("svg")
    .attr({ width : 800, height : 600 })
    .style("overflow", "visible")
    .append("g")
    .attr({ width : 700, height : 600 })
    .each(function(d) {
      new PSTree(d3.select(this)).listen(d.url);
    });
