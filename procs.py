import psutil
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

        flatprocs = []
        root = {}

        for p in psutil.process_iter():
            proc = {
                # name and ppid are either functions or variables in different
                # versions of psutil.
                "name": p.name() if callable(p.name) else p.name,
                "id": p.pid,
                "parent": p.ppid() if callable(p.ppid) else p.ppid,
                "children": [],
            }

            if p.pid == 1:
                root = proc
            else:
                flatprocs.append(proc)

        self.unflatten(flatprocs, root)
        return json.dumps(root, separators=",:")

    def unflatten(self, flatprocs, proc):
        """
            Utility to convert a flat list of processes with references to
            their parents' PIDs into a tree.
        """

        remainder = []

        for childProc in flatprocs:
            if "parent" in childProc and childProc["parent"] == proc["id"]:
                proc["children"].append(childProc)
            else:
                remainder.append(childProc)

        for childProc in proc["children"]:
            if not remainder:
                break

            remainder = self.unflatten(remainder, childProc)

        return remainder
