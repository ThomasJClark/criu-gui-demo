import procfs.procfs as procfs
import json


class Procs:
    def GET(self):
        pidstats = procfs.pidstats()
        flatprocs = []
        root = {}

        print len(pidstats.processes), "processes"

        for pid in pidstats.processes:
            stat = pidstats.processes[pid]["stat"]

            proc = {
                "name": stat["comm"],
                "id": stat["pid"],
                "parent": stat["ppid"],
                "children": [],
            }

            if stat["pid"] == 1:
                root = proc
            else:
                flatprocs.append(proc)

        self.unflatten(flatprocs, root)
        return json.dumps(root, separators=",:")

    def unflatten(self, flatprocs, proc):
        del proc["parent"]
        for proc2 in flatprocs:
            if proc2["parent"] == proc["id"]:
                proc["children"].append(proc2)
                flatprocs.remove(proc2)
                self.unflatten(flatprocs, proc2)
