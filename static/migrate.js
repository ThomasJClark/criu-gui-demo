function stringifyProc(proc) {
  return proc.name + " (" + proc.id + ")";
}

/* Migrate a proccess from the given source to the given target.  This function
 * calls the web API to interact with CRIU, and updates the page appropriately
 * when the result of the migration is available. */
function migrate(proc, source, target) {
  if (source == target) {
    console.log("source and target are the same machine.");
    return;
  }

  /* Add an alert to let the user know that the migration has started. */
  var alert = insertAlert();
  alert.classed("alert-info", true);

  var p = alert.append("p");
  p.append("b").text("Info: ");
  p.append("span").text("Migrating ");
  p.append("code").text(stringifyProc(proc));
  p.append("span");
  p.append("span").text(" from ");
  p.append("code").text(source.name);
  p.append("span").text(" to ");
  p.append("code").text(target.name);

  dump(proc, source, target);
}

function dump(proc, source, target) {
  var req = new XMLHttpRequest();

  req.onload = function() {
    console.log(this.responseText);
    var resp = JSON.parse(this.responseText);

    /* Add an alert to the page with info on the result of the dump. */
    var alert = insertAlert();
    var p = alert.append("p");

    if (resp.succeeded) {
      alert.classed("alert-info", true);

      p.append("b").text("Info: ");
      p.append("span").text("Dumped " );
      p.append("code").text(stringifyProc(proc));
      p.append("span").text(" from ");
      p.append("code").text(source.name);

      restore(proc, source, target, resp);
    } else {
      alert.classed("alert-danger", true);

      p.append("b").text("Migration Failed: ");
      p.append("span").text("There was a problem dumping ");
      p.append("code").text(stringifyProc(proc));
      p.append("span").text(" from " );
      p.append("code").text(source.name);

      alert.append("br");
      alert.append("pre").text(resp.why);
    }
  };

  req.open("post", source.address + "/dump?pid=" + proc.id, true);
  req.send();
}

function restore(proc, source, target, resp) {
  var req = new XMLHttpRequest();

  req.onload = function() {
    var resp = JSON.parse(this.responseText);

    /* Add an alert with the result of the restoration. */
    var alert = insertAlert();
    var p = alert.append("p");

    if (resp.succeeded) {
      alert.classed("alert-info", true);

      p.append("b").text("Info: ");
      p.append("span").text("Restored ");
      p.append("code").text(stringifyProc(proc));
      p.append("span").text(" to ");
      p.append("code").text(target.name);
    } else {
      alert.classed("alert-danger", true);

      p.append("b").text("Migration Failed: ");
      p.append("span").text("There was a problem restoring ");
      p.append("code").text(stringifyProc(proc));
      p.append("span").text(" to " );
      p.append("code").text(target.name);

      alert.append("br");
      alert.append("pre").text(resp.why);
    }
  };

  var form = new FormData();
  form.append("data", resp.data);
  form.append("dir", resp.dir);

  req.open("post", target.address + "/restore", true);
  req.send(form);
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
