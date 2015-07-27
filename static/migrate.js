function migrate(proc, source, target) {
  console.log("Migration!");

  if (source == target) {
    console.log("source and target are the same machine.");
    return;
  }

  var req = new XMLHttpRequest();

  req.onload = function() {
    var resp = JSON.parse(this.responseText);

    if (resp.succeeded) {
      alert("Success: dir = " + resp.dir);
    } else {
      alert("Failure: " + resp.why);
    }
  };

  req.open("post", source.address + "/dump?pid=" + proc.id, true);
  req.send();
}
