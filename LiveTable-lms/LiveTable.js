define(["jquery"], function($) {
    var qscPaintCounter = 0;
		
    if (!qscPaintCounter) {
        $("<style>").html("/* Live Table Embedded Styles */ \
		tr {height:1.2em} \
		.thead {padding-top:10px; padding-bottom:10px; text-align:center; font-weight:bold;} \
		.header {border-bottom:1px solid silver; text-align:left; white-space:nowrap} \
		.record {border-bottom:1px solid silver; text-align:right; padding-right:5px; padding-top:1px; padding-bottom:1px;} \
		.thead_b {border:1px solid silver;padding-top:10px; padding-bottom:10px; text-align:center; ;} \
		.header_b {border:1px solid silver;text-align:left; white-space:nowrap} \
		.record_b {border:1px solid silver;text-align:right; padding-right:5px; padding-top:1px; padding-bottom:1px;} \
        ").appendTo("head");
    }
    return {
        initialProperties: {
            version: 1.0,
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 100,
                    qHeight: 100
                }],
                title: "/title"
            },
            chartType: "BarChart"
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 1,
                    max: 4
                },
                measures: {
                    uses: "measures",
                    min: 0,
                    max: 0
                },
                sorting: {
                    uses: "sorting"
                },		
				settings: {
					uses: "settings",
					items: {
						Sect1: {
							type: "items",
							label: "Source Data",
							items: {
								qRestAPI: {
									type: "string",
									label: "URL for REST API",
									ref: "qRestAPI",
									defaultValue: "http://localhost:5000"
								},
								qDataConn: {
									type: "string",
									label: "Connection (must match REST API)",
									ref: "qDataConn",
									defaultValue: "MyDBConnection"
								},
								qTableName: {
									type: "string",
									label: "Name of table to query",
									ref: "qTableName",
									defaultValue: "MyDatabaseTable"
								},
								qFieldNames: {
									type: "string",
									label: "List of field names (optional)",
									ref: "qFieldNames",
									defaultValue: ""
								}
							}
						},
						Sect2: {
							type: "items",
							label: "Functionality",
							items: {
								qEditable: {
									type: "boolean",
									label: "Allow edit records",
									ref: "qEditable",
									defaultValue: false
								},
								qKeyField: {
									type: "string",
									label: "Key field",
									ref: "qKeyField",
									defaultValue: ""
								}
							}
						},
						Sect3: {
							type: "items",
							label: "Debug",
							items: {
								qDebug: {
									type: "boolean",
									label: "Debug REST interface",
									ref: "qDebug",
									defaultValue: false
								}
							}
						}
						
					}
				}
            }
        },
        snapshot: {
            canTakeSnapshot: true
        },

		//---------------------------------------------------------------------------
		//Paint function to render the extension HTML
		//---------------------------------------------------------------------------
        paint: function($element, layout) {

		
			//Function to display edit form
			//---------------------------------------------------------------------------
			var doEdit = function(id) {
				alert('Display edit form for ' + id)
			};

			
			//Function to get values for a given field (used to filter the data fetched)
			//---------------------------------------------------------------------------
			var getValues = function (rows, col) {
				arr = [];
				rows.forEach( function ( row ) {
					if(arr.indexOf(row[col].qText) == -1){
						arr.push(row[col].qText);
					}
				} );
				return arr
			};
			
			//Function to display the table results (on successful fetch of data)
			//------------------------------------------------------------------------
			var renderTable = function (jsonData) {
				cols = jsonData["cols"]
				rows = jsonData["rows"]
				i = 0;
				keyNo = 0;
				//create column header row
				var qscRowHtml = document.createElement('tr');
				qscRowHtml.className = "thead"; 
				cols.forEach( function ( colname ) {
					var qscCellHtml = document.createElement('td');
					qscCellHtml.className = "header"; 
					qscCellHtml.innerHTML = colname;
					qscRowHtml.appendChild(qscCellHtml); 
					//work out position of key values
					if(colname == qKeyField){
						keyNo = i;
					}
					i += 1
				})
				if(qEditable){
					var qscCellHtml = document.createElement('td');
					qscCellHtml.className = "header"; 
					qscCellHtml.innerHTML = '&nbsp';
					qscRowHtml.appendChild(qscCellHtml); 					
				}
				tableBody.appendChild(qscRowHtml); 
				//create data rows
				rows.forEach( function ( row ) {
					var qscRowHtml = document.createElement('tr');
					row.forEach( function ( fieldVal ) {
						var qscCellHtml = document.createElement('td');
						qscCellHtml.className = "record"; 
						qscCellHtml.innerHTML = fieldVal;
						qscRowHtml.appendChild(qscCellHtml); 
					})
					if(qEditable){
						var qscCellHtml = document.createElement('td');
						qscCellHtml.className = "record"; 
						qscCellHtml.innerHTML = "<button onClick='doEdit(\"" + row[keyNo] + "\")'> edit </button>";
						qscRowHtml.appendChild(qscCellHtml); 					
					}
					tableBody.appendChild(qscRowHtml); 
				})

			};

			//declare our table element
            var currentTableQvid = layout.qInfo.qId;
            $element.hide();
            $('table').hide();
            $element.html('');
            $element.html('<table id="qsc-table-' + currentTableQvid + '" class="qsc-pivot-table responsive" ><tbody id="qsc-table-body-' + currentTableQvid + '"></tbody></table>');
			var tableBody = document.getElementById("qsc-table-body-" + currentTableQvid + "");
			
			//get extension configuration settings 
			qRestAPI = layout.qRestAPI
			qDataConn = layout.qDataConn
			qTable = layout.qTableName
			qFields = layout.qFieldNames
			if (qFields.length==0){
				qFields = '*';
			}
			qEditable = layout.qEditable
			qKeyField = layout.qKeyField
			
			//build JSON to submit to API
			myJSON = {
				"version" : "1.0", 
				"connection" : qDataConn, 
				"table" : qTable, 
				"fields" : qFields,
				"filters" : []
			}
			var dimCnt = 0;
			hypercube = layout.qHyperCube
			matrix = hypercube.qDataPages[0].qMatrix;
			
			hypercube.qDimensionInfo.forEach( function ( value ) {
				if(hypercube.qDimensionInfo[dimCnt].qStateCounts.qSelected > 0){
					data = getValues(matrix, dimCnt)
					myJSON.filters.push({field : value.qFallbackTitle, values : data});
				}
				dimCnt += 1
			} );
			


			//provide debug alerts if required by the config
			if(layout.qDebug){
				//myJSON['debug'] = "TRUE"; 
				console.log(JSON.stringify(myJSON))
				alert('JSON Sent: ' + JSON.stringify(myJSON))
				//create test of SQL Script 
				testSQL = "SELECT " + qFields + " FROM " + qTable;
				where = " WHERE ";
				if(myJSON['filters'].length > 0){
					myJSON['filters'].forEach( function ( filter ) {
						where += filter['field'] += " IN ("
						for (var i = 0; i < filter['values'].length; i++) {
							where += "'" + filter['values'][i] + "'"
							if(i != filter['values'].length-1){
								where += ", "
							}
						}
						where += ") "
						testSQL = testSQL + where;
						where = " AND ";
					});
				}
				alert('Expected SQL: ' + testSQL)
			}
			
			//Send JSON to the REST API using fetch and get result
			let fetchData = { 
				method: 'POST', 
				body: JSON.stringify(myJSON),
				headers: {
				  'Accept': 'application/json',
				  'Content-Type': 'application/json'
				}
			}
			fetch(qRestAPI, fetchData)
			.then((resp) => resp.json()) // Transform the data into json
			.then(function(data) {
				if(layout.qDebug){
					alert('JSON Received: ' + JSON.stringify(data))
				}
				renderTable(data)
			 })
			 .catch(function(error) {
				console.log("There was an error fetching data from the LiveTable REST API: " + error)
			 });   

			 
			$element[0].style.overflowX = "scroll";
			$element[0].style.overflowY = "scroll";
			$element.show();
            $('table').show();

        }
		
    };
	
});
