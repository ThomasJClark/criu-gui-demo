import psutil
import json
import web
import time


class Procs:
    """
        This class is responsible for listing the processes on this machine as
        a JSON object, where children processes are stored hierarchically
        beneath their parent processes.
    """

    def GET(self):
        """
            Respond to an HTTP GET request with a stream of events containing
            JSON strings.
        """

        web.header("Content-Type", "text/event-stream")
        web.header("Cache-Control", "no-cache")

        oldroot = {}

        while True:
            flatprocs = []
            root = {}

            for p in psutil.process_iter():
                proc = {
                    # name and ppid are either functions or variables in
                    # different versions of psutil.
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

            if root != oldroot:
                yield "event: procs\n"
                yield "data: " + json.dumps(root, separators=",:") + "\n"
                yield "\n"

                oldroot = root

            # Poll at 100ms intervals
            time.sleep(0.1)

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
