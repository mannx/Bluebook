#
# read in the team names

names=set()

with open("team-names.data") as file:
    for line in file:
        names.add(line.strip())

print("{{\"Data\": [")

for n in names:
    print("{{\n\t\"Raw\": \"{}\",\n\t\"Correct\":\"\"\n}}".format(n))

print("]}}")
