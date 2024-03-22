import json
import sqlite3
import argparse
import os

# location our downloaded file is stored at from the previous script
# TODO: skip ghd.sh and download the file ourselves here
inputFile = "/tmp/index.html"

# Data format is array of objects
# indexes as follows
#   0: Game Number
#   1: Date: [Date, Date]
#   2: Away Team: [Image Url, Team Name]
#   3: Away Score
#   4: Home Team: [Image Url, Team Name]
#   5: Home Score
#   6: Time Information (see below)
#   7: Attendance (if game has occurred, blank otherwise)
#   8: Empty if finished, or url to arena to buy tickets
#   9: Arena name

# time information
#   0: ???
#   1: "Final" or game date and time with timezone offset
#   2: Url of arena
#   3: "Final" or game date and time start with timezone offset
#   4: User friendly game time
#   5: "h:mm a z" for timezone decoding?

# replace any ' with escape characters
def safe(s):
    return s.replace("'", "\\'")

# get file name for the team image from the path
def getImage(s):
    file = os.path.basename(s)
    return updateExtension(file)

# some files have incorrect extensions, change on a case by case basis
def updateExtension(s):
    if s == "3.jpg":
        return "3.png"
    else:
        return s

def output(e, cur):
    # insert the entries into the table
    home = safe(e[4][1])
    away = safe(e[2][1])
    hg = e[5]
    ag = e[3]
    att = e[7]
    arena = safe(e[9])
    himage = getImage(e[4][0])
    aimage = getImage(e[2][0])

    sql = 'INSERT INTO hockey_schedule_imports (date, home, away, gf_home, gf_away, attendance, arena, home_image, away_image) VALUES ("{}", "{}", "{}","{}","{}", "{}", "{}", "{}", "{}")'.format(
        e[1][0],home,away,hg,ag,att,arena,himage,aimage
    )
    cur.execute(sql)


# parse command line arguments
# we get a path to the database file
parser = argparse.ArgumentParser()
parser.add_argument("dbPath")
args = parser.parse_args()

db = sqlite3.connect(args.dbPath)
cur = db.cursor()

# clear out the import table first
# the backend will copy over and update entries from there
sql = "DELETE FROM hockey_schedule_imports"
cur.execute(sql)

with open(inputFile, "r") as f:
    rawdata = f.read()

    for lines in rawdata.split("\n"):
        data = lines.find("data:")

        if data != -1:
            tbl = json.loads(lines[10:-3])
            for i, e in enumerate(tbl):
                output(e, cur)

db.commit()
