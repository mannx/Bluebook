#
#
#   This script is used to generate the waste_def.json file for waste item definitions from the original
#   django version of the database
#   make sure to run from the original Bluebook django version
#

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE","Bluebook.settings")

import django
django.setup()

from bbhelper.models import WastageItem
import json

class Waste:

    Name=""
    UnitCount=0
    Location=0
    CustomConversion=False
    UnitWeight=0

class WI:
    Objects = []

objs = WastageItem.objects.all()
out = WI()

print('{"Data":[')

for o in objs:
    w = Waste()
    w.Name=o.Name
    w.UnitCount=o.UnitCount
    w.Location=o.Location
    out.Objects.append(w)
    jstr = json.dumps(w.__dict__)
    print(jstr+",")

print("]}")
