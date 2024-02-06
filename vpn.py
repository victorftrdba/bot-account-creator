import os
import random
import sys


def proton_random(action, connect_list=None, vpn_type=None):
    # Connect
    if connect_list is not None:
        location = vpn_type if vpn_type is not None else random.choice(connect_list)
        os.popen(f'openvpn-gui --command {action} "{location}"')
    else:
        os.popen(f"openvpn-gui --command {action}")


directory_path = r"C:\Program Files\OpenVPN\config"
files = os.listdir(directory_path)
# Get VPNs name
connect_list = [
    file
    for file in files
    if os.path.isfile(os.path.join(directory_path, file)) and file != "passfile"
]
vpn_type = sys.argv[1] if len(sys.argv) > 1 else None
myvpn = proton_random("connect", connect_list, vpn_type)
