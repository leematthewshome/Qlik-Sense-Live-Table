#!/usr/bin/env python
from flask import Flask, jsonify, request, json

# ----------------------------------------------------------------------------------
# - Import the database libraries that are relevant for your database connections 
# ----------------------------------------------------------------------------------
import sqlite3
#import pymysql
   


myApp = Flask(__name__)

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if request.method == 'OPTIONS':
        response.headers['Access-Control-Allow-Methods'] = 'DELETE, GET, POST, PUT'
        headers = request.headers.get('Access-Control-Request-Headers')
        if headers:
            response.headers['Access-Control-Allow-Headers'] = headers
    return response
	
myApp.after_request(add_cors_headers)


# ----------------------------------------------------------------------------------
# - Create your own set of database connections here....these are just examples
# - Ensure that the matching python libraries have been imported above
# ----------------------------------------------------------------------------------
def createConn(connection):
    if connection == 'SQLITE':
        try:
            conn = sqlite3.connect('C:\\liveTableREST\\testdata\\DemoData.sqlite')
        except:
            return None     
    
    #if connection == 'MYSQL':
    #    try:
    #        conn = pymysql.connect(db='MySampleDB', user='root', passwd='password1', host='localhost')
    #    except:
    #        return None
    
    return conn


# ---------------------------------------------------------------------------------
# Route to fetch data set based on SQL filters
#----------------------------------------------------------------------------------
@myApp.route('/test', methods=['GET', 'POST'])
def test_get():
    connection = 'SQLITE'
    table = 'Customers'
    fields = '*'
    #filters = [{"field" : "Country", "values": ["Argentina", "Australia", "Germany"]}, {"field" : "City", "values": ["Berlin", "Lille", "Sydney", "Buenos Aires"]}]
    filters = []
    debug = 'FALSE'
    
    # connect to database based on the connection requested
    conn = createConn(connection)
    if conn is None:
        return jsonify(result="ERR", errmsg='could not connect to database')
    else:
        cur = conn.cursor()

    # create SQL to query the data source baed on the parameters sent
    SQL = "SELECT %s FROM %s" % (fields, table)
    if len(filters) > 0:
        SQL += " WHERE "
        where = ''
        for filter in filters:
            where += '"%s" IN (' % (filter['field'])
            i = 0
            for val in filter['values']:
                where += '"%s"' % (val)
                if i+1 != len(filter['values']):
                    where += ", "
                i += 1
            where += ") "
            SQL += where
            where = " AND "
        
    if debug == 'TRUE':
        return jsonify(result='OK', debug='TRUE', info=SQL)
        
    # query the database 
    try:
        cur.execute(SQL)
    except:
        conn.rollback()
        return jsonify(result='ERR', info='An error occurred while querying the database.')
   
    # if results were returned then 
    fields = [i[0] for i in cur.description]
    list = cur.fetchall()
    rows = {'rows': list}
    result = {'result': 'OK'}
    cols = {'cols': fields}
    rows.update(cols)
    rows.update(result)
    conn.close()
    return jsonify(rows)


    
    
    
# ---------------------------------------------------------------------------------
# Route to fetch data set based on SQL filters
#----------------------------------------------------------------------------------
@myApp.route('/', methods=['GET', 'POST'])
def data_get():
    # get json sent to api and extract the relevant data
    content = request.get_json(silent=True)
    if content == None:
        return jsonify(result="ERR", errmsg='no data received')
    else:
        connection = content['connection']
        table = content['table']
        fields = content['fields']
        filters = content['filters']
        try:
            debug = content['debug']
        except:
            debug = 'FALSE'

    # connect to database based on the connection requested
    conn = createConn(connection)
    if conn is None:
        return jsonify(result="ERR", errmsg='could not connect to database')
    else:
        cur = conn.cursor()

    # create SQL to query the data source baed on the parameters sent
    SQL = "SELECT %s FROM %s" % (fields, table)
    if len(filters) > 0:
        SQL += " WHERE "
        where = ''
        for filter in filters:
            where += '"%s" IN (' % (filter['field'])
            i = 0
            for val in filter['values']:
                where += '"%s"' % (val)
                if i+1 != len(filter['values']):
                    where += ", "
                i += 1
            where += ") "
            SQL += where
            where = " AND "
        
    if debug == 'TRUE':
        return jsonify(result='OK', debug='TRUE', info=SQL)
        
    # query the database 
    try:
        cur.execute(SQL)
    except:
        conn.rollback()
        return jsonify(result='ERR', info='An error occurred while querying the database.')
   
    # if results were returned then 
    fields = [i[0] for i in cur.description]
    list = cur.fetchall()
    rows = {'rows': list}
    result = {'result': 'OK'}
    cols = {'cols': fields}
    rows.update(cols)
    rows.update(result)
    conn.close()
    return jsonify(rows)




# ==================================================================================
# Run the REST API 
# ==================================================================================
if __name__ == "__main__":
    myApp.run(port=5000, debug=True)
    
    
    