import json
import requests
from datetime import datetime
from copy import copy
import numpy as np

world_cup_data_url = 'http://worldcup.sfg.io/matches'
API_KEY="db85f99e5e2296344f757ca9d8caab11"
API_URL="https://api.forecast.io/forecast"

with open('data/stadia.json') as f:
    stadia = json.loads(f.read())

r = requests.get(world_cup_data_url)
m1 = json.loads(r.content)
matches = [m for m in m1 if m['status'] != 'future']  # filter to current matches

# combine in stadium data
for m in matches:
    stadium = m['location']
    m['lat'] = stadia[stadium]['lat']
    m['lng'] = stadia[stadium]['lng']

# get weather data for each match
for m in matches:
    d = m['datetime'].split('.')[0]
    print m['match_number'], d, m['lat'], m['lng']
    resp = requests.get('%s/%s/%f,%f,%s' % (API_URL, API_KEY, m['lat'], m['lng'], d))
    weather_data = json.loads(resp.content)
    m['match_weather'] = weather_data['currently']
    m['day_weather'] = weather_data['daily']['data']
    # m['full_weather'] = weather_data # just in case

# we'll simplify all this
weather = [{
            'weather' : m['match_weather'],
            'away_team' : m['away_team'],
            'home_team' : m['home_team'],
            'datetime' : m['datetime'],
            'winner' : m['away_team']['code'] if m['away_team']['country'] == m['winner'] else m['home_team']['code'],
            'lat' : m['lat'],
            'lng' : m['lng'],
            'match_number' : m['match_number'],
            'location' : m['location']
            } for m in matches]

# parse out the teams...
teams = []
for m in matches:
    if m['away_team']['code'] not in teams:
        teams.append(m['away_team']['code'])
    if m['home_team']['code'] not in teams:
        teams.append(m['home_team']['code'])

# arrange the groups
groups = list('ABCDEFGH')
group_ranks = {
    "BRA" : 1, "MEX" : 2, "CRO" : 3, "CMR" : 4,
    "NED" : 1, "CHI" : 2, "ESP" : 3, "AUS" : 4,
    "COL" : 1, "GRE" : 2, "CIV" : 3, "JPN" : 4,
    "CRC" : 1, "URU" : 2, "ITA" : 3, "ENG" : 4,
    "FRA" : 1, "SUI" : 2, "ECU" : 3, "HON" : 4,
    "ARG" : 1, "NGA" : 2, "BIH" : 3, "IRN" : 4,
    "GER" : 1, "USA" : 2, "POR" : 3, "GHA" : 4,
    "BEL" : 1, "ALG" : 2, "RUS" : 3, "KOR" : 4
}
teams_data = { t : {'group' : groups[i/4],'code': t} for i,t in enumerate(teams)}
for teamkey, team in teams_data.items():
    team['matches'] = []
    i = 0
    for match in weather:
        if (match['away_team']['code'] == teamkey or match['home_team']['code'] == teamkey) and match not in team['matches']:
            m = copy(match)
            i += 1
            m['number'] = i
            m['code'] = teamkey;
            team['matches'].append(m)
            if(match['away_team']['code'] == teamkey):
                team['country'] = match['away_team']['country']
            if(match['home_team']['code'] == teamkey):
                team['country'] = match['home_team']['country']

for team in teams_data.values():
    goals_for = 0
    goals_against = 0
    temps = []
    humidities = []
    for match in team['matches']:
        temps.append(match['weather']['temperature'])
        humidities.append(match['weather']['humidity'])
        if match['away_team']['code'] == team['code']:
            self_team = match['away_team']
            other_team = match['home_team']
        else:
            self_team = match['home_team']
            other_team = match['away_team']
        goals_for += self_team['goals']
        goals_against += other_team['goals']
    team['temps'] = temps
    team['average_temps'] = np.average(temps)
    team['humidities'] = humidities
    team['average_humidities'] = np.average(humidities)
    team['goals for'] = goals_for
    team['goals_against'] = goals_against
    team['goal_difference'] = goals_for - goals_against
    team['group_position'] = group_ranks[team['code']]

with open('data/teams.json', 'w+') as f:
    f.write(json.dumps(teams_data, sort_keys=True, indent=4))
