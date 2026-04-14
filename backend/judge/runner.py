import subprocess
import sys

code = open("solution.py").read()

with open("run.py","w") as f:
    f.write(code)

try:
    out = subprocess.run(
        ["python","run.py"],
        capture_output=True,
        timeout=2
    )
    print(out.stdout.decode())
except:
    print("TLE")