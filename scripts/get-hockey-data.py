import json
import sqlite3
import argparse

inputFile = "/tmp/index.html"

# TODO
# dbPath should either be environment variable to /data or passed via commandline?
# dbPath = "../backend/data/db.db"

# Data format is array of objects
# indexes as follows
#   0: Game Number
#   1: Date
#   2: Away Team
#   3: Away Score
#   4: Home Team
#   5: Home Score
#   6: Time Information (see below)
#   7: Attendance (if game has occurred, blank otherwise)
#   8: Empty if finished, or url to arena to buy tickets
#   9: Arena name

# time information
#   0: "Final" or game start time
#   1: Url of arena
#   2: "Final" or game start time

# replace any ' with escape characters
def safe(s):
    return s.replace('\'', '\\\'')


def output(e, db):
    # insert the entries into the table
    cur = db.cursor()
    sql = 'INSERT INTO hockey_schedule_imports (date, home, away, gf_home, gf_away, attendance, arena) VALUES ("{}", "{}", "{}","{}","{}", "{}", "{}")'.format(e[1], safe(e[2][1]), safe(e[4][1]), e[3], e[5], e[7], safe(e[9]))
    cur.execute(sql)


# parse command line arguments
# we get a path to the database file
parser = argparse.ArgumentParser()
parser.add_argument("dbPath")
args = parser.parse_args()

db = sqlite3.connect(args.dbPath)


with open(inputFile,"r") as f:
    rawdata = f.read()

    for lines in rawdata.split('\n'):
        data = lines.find("data:") 

        if data != -1:
            tbl = json.loads(lines[10:-3])
            for i, e in enumerate(tbl):
                output(e, db)

db.commit()