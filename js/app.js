var tempMonitor = new Vue({
	el:"#tempMonitor",
	data:{
		//variable button and warning text
		appState: "standby",
		dataToggleText: "Show Historic Data",
		sessionToggleText: "Show Session Data",
		sessionName: '',
		statusBtnText: "Start Collecting Data",
		inputWarning:null,
		
		//following variables set to show/hide sections on index html
		showTemp:false,
		showHumidity:false,
		showHistoric:false,
		showSession:false,
		showWarning:false,
		
		//updates button classes
		isRecording:false,
		
		//updates to current sensor data panel
		tempValue: null,
		humidityValue: null,

		//target values for temp, humidity
		targetTemp:null,
		targetHumidity:null,
		
		//updates historic and session data tables
		historicData:[],
		sessionData:[],
		
		//dropdown selection for historic data set
		historicSelected:null,
		//available historic datasets
		historicDataArray:[],
		
		//dropdown sensor selection (if null, will display "No Sensors available")
		sensorSelected:null,
		//if true, will display "No Sensors available" on dropdown
		noSensors:true,
		//available sensors which are currently online
		sensorArray:[],
		
		//variables for all chart objects - will simply update data and not redraw when new data is available
		tempChart:null,
		humidityChart:null,
		historicTempChart:null,
		historicHumidityChart:null,

		//current session key - used for saving data to firebase
		sessionKey:null,
	},
	methods:{
		startRecording:function(){
			//check that session name has been entered
			if(this.sessionName !== ""){
				this.inputWarning = null;
				this.showWarning = false;
				//check that sensor has been selected
				if(this.sensorSelected !== null){
					this.inputWarning = null;
					this.showWarning=false;
					//check to see that sensor isn't already recording
					if(this.appState==="standby"){
						this.appState="recording";
						this.statusBtnText="Stop Collecting Data";
						this.isRecording=true;
						//get new key to save current session data
						this.sessionKey = firebase.database().ref().child("historic_sessions").push().getKey();

						//set initial session data
						firebase.database().ref().child("historic_sessions").child(this.sessionKey).set({
							"name": tempMonitor.sessionName,
							"start_time": moment().format("YYYY-MM-DD HH:mm:ss"),
						});

						//if not set to "off", rasberry pi will record data.
						firebase.database().ref().child("sensors").child(tempMonitor.sensorSelected).update({
							"current_session":this.sessionKey,
							"isRecording":true,
						});
						this.updateSessionInfo();
					}
					//if already recording, user is stoping the data collection
					else if (this.appState==="recording"){
						this.appState="standby";
						this.statusBtnText="Start Collecting Data";
						this.isRecording=false;
						firebase.database().ref().child("sensors").child(tempMonitor.sensorSelected).update({
							"isRecording":false,
						});	
					}
				}
				else{
					this.showWarning=true;
					this.inputWarning = "You must select a sensor to start recording";
				}
			}
			else{
				this.showWarning=true;
				this.inputWarning = "You must enter a session name to start recording";
			}	
		},
		displaySessionInfo:function(){
			//show session charts and data table
			if(this.showSession===false){
				this.showSession=true;
				this.sessionToggleText="Hide Session Data";
				this.updateSessionInfo();
			}
			else{
				this.showSession=false;
				this.sessionToggleText="Show Session Data";
			}		
		},
		updateSessionInfo:function(){
			//reset session data arrays so duplicate data isn't appended to charts.
			var newTimestampArray=[];
			var newTempArray=[];
			var newHumidityArray=[];
			  
			tempMonitor.sessionData=[];

			//for each datapoint in firebase for current session, update charts and data tables
			if(this.sessionKey !== null){
				firebase.database().ref().child("historic_sessions").child(this.sessionKey).child("data").on("child_added", function(snapshot) {
					
					tempMonitor.tempValue = snapshot.val().temperature;
					tempMonitor.humidityValue = snapshot.val().humidity;
					timestamp= snapshot.val().timestamp;
					
					var newRecord = {
						"time":timestamp,
						"temp":tempMonitor.tempValue,
						"humidity":tempMonitor.humidityValue,
					};
					tempMonitor.sessionData.push(newRecord);
					newTimestampArray.push(timestamp); 
					newTempArray.push(parseFloat(tempMonitor.tempValue));
					newHumidityArray.push(parseFloat(tempMonitor.humidityValue));
					tempMonitor.tempChart.series[0].update({data: newTempArray});
					tempMonitor.tempChart.xAxis[0].update({categories:tempMonitor.limitLabels(newTimestampArray)});
					tempMonitor.humidityChart.series[0].update({data: newHumidityArray});
					tempMonitor.humidityChart.xAxis[0].update({categories:tempMonitor.limitLabels(newTimestampArray)});
				});
			}
		},
		displayHistoricInfo:function(){
			this.showWarning=false;
			//check to make sure a dataset has been chosen
			if (this.historicSelected !== null){
				//show historic charts and data tables
				if(this.showHistoric===false){
					this.showHistoric=true;
					this.updateHistoricInfo();
					this.dataToggleText="Hide Historic Data";
				}
				//hide historic charts and data tables
				else{
					this.showHistoric=false;
					this.dataToggleText="Show Historic Data";
				}
			}
			else{
				this.showWarning=true;
				this.inputWarning= "You must select a historic session to display information";
			}
		},
		updateHistoricInfo:function(){
			//reset session data arrays so duplicate data isn't appended to charts.
			this.historicData=[];
			var historicTempArray=[];
			//var reducedLabelArray=[];
			var historicHumidityArray=[];
			var historicTimestampArray=[];

			
			//for each datapoint in firebase for historic session, update charts and data tables
			firebase.database().ref().child("historic_sessions").child(this.historicSelected).child("data").on("child_added", function(snapshot) {
		
				timestamp= snapshot.val().timestamp;

				var newRecord = {
					"time":timestamp,
					"temp":snapshot.val().temperature,
					"humidity":snapshot.val().humidity,
				};
				tempMonitor.historicData.push(newRecord);
				historicTempArray.push(parseFloat(snapshot.val().temperature));
				historicHumidityArray.push(parseFloat(snapshot.val().humidity));
				historicTimestampArray.push(timestamp);
				//reducedLabelArray = tempMonitor.limitLabels(historicTimestampArray);
				tempMonitor.historicTempChart.series[0].update({data: historicTempArray});
				tempMonitor.historicTempChart.xAxis[0].update({categories:tempMonitor.limitLabels(historicTimestampArray)});
				tempMonitor.historicHumidityChart.xAxis[0].update({categories:tempMonitor.limitLabels(historicTimestampArray)});
				tempMonitor.historicHumidityChart.series[0].update({data: historicHumidityArray});
			});
		},
		//this function limits the labels shown on charts if more than 12 data points
		limitLabels:function(array){
			// var newLabelArray=[];
			// if(array.length>12){
			// 	var firstLabel = array[0];
			// 	var lastLabel = array[array.length -1];
			// 	var label25 = array[Math.floor(array.length/4)];
			// 	var label50 = array[Math.floor((array.length/4)*2)];
			// 	var label75 = array[Math.floor((array.length/4)*3)];
			// 	for (var i=0;i<array.length;i++){
			// 		newLabelArray[i]="";
			// 	}
			// 	newLabelArray[0]=firstLabel;
			// 	newLabelArray[Math.floor(array.length/4)]=label25;
			// 	newLabelArray[Math.floor(array.length/4)*2]=label50;
			// 	newLabelArray[Math.floor(array.length/4)*3]=label75;
			// 	newLabelArray[array.length -1]=lastLabel;
			// 	return (newLabelArray);
			// }
			// else{
			// 	return (array);
			// }
			return(array);		
		}, 
		//init the session temp chart object
		initTempChart:function(){
    		tempMonitor.tempChart = new Highcharts.chart('sessionTempChart', {
			        chart: {
			            type: 'line'
			        },
			        title: {
			            text: 'Temperature'
			        },
			        yAxis: {
			            title: {
			                text: 'Temperature'
			            }
			        },
					series: [{
			            name: 'Temperature',
			            data: []
			        }]
			    });
		},
		//init the session humidity chart object
		initHumidityChart:function(){
			tempMonitor.humidityChart = new Highcharts.chart('sessionHumidityChart', {
			        chart: {
			            type: 'area'
			        },
			        title: {
			            text: 'Humidity'
			        },
			        yAxis: {
			            title: {
			                text: 'Humidity'
			            }
			        },
			        series: [{
			            name: 'Humidity',
			            data: []
			        }]
			    });
		},
		//init the historic temp chart object
		initHistoricTempChart:function(){
			tempMonitor.historicTempChart = new Highcharts.chart('historicTempChart', {
				chart: {
					type: 'line'
				},
				title: {
					text: 'Temperature'
				},
				yAxis: {
					title: {
						text: 'Temperature'
					}
				},
				series: [{
					name: 'Temperature',
					data: []
				}]
			});
		},
		//init the historic humidity chart object
		initHistoricHumidityChart:function(){
			tempMonitor.historicHumidityChart = new Highcharts.chart('historicHumidityChart', {
			        chart: {
			            type: 'area'
			        },
			        title: {
			            text: 'Humidity'
			        },
			        yAxis: {
			            title: {
			                text: 'Humidity'
			            }
			        },
			        series: [{
			            name: 'Humidity',
			            data: []
			        }]
			    });
		},
		//initialize firebase and set initial display values for dropdowns
		initFirebase:function(){
			firebase.initializeApp(firebaseKeys);
			
			firebase.database().ref('.info/connected').on('value', function(snapshot) {
				if (snapshot.val() === true) {
					// We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
					console.log("connected to firebase");
					var connection = firebase.database().ref('status/connections/webclient').push();

					// When I disconnect, remove this device
					connection.onDisconnect().remove();
					
					// Add this device to my connections list
					// this value could contain info about the device or a timestamp too
					connection.set(true);
				}
			});
			//update list of historic records available
			firebase.database().ref().child("historic_sessions").on("child_added", function(snapshot) {
				var key = snapshot.getKey();
				var newName = {
					"key":key,
					"show": false,
					"name": snapshot.val().name,
				};
				tempMonitor.historicDataArray.push(newName);
			});
			//update list of online sensors
			firebase.database().ref().child("sensors").on("child_added", function(snapshot){
				tempMonitor.sensorArray.push(snapshot.getKey());
				if(tempMonitor.sensorArray !== null){
					tempMonitor.noSensors=false;
				}
			});
		},
		initApp:function(){
			this.initFirebase();
			this.initTempChart();
			this.initHumidityChart();
			this.initHistoricTempChart();
			this.initHistoricHumidityChart();
		},
		setTargetTemp:function(){
			//TODO:
			//Set target temperature for each session
			//if current temp > target temp (+2 deg? - what is appropriate +/-?) update firebase on/off value for relay
			//if current temp < target temp (-2 deg?), update firebase on/off value to turn off relay
			
			//add a new series to temp chart with target
			//could add another chart with visualization (show +/- variance)
			
		},
	},
});

tempMonitor.initApp();