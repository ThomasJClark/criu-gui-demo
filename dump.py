import web
import tempfile
import socket
import os
import json
from pycriu import rpc as criu

CRIU_ADDR = "/var/run/criu-service.socket"


class Dump:
    """
        This class dumps a process using CRIU when it receives an HTTP POST.
    """

    def POST(self):
        """
            Attempt to dump a process, where the PID is given in the URL
            parameter "pid".
        """

        web.header("Content-Type", "application/json")

        params = web.input()
        tempdir = tempfile.mkdtemp()

        if "pid" not in params or not params["pid"].isnumeric():
            result = {"succeeded": False, "why": "No PID specified"}
            raise web.internalerror(json.dumps(result, separators=",:"))

        try:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_SEQPACKET)
            sock.connect(CRIU_ADDR)
        except socket.error as e:
            result = {"succeeded": False, "why": e.strerror}
            raise web.internalerror(json.dumps(result, separators=",:"))

        # Send a request to dump the specified process
        req = criu.criu_req()
        req.type = criu.DUMP
        req.opts.pid = int(params["pid"])
        req.opts.shell_job = True
        req.opts.images_dir_fd = os.open(tempdir, os.O_DIRECTORY)
        sock.send(req.SerializeToString())

        # Get the response from the criu service.  This should indicate if the
        # dump succeeded.
        resp = criu.criu_resp()
        resp.ParseFromString(sock.recv(1024))
        sock.close()

        if resp.success:
            result = {"succeeded": True, "dir": tempdir}
            return json.dumps(result, separators=",:")
        else:
            result = {"succeeded": False, "why": os.strerror(resp.cr_errno)}
            raise web.internalerror(json.dumps(result, separators=",:"))
