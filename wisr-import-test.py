import re

# regStr = "(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(.*)"
# regStr = "(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\d+.\d+)\s+(\D*)\d+.*"
regStr = "\s+(-?\d?,?\d+\.\d+)\s+(-?\d?,?\d+\.\d+)\s+(-?\d?,?\d+\.\d+)\s+(-?\d?,?\d+\.\d+)\s+(-?\d?,?\d+\.\d+)\s+(-?\d?,?\d+\.\d+)\s+(-?\d?,?\d+\.\d+)\s+(\D*)"

ex = re.compile(regStr)

f = open("wisr.txt","r")

for line in f:
    res = ex.match(line)
    if res != None:
        print("[{}] [Short: {}] [Price: {}]".format(res.group(8).strip(),res.group(5),res.group(7)))
