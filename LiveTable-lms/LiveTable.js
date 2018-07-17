define(["jquery"], function($) {

    var qscPaintCounter = 0;
    if (!qscPaintCounter) {
        $("<style>").html("/* Live Table Embedded Styles */ \
		.myEditDiv {position: fixed; top:0;right:0;bottom:0;left:0; background:rgba(0,0,0,0.8); z-index:9999; opacity:0; -webkit-transition:opacity 400ms ease-in; -moz-transition:opacity 400ms ease-in; transition:opacity 400ms ease-in; pointer-events:none;} \
		.myEditDiv > div{font-size:14pt;	position:relative;	margin:5% auto;	padding: 5px 20px 10px 20px; border-radius:10px; background: #fff; background: -moz-linear-gradient(#fff, #999); background: -webkit-linear-gradient(#fff, #999); 	background: -o-linear-gradient(#fff, #999); } \
		tr {height:1.2em} \
		.fldLbl {padding-top:10px; padding-bottom:10px; text-align:left; font-weight:bold;} \
		.editable {readonly: false; width:100%;} \
		.thead {padding-top:10px; padding-bottom:10px; text-align:center; font-weight:bold;} \
		.header {border-bottom:1px solid silver; text-align:left; white-space:nowrap} \
		.record {border-bottom:1px solid silver; text-align:left; padding-right:5px; padding-top:1px; padding-bottom:1px;} \
		.thead_b {border:1px solid silver;padding-top:10px; padding-bottom:10px; text-align:center; ;} \
		.header_b {border:1px solid silver;text-align:left; white-space:nowrap} \
		.record_b {border:1px solid silver;text-align:left; padding-right:5px; padding-top:1px; padding-bottom:1px;} \
        ").appendTo("head");

		
		//Function to display vanilla editable form for selected record
		//---------------------------------------------------------------------------
		$(document).on("click", ".cancel", function(){
			var editdiv = document.getElementById('openModal');
			editdiv.style.opacity = "0";
			editdiv.style.pointerEvents = 'none';
		});

		
		//Function to display vanilla editable form for selected record
		//---------------------------------------------------------------------------
		$(document).on("click", ".edit", function(){
			key = $(this).attr("key");
			myJSON["filters"] = [{"field" : qKeyField, "values" : [key]}];
			myJSON["editFields"] = qEditFields;
			if(qDebug){
				console.log('JSON Sent: ' + JSON.stringify(myJSON));
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
				if(qDebug){
					console.log('JSON Received: ' + JSON.stringify(data))
				}
				renderForm(data)
			 })
			 .catch(function(error) {
				console.log("There was an error fetching data from the LiveTable REST API: " + error)
			 });   

			var editdiv = document.getElementById('openModal');
			editdiv.style.opacity = "1";
			editdiv.style.pointerEvents = 'auto';
		});
	
	
		//Function to render the vanilla data entry form
		//------------------------------------------------------------------------
		var renderForm = function (jsonData) {
			cols = jsonData["cols"];
			rows = jsonData["rows"];
			i = 0;
			keyNo = 0;
			thishtml = '<table id="editTable" width="90%" >';
			thishtml += '<tr><td>&nbsp</td><td>&nbsp</td><td style="text-align:right"><button type="button" class="cancel" >&nbsp X &nbsp</button></td></tr>';

			//create rows
			cols.forEach( function ( colname ) {
				if (colname!=qKeyField){
					thishtml += '<tr>';
					thishtml += '<td class="fldLbl">' + colname + '</td>';
					thishtml += '<td><input class="editable" id="' + colname + '" type="text" value="' + rows[0][i] + '" /></td>';
					thishtml += '<td>&nbsp</td>';
					thishtml += '</tr>';
				}
				i += 1;
			})
			thishtml += '<tr><td>&nbsp</td><td><button type="button" class="saveData" >Save Data</button></td></tr>';
			thishtml += '</table>';
			document.getElementById("dataEntry").innerHTML = thishtml;
		};
			
		
	}

    return {
		//---------------------------------------------------------------------------
		//Properties Panel
		//---------------------------------------------------------------------------
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
                    min: 0,
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
								},
								qMaxRows: {
									type: "integer",
									label: "Max rows to return",
									ref: "qMaxRows",
									defaultValue: "50"
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
								},
								qEditFields: {
									type: "string",
									label: "List of editable fields (optional)",
									ref: "qEditFields",
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
									label: "Display JSON in console",
									ref: "qDebug",
									defaultValue: false
								},
								qShowSQL: {
									type: "boolean",
									label: "Display SQL in REST console",
									ref: "qShowSQL",
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
						qscCellHtml.className = 'record'; 
						qscCellHtml.innerHTML = '<button type="button" class="edit" key="' + row[keyNo] + '">&nbsp edit &nbsp</button>';
						qscRowHtml.appendChild(qscCellHtml); 					
					}
					tableBody.appendChild(qscRowHtml); 
				})
			};

			//get extension configuration settings 
			qDebug = layout.qDebug;
			qRestAPI = layout.qRestAPI;
			qDataConn = layout.qDataConn;
			qTable = layout.qTableName;
			qFields = layout.qFieldNames;
			if (qFields.length==0){
				qFields = '*';
			}
			qEditFields = layout.qEditFields;
			if (qEditFields.length==0){
				qEditFields = '*';
			}
			qEditable = layout.qEditable;
			qKeyField = layout.qKeyField;
			qMaxRows = layout.qMaxRows;
			if (isNaN(qMaxRows)){
				qMaxRows = 50
			}

			//declare our table element
            var currentTableQvid = layout.qInfo.qId;
			var thishtml = '<div id="openModal" class="myEditDiv"><div id="dataEntry" style="width:500pt;height:80%;overflow:auto;"></div></div>'
			thishtml += '<div id="table-div" ><table id="qsc-table-' + currentTableQvid + '" class="qsc-pivot-table responsive" ><tbody id="qsc-table-body-' + currentTableQvid + '"></tbody></table></div>';
            $element.hide();
            $('table').hide();
            $element.html(thishtml);
			var tableBody = document.getElementById("qsc-table-body-" + currentTableQvid + "");
						
			//build JSON to submit to API
			myJSON = {
				"version" : "1.0", 
				"connection" : qDataConn, 
				"table" : qTable, 
				"fields" : qFields,
				"maxRows" : qMaxRows,
				"filters" : []
			}
			//add parameter to show SQL in REST API command window
			if (layout.qShowSQL){
				myJSON["debug"] = "TRUE";
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
			

			//Send JSON to the REST API using fetch and get result
			if(qDebug){
				console.log('JSON Sent: ' + JSON.stringify(myJSON))

			}
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
				if(qDebug){
					console.log('JSON Received: ' + JSON.stringify(data))
				}
				renderTable(data)
			 })
			 .catch(function(error) {
				console.log("There was an error fetching data from the LiveTable REST API: " + error)
			 });   

			const that = this;

			//Function to save edited record
			//---------------------------------------------------------------------------
			$(document).on("click", ".saveData", function(){
				//get values from table
				values = {};
				$('.editable').each(function(index, item) {
					if($(item).attr('id') != qKeyField){
						values[$(item).attr('id')] = $(item).val();
					}
				});
				if(qDebug){
					console.log('JSON Sent: ' + JSON.stringify(myJSON))
				}
				//add new values to JSON (filters should still match single record)
				myJSON["values"] = values;
				//Send JSON to the REST API using fetch and get result
				let fetchData = { 
					method: 'PUT', 
					body: JSON.stringify(myJSON),
					headers: {
					  'Accept': 'application/json',
					  'Content-Type': 'application/json'
					}
				}
				fetch(qRestAPI, fetchData)
				.then((resp) => resp.json()) // Transform the data into json
				.then(function(data) {
					if(qDebug){
						console.log('JSON Received: ' + JSON.stringify(data))
					}
					that.paint($element, layout)
				 })
				 .catch(function(error) {
					console.log("There was an error fetching data from the LiveTable REST API: " + error)
				 });    
				
			});
			

			 
			$element[0].style.overflowX = "scroll";
			$element[0].style.overflowY = "scroll";
			$element.show();
            $('table').show();

        }
		
    };
	
});
