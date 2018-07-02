# Qlik Sense Live Table With Writeback

The LiveTable extension allows a table of data from a SQL database to be embedded in a Qlik Sense app. As selections are made in the Qlik Sense app the table is refreshed automatically from the SQL database. You can configure the extension to allow editing of individual records of the data, and your changes will be written back to the SQL table.

To filter the records listed in the table by selections in the Qlik Sense app, you must add the relevant fields to the list of dimensions in the extension configuration. 

As extensions are executed in the context of the user’s browser, a server-side web service is required to execute queries against the database. The extension communicates with the server-side web service using JSON. You could create your own server side web service to process the information sent via JSON, however this extension comes with a Python based web service already developed. The extension therefore has two components to install:

1.	The client-side Javascript based LiveTable extension

2.	A server-side Python based REST API to query the database(s)

