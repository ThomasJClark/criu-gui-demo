import procfs.procfs as procfs
import json


class Procs:
    """
        This class is responsible for listing the processes on this machine as
        a JSON object, where children processes are stored hierarchically
        beneath their parent processes.
    """

    def GET(self):
        """
            Respond to an HTTP GET request with a JSON string.
        """

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
        """
            Utility to convert a flat list of processes with reference to their
            parents' PIDs into a tree.
        """

        del proc["parent"]
        for proc2 in flatprocs:
            if proc2["parent"] == proc["id"]:
                proc["children"].append(proc2)
                flatprocs.remove(proc2)
                self.unflatten(flatprocs, proc2)
