#!/usr/bin/env python
from flask import Flask, jsonify, request, json

# ----------------------------------------------------------------------------------
# - Import the database libraries that are required for your database connections 
# ----------------------------------------------------------------------------------
import sqlite3
#import pymysql
   

myApp = Flask(__name__)

# ----------------------------------------------------------------------------------
# - Create your own set of database connections here....these are just examples
# - Ensure that the matching python libraries have been installed & imported above
# ----------------------------------------------------------------------------------
def createConn(connection):
    #sample connection to SQLite database
    if connection == 'SQLITE':
        try:
            conn = sqlite3.connect('C:\\liveTableREST\\testdata\\DemoData.sqlite')
        except:
            return None     
    
	#sample connection to MYSQL database
    #if connection == 'MYSQL':
    #    try:
    #        conn = pymysql.connect(db='MySampleDB', user='root', passwd='password1', host='localhost')
    #    except:
    #        return None
    
    return conn


# ---------------------------------------------------------------------------------
# Function to resolve cross site security issues
#----------------------------------------------------------------------------------
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if request.method == 'OPTIONS':
        response.headers['Access-Control-Allow-Methods'] = 'DELETE, GET, POST, PUT'
        headers = request.headers.get('Access-Control-Request-Headers')
        if headers:
            response.headers['Access-Control-Allow-Headers'] = headers
    return response
	
myApp.after_request(add_cors_headers)


# ---------------------------------------------------------------------------------
# Function to build SQL Select Statement
#----------------------------------------------------------------------------------
def buildSelect(table, fields, filters, debug):
    # create SQL to query the data source based on the parameters sent
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
    if debug=="TRUE":
        print(SQL)
    return SQL
	
# ---------------------------------------------------------------------------------
# Function to build SQL Update Statement
#----------------------------------------------------------------------------------
def buildSave(table, values, filters, debug):
    # create SQL to query the data source baed on the parameters sent
    SQL = "UPDATE %s SET " % (table)
    i = 0
    fldlst = ''
    for field, value in values.items():
        fldlst += '%s = "%s"' % (field, value)
        if i+1 != len(values):
            fldlst += ", "
        i += 1
    SQL += fldlst
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
    if debug=="TRUE":
        print(SQL)
    return SQL

	
# ---------------------------------------------------------------------------------
# Route to fetch data set based on SQL filters
#----------------------------------------------------------------------------------
@myApp.route('/test', methods=['GET', 'POST'])
def test_get():
    connection = 'SQLITE'
    table = 'Customers'
    fields = '*'
    filters = []
    debug = 'TRUE'

    # connect to database based on the connection requested
    conn = createConn(connection)
    if conn is None:
        return jsonify(result="ERR", errmsg='could not connect to database')
    else:
        cur = conn.cursor()

    SQL = buildSelect(table, fields, filters, debug)
        
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
        maxRows = int(content['maxRows'])
        try:
            debug = content['debug']
        except:
            debug = 'FALSE'
		# if edit fields were passed then use them (as we are in edit mode)
        try:
            editFields = content['editFields']
        except:
            editFields = None
        if editFields != None and len(editFields) > 0:
            fields = editFields

    # connect to database based on the connection requested
    conn = createConn(connection)
    if conn is None:
        return jsonify(result="ERR", errmsg='could not connect to database')
    else:
        cur = conn.cursor()

    SQL = buildSelect(table, fields, filters, debug)
        
    # query the database 
    try:
        cur.execute(SQL)
    except:
        conn.rollback()
        return jsonify(result='ERR', info='An error occurred while querying the database.')
   
    # if results were returned then get fields and rows
    fields = [i[0] for i in cur.description]
    #list = cur.fetchall()
    list = []
    recs = cur.fetchall()
    for rec in recs:
        if maxRows > 0:
            list.append(rec)
            maxRows -= 1
        else:
            break
    rows = {'rows': list}
    result = {'result': 'OK'}
    cols = {'cols': fields}
    rows.update(cols)
    rows.update(result)
    conn.close()
    return jsonify(rows)


# ---------------------------------------------------------------------------------
# Route to save data submitted
#----------------------------------------------------------------------------------
@myApp.route('/', methods=['PUT'])
def data_put():
    # get json sent to api and extract the relevant data
    content = request.get_json(silent=True)
    if content == None:
        return jsonify(result="ERR", errmsg='no data received')
    else:
        connection = content['connection']
        table = content['table']
        values = content['values']
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

    SQL = buildSave(table, values, filters, debug)
        
    # query the database 
    try:
        cur.execute(SQL)
        conn.commit()
        return jsonify(result='OK')
    except:
        conn.rollback()
        return jsonify(result='ERR', info='An error occurred while querying the database.')
   




# ==================================================================================
# Run the REST API 
# ==================================================================================
if __name__ == "__main__":
    myApp.run(host= '0.0.0.0', port=5000, debug=True)
    
    
    