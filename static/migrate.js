/* Migrate a proccess from the given source to the given target.  This function
 * calls the web API to interact with CRIU, and updates the page appropriately
 * when the result of the migration is available. */
function migrate(proc, source, target) {
  if (source == target) {
    console.log("source and target are the same machine.");
    return;
  }

  var req = new XMLHttpRequest();

  req.onload = function() {
    var resp = JSON.parse(this.responseText);

    /* Add an alert to the page with info on the progress of the dump. */
    var alert = insertAlert();
    var p = alert.append("p");

    if (resp.succeeded) {
      alert.classed("alert-info", true);

      p.append("strong").text("Info: ");
      p.append("code").text(proc.name);
      p.append("span").text(" dumped to " );
      p.append("code").text(resp.dir);
      p.append("span").text(" on ");
      p.append("code").text(source.name);
    } else {
      alert.classed("alert-danger", true);

      p.append("strong").text("Migration Failed: ");
      p.append("span").text("There was a problem dumping ");
      p.append("code").text(proc.name);
      p.append("span").text(" on " );
      p.append("code").text(source.name);

      alert.append("br");
      alert.append("pre").text(resp.why);
    }
  };

  req.open("post", source.address + "/dump?pid=" + proc.id, true);
  req.send();
}

/* Add an alert div to the page with some preset styles and a close button. */
function insertAlert() {
  var alert = d3.select("#alerts").insert("div", ":first-child")
      .attr("role", "alert")
      .classed({ "alert" : true, "alert-dismissible" : true });

  alert.append("a")
      .attr("data-dismiss", "alert")
      .classed("close", true)
      .text("×");

  return alert;
}
