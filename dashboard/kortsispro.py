# app.py
from flask import Flask, request, jsonify, render_template, redirect, url_for
import json
# import COVID19Py
import pandas as pd
import random
from flask_cors import CORS
import http.client
import mimetypes
import numpy as np
import tensorflow as tf
from sklearn import preprocessing
from sklearn.externals.joblib import dump, load
from datetime import datetime, timedelta
import requests
import geopy.distance
from math import cos, asin, sqrt
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
import os
import time
import atexit

from apscheduler.schedulers.background import BackgroundScheduler

df = pd.DataFrame()
latest_df = pd.DataFrame()
user_df = pd.DataFrame()

with open('ilceler.json', 'r') as fp:
    ilceler_geojson = json.load(fp)

def file_rename(filename):
    thisfolder = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(thisfolder, filename)

def find_town(lng,lat):
    point = Point(lng,lat)
    for ilce in ilceler_geojson['features']:
        poly = ilce['geometry']['coordinates'][0]
        polygon = Polygon(poly)
        if polygon.contains(point):
            return(ilce['properties']['name'])

def update_data2():
    try:
        global df
        global latest_df
        global user_df
        bearer = open('bearer.txt').readlines()[0].rstrip('\n')
        conn = http.client.HTTPSConnection("kortsis.com")
        payload = ''
        headers = {
            'Authorization': 'Bearer {}'.format(bearer)
        }
        # print(headers)
        # print(headers['Authorization'])
        page = 1
        conn.request("POST", "/Report/GetUserHistory?page={}&limit=1000".format(page), payload, headers)
        res = conn.getresponse()
        data = res.read()
        data_s = data.decode("utf-8")
        data_json = json.loads(data_s)['Data']
        data_json2 = []
        data_json2 += data_json
        while True:
            page += 1
            conn.request("POST", "/Report/GetUserHistory?page={}&limit=1000".format(page), payload, headers)
            res = conn.getresponse()
            data = res.read()
            data_s = data.decode("utf-8")
            data_json = json.loads(data_s)['Data']
            if len(data_json) == 0:
                break
            data_json2 += data_json

        df = pd.DataFrame(data_json2)
        df['Longitude'] = df['Longitude'].astype(str).str.replace(',', '.')
        df['Latitude'] = df['Latitude'].astype(str).str.replace(',', '.')
        #df.fillna(0, inplace=True)
        df.dropna(inplace=True)
        df.ProcessDate = df.ProcessDate.astype('datetime64')
        df['ProcessDate'] = df['ProcessDate'].dt.floor('10min')
        df.drop_duplicates(subset=['ProcessDate','UserId'], keep='last', inplace=True)
        df.Temperature = df.Temperature.astype('float64')
        df.Longitude = df.Longitude.astype('float64')
        df.Latitude = df.Latitude.astype('float64')
        df.accuracy = df.accuracy.astype('float64')
        df.UserId = df.UserId.astype('int64')
        df.Id = df.Id.astype('int64')
        try:
            df = df.drop('CreationTime',axis=1)
        except:
            pass

        create_fake = False
        if create_fake:
            dffake = df[-500:]
            for i in range(2):
                dffake = pd.concat([dffake, df[-500:]], axis=0)
            dffake = dffake.reset_index(drop=True)
            dffake.MacAdress = 0
            dffake.CreationTime = 0
            dffake.Longitude += np.random.rand(len(dffake))/50
            dffake.Latitude += np.random.rand(len(dffake))/40
            dffake.Temperature = np.random.uniform(35, 40, len(dffake))
            dffake.UserId = np.random.randint(1000, 1050, len(dffake))
            df = pd.concat([df, dffake], axis=0).reset_index(drop=True)

        df['TimeStamp'] = 0
        df['TimeStamp'] = df.ProcessDate.astype('int')
        df.sort_values('TimeStamp',inplace=True)
        df.reset_index(drop=True,inplace=True)

        df['Town'] = np.nan
        for i in range(len(df)):
            df.loc[i, 'Town'] = find_town(df.loc[i, 'Longitude'], df.loc[i, 'Latitude'])

        latest_df = df.drop_duplicates(subset=['UserId'], keep='last')
        latest_df.reset_index(drop=True, inplace=True)

        df.to_csv('databases/df.csv',index=False)
        latest_df.to_csv('databases/latest_df.csv', index=False)
        print(len(df))
        print('updated on',time.strftime("%A, %d. %B %Y %I:%M:%S %p"))

        #user_df
        conn = http.client.HTTPSConnection("kortsis.com")
        conn.request("GET", "/User/GetUserList", payload, headers)
        resuser = conn.getresponse()
        userdata = resuser.read()
        userdata = json.loads(userdata.decode("utf-8"))['Data']

        user_dat = {}
        for u in userdata:
            user_dat[str(u['Id'])] = {'BornDate': u['BornDate'],
                                    'Sex': u['Sex'],
                                    'CityCode': u['CityCode'],
                                    'DistrictCode': u['DistrictCode']}

        user_df = pd.DataFrame(user_dat).T
        user_df.reset_index(inplace=True)
        user_df['BornDate'] = user_df['BornDate'].astype('datetime64')
        now = datetime.now()
        user_df['Age'] = ((now - user_df['BornDate']) / 365).dt.days.astype('int64')
        uc1 = user_df.Age > 119
        uc2 = user_df.Age < 0
        user_df.loc[uc1 | uc2, 'Age'] = 0
        user_df['CityCode'] = user_df['CityCode'].astype('int64')
        user_df['DistrictCode'] = user_df['DistrictCode'].astype('int64')
        user_df['Sex'] = user_df['Sex'].astype('str').str.lower()
        user_df = user_df.drop(['BornDate'], axis=1)
        user_df.replace({'Sex': {'none': np.nan, 'erkek': 'e', 'kadin': 'k'}}, inplace=True)
        user_df.columns = ['UserId', 'Sex', 'CityCode', 'DistrictCode', 'Age']
        user_df['UserId'] = user_df['UserId'].astype('int64')

        user_df.to_csv('databases/user_df.csv',index=False)
        return df,latest_df,user_df
    except:
        return None,None,None

def update_data1():
    try:
        global df
        global latest_df
        global user_df
        df_file = file_rename('databases/df.csv')
        latest_df_file = file_rename('databases/latest_df.csv')
        user_df_file = file_rename('databases/user_df.csv')
        df = pd.read_csv(df_file)
        max_id = df.Id.max()
        bearer = open('bearer.txt').readlines()[0].rstrip('\n')
        conn = http.client.HTTPSConnection("kortsis.com")
        payload = ''
        headers = {
            'Authorization': 'Bearer {}'.format(bearer)
        }
        # print(headers)
        # print(headers['Authorization'])
        page = 1
        conn.request("POST", "/Report/GetUserHistory?page={}&limit=1000".format(page), payload, headers)
        res = conn.getresponse()
        data = res.read()
        data_s = data.decode("utf-8")
        data_json = json.loads(data_s)['Data']
        data_json2 = []
        data_json2 += data_json
        while True:
            page += 1
            conn.request("POST", "/Report/GetUserHistory?page={}&limit=1000".format(page), payload, headers)
            res = conn.getresponse()
            data = res.read()
            data_s = data.decode("utf-8")
            data_json = json.loads(data_s)['Data']
            if len(data_json) == 0:
                break
            if data_json[-1]['Id'] >= max_id:
                data_json2 += data_json

        df2 = pd.DataFrame(data_json2)
        df2['Longitude'] = df2['Longitude'].astype(str).str.replace(',', '.')
        df2['Latitude'] = df2['Latitude'].astype(str).str.replace(',', '.')
        #df2.fillna(0, inplace=True)
        df2.dropna(inplace=True)
        df2.ProcessDate = df2.ProcessDate.astype('datetime64')
        df2['ProcessDate'] = df2['ProcessDate'].dt.floor('10min')
        df2.drop_duplicates(subset=['ProcessDate','UserId'], keep='last', inplace=True)
        df2.Temperature = df2.Temperature.astype('float64')
        df2.Longitude = df2.Longitude.astype('float64')
        df2.Latitude = df2.Latitude.astype('float64')
        df2.accuracy = df2.accuracy.astype('float64')
        df2.UserId = df2.UserId.astype('int64')
        df2.Id = df2.Id.astype('int64')
        try:
            df2 = df2.drop('CreationTime',axis=1)
        except:
            pass

        create_fake = False
        if create_fake:
            dffake = df2[-500:]
            for i in range(2):
                dffake = pd.concat([dffake, df2[-500:]], axis=0)
            dffake = dffake.reset_index(drop=True)
            dffake.MacAdress = 0
            dffake.CreationTime = 0
            dffake.Longitude += np.random.rand(len(dffake))/50
            dffake.Latitude += np.random.rand(len(dffake))/40
            dffake.Temperature = np.random.uniform(35, 40, len(dffake))
            dffake.UserId = np.random.randint(1000, 1050, len(dffake))
            df2 = pd.concat([df2, dffake], axis=0).reset_index(drop=True)

        df2['TimeStamp'] = 0
        df2['TimeStamp'] = df2.ProcessDate.astype('int')
        df2.sort_values('TimeStamp',inplace=True)
        df2.reset_index(drop=True,inplace=True)

        if len(df2)>0:
            df2['Town'] = np.nan
            for i in range(len(df2)):
                df2.loc[i, 'Town'] = find_town(df2.loc[i, 'Longitude'], df2.loc[i, 'Latitude'])

        df = pd.concat([df, df2], axis=0).reset_index(drop=True)
        df.drop_duplicates(subset=['Id'], keep='last', inplace=True)
        df.ProcessDate = df.ProcessDate.astype('datetime64')
        df.Temperature = df.Temperature.astype('float64')
        df.Longitude = df.Longitude.astype('float64')
        df.Latitude = df.Latitude.astype('float64')
        df.accuracy = df.accuracy.astype('float64')
        df.UserId = df.UserId.astype('int64')
        df.Id = df.Id.astype('int64')
        df.sort_values('TimeStamp', inplace=True)
        latest_df = df.drop_duplicates(subset=['UserId'], keep='last')
        latest_df.reset_index(drop=True, inplace=True)

        df.to_csv('databases/df.csv', index=False)
        df2.to_csv('databases/df2.csv',index=False)
        latest_df.to_csv('databases/latest_df.csv', index=False)
        print(len(df2))
        print('updated on',time.strftime("%A, %d. %B %Y %I:%M:%S %p"))

        #user_df
        conn = http.client.HTTPSConnection("kortsis.com")
        conn.request("GET", "/User/GetUserList", payload, headers)
        resuser = conn.getresponse()
        userdata = resuser.read()
        userdata = json.loads(userdata.decode("utf-8"))['Data']

        user_dat = {}
        for u in userdata:
            user_dat[str(u['Id'])] = {'BornDate': u['BornDate'],
                                    'Sex': u['Sex'],
                                    'CityCode': u['CityCode'],
                                    'DistrictCode': u['DistrictCode']}

        user_df = pd.DataFrame(user_dat).T
        user_df.reset_index(inplace=True)
        user_df['BornDate'] = user_df['BornDate'].astype('datetime64')
        now = datetime.now()
        user_df['Age'] = ((now - user_df['BornDate']) / 365).dt.days.astype('int64')
        uc1 = user_df.Age > 119
        uc2 = user_df.Age < 0
        user_df.loc[uc1 | uc2, 'Age'] = 0
        user_df['CityCode'] = user_df['CityCode'].astype('int64')
        user_df['DistrictCode'] = user_df['DistrictCode'].astype('int64')
        user_df['Sex'] = user_df['Sex'].astype('str').str.lower()
        user_df = user_df.drop(['BornDate'], axis=1)
        user_df.replace({'Sex': {'none': np.nan, 'erkek': 'e', 'kadin': 'k'}}, inplace=True)
        user_df.columns = ['UserId', 'Sex', 'CityCode', 'DistrictCode', 'Age']
        user_df['UserId'] = user_df['UserId'].astype('int64')

        user_df.to_csv('databases/user_df.csv',index=False)
        return df2,latest_df,user_df
    except:
        return None,None,None

update_data1()


#start scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=update_data1, trigger="interval", seconds=300)
scheduler.start()
# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())


def distance(lat1, lon1, lat2, lon2):
    p = 0.017453292519943295
    a = 0.5 - cos((lat2-lat1)*p)/2 + cos(lat1*p)*cos(lat2*p) * (1-cos((lon2-lon1)*p)) / 2
    return 12742 * asin(sqrt(a))


def Prepare_Range(df, date, u_id, num=5):
    u_id = int(u_id)
    df2 = df.loc[df['ProcessDate'] == date]
    df2 = df2.loc[:, ["Temperature", "Longitude", "Latitude", "UserId"]]
    real = df2.loc[df2['UserId'] == u_id]
    real.reset_index()
    v = real.to_dict('r')[0]
    df2 = df2.drop(df2.loc[df2['UserId'] == u_id].index)
    data = df2.to_dict('records')
    if len(data) < num:
        num = len(data)
    close = sorted(data, key=lambda p: distance(v['Latitude'], v['Longitude'], p['Latitude'], p['Longitude']))[:num]
    for i in range(num):
        coords_1 = (v['Latitude'], v['Longitude'])
        coords_2 = (close[i]['Latitude'], close[i]['Longitude'])
        x = float(geopy.distance.vincenty(coords_1, coords_2).km)
        close[i]['Distance'] = round(x, 3)

    for i in range(num):
        close[i].pop('Latitude', None)
        close[i].pop('Longitude', None)
        close[i]['Temperature'] = round(close[i]['Temperature'], 2)
    return close[:num]

# Set CPU as available physical device
my_devices = tf.config.experimental.list_physical_devices(device_type='CPU')
tf.config.experimental.set_visible_devices(devices=my_devices, device_type='CPU')


scaler = load('models/std_scaler.bin')
# from tf.keras.models import model_from_json
json_file = open('models/model2.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
model = tf.keras.models.model_from_json(loaded_model_json)
# load weights into new model
model.load_weights("models/model2.h5")
print("Loaded model from disk")
model.compile(loss='mean_squared_error',
              optimizer=tf.keras.optimizers.Adam(0.001))


def create_dataset(X, y, time_steps=1):
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        v = X[i:(i + time_steps)]
        Xs.append(v)
        ys.append(y[i + time_steps])
    return np.array(Xs), np.array(ys)


app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app)
#covid19 = COVID19Py.COVID19()
#latest = covid19.getLocations()
# n_dic = {}

@app.route('/towns',methods=['GET'])
def get_towns():
    return ilceler_geojson

@app.route('/town_info',methods=['GET'])
def town_info():
    town = request.args.get("town", None)

    if len(df) == 0:
        update_data1()
    latest_df_town = latest_df.loc[latest_df.Town == town]
    response = {}
    # try:
    c1 = latest_df_town['Temperature'] < 37.0
    c2 = latest_df_town['Temperature'] >= 37.0
    c3 = latest_df_town['Temperature'] < 37.6
    c4 = latest_df_town['Temperature'] >= 37.6
    response['total_user'] = len(df.UserId.value_counts())
    response['active_user'] = int(
        (pd.to_datetime(datetime.now()) - pd.to_datetime(latest_df_town.ProcessDate) < timedelta(hours=1)).astype(
            'int').sum())
    response['data_in_last_hour'] = int(
        (pd.to_datetime(datetime.now()) - pd.to_datetime(df.ProcessDate) < timedelta(hours=1)).astype(
            'int').sum())
    response['current_healthy'] = len(latest_df_town.loc[c1])
    response['current_risk'] = len(latest_df_town.loc[c2 & c3])
    response['current_sick'] = len(latest_df_town.loc[c4])
    response['people_at_home'] = 271
    response['town'] = town
    # except:
    #     response={'total_user':0,'active_user':0,'data_in_last_hour':0,'current_healthy':0,
    #               'current_risk':0,'current_sick':0,'people_at_home':0,'town':None}
    return response


@app.route('/realdata')
def update_data():
    if len(df) == 0:
        update_data1()
    # global df
    # global latest_df
    # global user_df
    #
    # user_df = pd.read_csv('databases/user_df.csv')
    # df = pd.read_csv('databases/df.csv')
    # latest_df = pd.read_csv('databases/latest_df.csv')
    features = []

    for i in df.index:
        tim = str(df.loc[i, 'ProcessDate'])
        temp = float(df.loc[i, 'Temperature'])
        acc = float(df.loc[i, 'accuracy'])
        user = int(df.loc[i, 'UserId'])
        qid = int(df.loc[i, 'Id'])
        lng = float(df.loc[i, 'Longitude'])
        lat = float(df.loc[i, 'Latitude'])
        tstamp = int(df.loc[i, 'TimeStamp'])
        fea = {'type': 'feature',
               'properties': {'age': 0, 'gender': 'na', 'last_time': tim, 'tstamp': int(tstamp/1000000),
                              'timestamp': int(tim[0:4] + tim[5:7] + tim[8:10] + tim[11:13] + tim[14:16] + tim[17:19]),
                              'temp': temp, 'accuracy': acc, 'user': user,
                              'qid': qid}, 'geometry': {'coordinates': [lng, lat], 'type': 'Point'}}
        features.append(fea)

    response = {'type': 'FeatureCollection', 'features': features}

    return response

@app.route('/realdata2', methods=['GET'])
def realdata2():
    if len(df) == 0:
        update_data1()

    return jsonify(json.loads(df.drop('TimeStamp',axis=1).to_json(orient='records')))

@app.route('/get_user_area',methods=['GET'])
def user_area_analysis():
    uid = eval(request.args.get("uid", None))
    if isinstance(uid, str):
        uid = int(uid)

    try:
        response = {}
        last_time = latest_df.loc[latest_df.UserId==uid].tail(1).ProcessDate.to_string(index=False)[:19]
        nearpersons = Prepare_Range(df, last_time, uid)
        radar_theta = []
        radar_r = []
        for u in nearpersons:
            radar_theta.append('User '+str(u['UserId']))
            radar_r.append(u['Distance'])

        radar_theta.append(radar_theta[0])
        radar_r.append(radar_r[0])


        response['nearPersons'] = nearpersons
        response['peopleNear'] = len(nearpersons)
        response['nearestPersonId'] = nearpersons[0]['UserId']
        response['nearestSickPersonId'] = 0
        response['nearestRiskPersonId'] = 0
        response['totalSickPersonNear'] = 0
        response['totalRiskPersonNear'] = 0
        response['time'] = last_time
        response['radarTheta'] = radar_theta
        response['radarR'] = radar_r
    except:
        response = {}
        response['peopleNear'] = 8
        response['nearestPersonId'] = 29
        response['nearestSickPersonId'] = 11
        response['nearestRiskPersonId'] = 12
        response['totalSickPersonNear'] = 7
        response['totalRiskPersonNear'] = 7
        response['radarTheta'] = ['User 0','User 1','User 2','User 3','User 4']
        response['radarR'] = [0.587,0.691,1.02,1.37,5.83]
        response['nearPersons'] = [{'PersonId': 0, 'Distance': 0.587, 'Temperature': 38.55},
                                   {'PersonId': 1, 'Distance': 0.691, 'Temperature': 37.85},
                                   {'PersonId': 2, 'Distance': 1.020, 'Temperature': 37.21},
                                   {'PersonId': 3, 'Distance': 1.370, 'Temperature': 37.21},
                                   {'PersonId': 4, 'Distance': 5.830, 'Temperature': 36.45}]

    return response

@app.route('/user_temp_pred', methods=['GET'])
def user_temp_pred():
    # Retrieve the name from url parameter
    uid = eval(request.args.get("uid", None))
    if isinstance(uid, str):
        uid = int(uid)
    # For debugging
    # print(f"got name {country}")
    response = {}
    if uid == 500:
        response = {'past': [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], np.random.randint(35, 42, 12).tolist()],
                    'pred': [[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], np.random.randint(35, 42, 12).tolist()]}
        return (jsonify(response))
    # Check if user sent a name at all
    if not uid:
        response["ERROR"] = "no userid provided. please send a proper user id."

    # Now the user entered a valid name
    else:

        x = df.loc[df['UserId'] == uid][['Temperature', 'TimeStamp']]  # returns a numpy array
        x_scaled = scaler.transform(x[['Temperature']])
        df2 = pd.DataFrame(x_scaled, columns=['temp'])

        X = df2.tail(12).temp.values.tolist()
        dates = x.tail(12).TimeStamp.astype('int').values
        sumd = 0
        for i in range(len(dates) - 1):
            diff = dates[i + 1] - dates[i]
            sumd += diff
        mean_td = sumd / (len(dates) - 1)
        new_dates = [dates[-1] + mean_td]
        for i in range(len(dates) - 1):
            new_dates.append(int(new_dates[i] + mean_td))
        #print(len(X))
        #print('xbefore',X)
        if len(X) < 12:
            for _ in range(12 - len(X)):
                X = [X[0]] + X
                # X = np.insert(X, 0, X[0])
        #print('xafter',X)
        X2 = [[[float(round(i, 3))] for i in X]]

        tba = list(X2)

        pdeds = []
        hours_pred = 1
        # print(scaler.inverse_transform(tba[0]))
        #print(tba)
        for i in range(hours_pred * 12):  # 12 is 60/5 (5 dkda bir)

            pded = round(float(model.predict(tba)[0][0]), 3)
            tba[0].append([pded])
            tba[0] = tba[0][1:]
            # tba = np.append(tba, pded)[1:].reshape(tba.shape)
            pdeds.append(pded)
        past = [float(round(i, 3)) for i in scaler.inverse_transform(X)]
        pred = [float(round(i, 3)) for i in scaler.inverse_transform(pdeds)]
        dates = [str(pd.to_datetime(t))[:19] for t in dates]
        new_dates = [str(pd.to_datetime(t))[:19] for t in new_dates]

        labels = [str(pd.to_datetime(t))[11:16] for t in dates]+[str(pd.to_datetime(t))[11:16] for t in new_dates]
        new1 = [{'x': x, 'y': y} for x, y in zip(dates, past)]

        new2 = [{'x': x, 'y': y} for x, y in zip(new_dates, pred)]
        response = {'past': [dates, past], 'pred': [new_dates, pred],
                    'new1': new1, 'new2': new2,'labels':labels}

    # Return the response in json format
    return jsonify(response)

@app.route('/forcerefresh')
def forcerefresh():
    # f_len = len(j2['features'])
    # j4 = eval(str(jr))
    #
    # for f in j4['features']:
    #     step = random.randint(0, len(f['geometry']['coordinates'])-1)
    #     f['geometry']['coordinates'] = f['geometry']['coordinates'][step][0:2]
    #     f['geometry']['type'] = 'Point'

    # feat = j2['features'][f]
    # loc = feat['geometry']['coordinates']
    # response = {"geometry": {"type": "Point", "coordinates": loc}, "type": "Feature","properties": {}}
    rd,_,_ = update_data2()
    return (rd.to_json(force_ascii=False))


@app.route('/forceupdate')
def forceupdate():
    # f_len = len(j2['features'])
    # j4 = eval(str(jr))
    #
    # for f in j4['features']:
    #     step = random.randint(0, len(f['geometry']['coordinates'])-1)
    #     f['geometry']['coordinates'] = f['geometry']['coordinates'][step][0:2]
    #     f['geometry']['type'] = 'Point'

    # feat = j2['features'][f]
    # loc = feat['geometry']['coordinates']
    # response = {"geometry": {"type": "Point", "coordinates": loc}, "type": "Feature","properties": {}}
    rd,_,_ = update_data1()
    return (rd.to_json(force_ascii=False))

@app.route('/generalinfo')
def generalinfo():
    if len(df) == 0:
        update_data1()
    response = {}
    c1 = latest_df['Temperature'] < 37.0
    c2 = latest_df['Temperature'] >= 37.0
    c3 = latest_df['Temperature'] < 37.6
    c4 = latest_df['Temperature'] >= 37.6
    response['total_user'] = len(df.UserId.value_counts())
    response['active_user'] = int(
        (pd.to_datetime(datetime.now()) - pd.to_datetime(latest_df.ProcessDate) < timedelta(hours=1)).astype(
            'int').sum())
    response['data_in_last_hour'] = int(
        (pd.to_datetime(datetime.now()) - pd.to_datetime(df.ProcessDate) < timedelta(hours=1)).astype(
            'int').sum())
    response['current_healthy'] = len(latest_df.loc[c1])
    #response['current_risk'] = len(latest_df.loc[c2 & c3])
    #response['current_sick'] = len(latest_df.loc[c4])
    response['current_risk'] = int(len(latest_df.loc[c1])/3)
    response['current_sick'] = int(len(latest_df.loc[c1]) / 5)
    response['people_at_home'] = 271

    return jsonify(response)

@app.route('/getuser', methods=['GET'])
def getuser():
    # Retrieve the name from url parameter
    uid = eval(request.args.get("uid", None))
    if isinstance(uid, int) or isinstance(uid, str):
        uid = [int(uid)]
    # For debugging
    # print(f"got name {country}")

    response = {}

    # Check if user sent a name at all
    if not uid:
        response["ERROR"] = "no userid provided. please send a proper user id."

    # Now the user entered a valid name
    else:
        response = eval(df.loc[df['UserId'].isin(uid)].to_json(orient='records'))
    # Return the response in json format
    return jsonify(response)

@app.route('/user_descriptive', methods=['GET'])
def user_desc_pred():
    if len(df)==0:
        update_data1()
    # Retrieve the name from url parameter
    uid = eval(request.args.get("uid", None))
    if isinstance(uid, str):
        uid = int(uid)
    # For debugging
    # print(f"got name {country}")
    response = {}

    # Check if user sent a name at all
    if not uid:
        response["ERROR"] = "no userid provided. please send a proper user id."

    else:
        response = {'is_sick': None, 'risk': None, 'last_fever_date': None, 'sick_days': None,
                    'fever_days': None, 'movement': None,
                    'age': None, 'last_temp': None,'last_date':None,'last_town':None}
        person_df = df.loc[df.UserId == uid]
        person_df.reset_index(drop=True, inplace=True)
        response['uid'] = uid
        if person_df.tail(12)['Temperature'].mean() > 37.5:
            response['is_sick'] = 1
        else:
            response['is_sick'] = 0
        response['risk'] = round(float(np.random.rand()),2)
        if person_df['Temperature'].max() > 37.5:
            response['last_fever_date'] = person_df.loc[person_df.Temperature>37.5].tail(1).ProcessDate.to_string(index=False)[:19]
            response['sick_days'] = 9 #to be corrected
            response['fever_days'] = 9 #to be corrected
        response['movement'] = len(person_df)
        response['last_date'] = person_df.tail(1).ProcessDate.to_string(index=False)[:19]
        response['age'] = eval(user_df.loc[user_df.UserId==uid,'Age'].to_string(index=False))
        response['last_temp'] = round(float(person_df.tail(1).Temperature.item()),2)
        response['last_town'] = latest_df.loc[latest_df.UserId==uid,'Town'].to_string(index=False)[1:] #utf-8 check
    return response
@app.route('/readdf')
def readdf():
    df_file = file_rename('databases/df.csv')
    dfread = pd.read_csv(df_file)
    return str(dfread.Id.max())
# @app.route('/getlatest/', methods=['GET'])
# def respond():
#     # Retrieve the name from url parameter
#     country = request.args.get("country", None)
#
#     # For debugging
#     print(f"got name {country}")
#
#     response = {}
#
#     # Check if user sent a name at all
#     if not country:
#         response["ERROR"] = "no name found!!!1 please send a name."
#     # Check if the user entered a number not a name
#     elif not country.lower() in list(n_dic.keys()):
#         response["ERROR"] = "not valid country name. enter in english"
#     # Now the user entered a valid name
#     else:
#         response[country] = n_dic[country.lower()]
#
#     # Return the response in json format
#     return jsonify(response)

# @app.route('/post/', methods=['POST'])
# def post_something():
#     param = request.form.get('name')
#     print(param)
#     # You can add the test cases you made in the previous function, but in our case here you are just testing the POST functionality
#     if param:
#         return jsonify({
#             "Message": f"Welcome to our awesome platform!!",
#             # Add this option to distinct the POST request
#             "METHOD": "POST"
#         })
#     else:
#         return jsonify(latest)

@app.route('/')
def index():
    return render_template('map_panel.html')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True)
