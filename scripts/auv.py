#
#   This script is used to export hte AUV table for re-imported into the new db
#   This script needs to run inte django directory
#

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE","Bluebook.settings")

import django
django.setup()

from bbhelper.models import AUVTargets
import json

class AUV:
    Week1Date=""
    Week1AUV=""
    Week1Hours=""

    Week2Date=""
    Week2AUV=""
    Week2Hours=""

    Week3Date=""
    Week3AUV=""
    Week3Hours=""

    Week4Date=""
    Week4AUV=""
    Week4Hours=""

    Week5Date=""
    Week5AUV=""
    Week5Hours=""
    Week5Required=False

objs = AUVTargets.objects.all()


print('{"Data"}:[')
for o in objs:
    a=AUV()

    a.Week1Date=o.Week1Date

    print(json.dumps(a.__dict__)+",")

print("]}")
