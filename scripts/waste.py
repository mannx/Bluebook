#
#
#   This script is used to generate the waste_def.json file for waste item definitions from the original
#   django version of the database
#   make sure to run from the original Bluebook django version
#   NOTE: the last ',' in the file needs to be removed, unless fixed first
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
    w.CustomConversion=o.CustomConversion
    w.UnitWeight = "{}".format(o.UnitWeight)

    out.Objects.append(w)
    jstr = json.dumps(w.__dict__)
    print(jstr+",")

print("]}")
