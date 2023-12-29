import os
import random
from datetime import datetime


def proton_random(action, connect_list=None):
    # Connect
    openvpn_gui_path = r"C:\Program Files\OpenVPN\bin\openvpn-gui.exe"
    os.popen("taskkill.exe /F /IM openvpn.exe").read()
    if connect_list is not None:
        location = random.choice(connect_list)
        os.popen(f'"{openvpn_gui_path}" --command {action} "{location}"').read()

        # Write Log
        log = os.path.join(os.getcwd(), "proton-log.txt")
        log_datetime = f"{datetime.now():%Y-%m-%d %H:%M:%S} {location}"
        log_datetime2 = "\n".join(["", log_datetime])
        if os.path.isfile(log):
            with open(log, "a") as f:
                f.write(log_datetime2)
        else:
            with open(log, "w") as f:
                f.write(log_datetime)
        return location

    else:
        os.popen(f'"{openvpn_gui_path}" --command {action}')


directory_path = r"C:\Program Files\OpenVPN\config"
files = os.listdir(directory_path)
# Get VPNs name
connect_list = [
    file
    for file in files
    if os.path.isfile(os.path.join(directory_path, file)) and file != "passfile"
]
myvpn = proton_random("connect", connect_list)
