
var tempMonitor = new Vue({
	el:"#tempMonitor",
	data:{
		appState: "standby",
		statusBtnText: "Start Collecting Data",
		dataToggleText: "Show Historic Data",
		sessionToggleText: "Show Session Data",
		sessionName: '',
		isOnline:false,
		header1: "header1",
		displayOptions:[],
		showTemp:false,
		tempHeader: "Temperature: ",
		tempValue: null,
		showHumidity:false,
		humidityHeader:"Humidity: ",
		humidityValue: null,
		showHistoric:false,
		showSession:false,
		historicData:[],
		historicSelected:null,
		historicDataArray:[],
		sessionData:[],
		timeInterval:null,
		newTimestampArray:[],
		newTempArray:[],
		newHumidityArray:[],
		historicTempArray:[],
		historicHumidityArray:[],
		tempChart:null,
		humidityChart:null,
		historicTempChart:null,
		historicHumidityChart:null,
		humidityChart:null,
		firebaseKey:null,
		test:[1,2,3,4,5],
		inputWarning:null,
		showWarning:false,
	},
	methods:{
		displayCurrentInfo:function(){
			
			if(this.appState==="standby"){
				this.appState="recording";
				this.statusBtnText="Stop Collecting Data";
				this.isOnline=true;

				//reset session data arrays so duplicate data isn't appended when user clicks collect data button 2nd time.
				tempMonitor.newTimestampArray=[];
				tempMonitor.newTempArray=[];
				tempMonitor.newHumidityArray=[];
				tempMonitor.sessionData=[];

				//TODO - if Pi is not online, give warning and do not start saving data
				
				//get new key to save current session data
				firebaseKey = firebase.database().ref().child("historic_sessions").push().getKey();
				//if not set to "off", rasberry pi will record data.
				firebase.database().ref().child("status").update({
					"current_session":firebaseKey,
					"isRecording":true,
				});
				//set initial session data
				firebase.database().ref().child("historic_sessions").child(firebaseKey).set({
					"name": tempMonitor.sessionName,
					"start_time": moment().format("YYYY-MM-DD HH:mm:ss"),
				});

				//using historic data placeholder for now - need to replace child key with "firebaseKey"
				firebase.database().ref().child("historic_sessions").child(firebaseKey).child("data").on("child_added", function(snapshot) {
						
						tempMonitor.tempValue = snapshot.val().temperature;
						tempMonitor.humidityValue = snapshot.val().humidity;
						timestamp= snapshot.val().timestamp;
						
						var newRecord = {
							"time":timestamp,
							"temp":tempMonitor.tempValue,
							"humidity":tempMonitor.humidityValue,
						};
						tempMonitor.sessionData.push(newRecord);
						tempMonitor.newTimestampArray.push(timestamp);
						tempMonitor.newTempArray.push([timestamp,parseFloat(tempMonitor.tempValue)]);
						tempMonitor.newHumidityArray.push([timestamp,parseFloat(tempMonitor.humidityValue)]);
						tempMonitor.tempChart.series[0].update({data: tempMonitor.newTempArray});
						tempMonitor.humidityChart.series[0].update({data: tempMonitor.newHumidityArray});
				});
			}
			else if (this.appState==="recording"){
				this.appState="standby";
				this.statusBtnText="Start Collecting Data";
				this.isOnline=false;
				clearInterval(tempMonitor.timeInterval);
				firebase.database().ref().child("status").update({
					"isRecording":false,
				});	
			}		
		},
		
		displayHistoricInfo:function(){
			this.showWarning=false;
			if (this.historicSelected !== null){
				if(this.showHistoric===false){	
				this.historicData=[];
				this.historicTempArray=[];
				this.historicHumidityArray=[];
				this.showHistoric=true;
				this.dataToggleText="Hide Historic Data";
				
					firebase.database().ref().child("historic_sessions").child(this.historicSelected).child("data").on("child_added", function(snapshot) {
				
						timestamp= snapshot.val().timestamp;

						var newRecord = {
							"time":timestamp,
							"temp":snapshot.val().temperature,
							"humidity":snapshot.val().humidity,
						};
						tempMonitor.historicData.push(newRecord);
						tempMonitor.historicTempArray.push([timestamp,parseFloat(snapshot.val().temperature)]);
						tempMonitor.historicHumidityArray.push([timestamp,parseFloat(snapshot.val().humidity)]);
						tempMonitor.historicTempChart.series[0].update({data: tempMonitor.historicTempArray});
						tempMonitor.historicHumidityChart.series[0].update({data: tempMonitor.historicHumidityArray});
					});
				}
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
		displaySessionInfo:function(){
			if(this.showSession===false){
				this.showSession=true;
				this.sessionToggleText="Hide Session Data";
				tempMonitor.tempChart.series[0].update({data: tempMonitor.newTempArray});
				tempMonitor.humidityChart.series[0].update({data: tempMonitor.newHumidityArray});
			}
			else{
				this.showSession=false;
				this.sessionToggleText="Show Session Data";
			}		
		},
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
		//only show 5 labels for array of time after large number of data points for readability
		// limitLabels:function(array){
		// 	if(array.length>12){
		// 		var firstLabel = array[0];
		// 		var lastLabel = array[array.length -1];
		// 		var label25 = array[Math.floor(array.length/4)];
		// 		var label50 = array[Math.floor((array.length/4)*2)];
		// 		var label75 = array[Math.floor((array.length/4)*3)];
		// 		var newLabelArray = [];

		// 		for (var i=0;i<this.newTimestampArray.length;i++){
		// 			newLabelArray[i]="";
		// 		}
		// 		newLabelArray[0]=firstLabel;
		// 		newLabelArray[Math.floor(array.length/4)]=label25;
		// 		newLabelArray[Math.floor(array.length/4)*2]=label50;
		// 		newLabelArray[Math.floor(array.length/4)*3]=label75;
		// 		newLabelArray[array.length -1]=lastLabel;
		// 	}
		// 	else{
		// 		var newLabelArray = array;
		// 	}
		// 	return (newLabelArray);	
		// },
		initFirebase:function(){
			firebase.initializeApp(firebaseKeys);
			
			firebase.database().ref('.info/connected').on('value', function(snapshot) {
				if (snapshot.val() === true) {
					// We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
					console.log("connected");
					var connection = firebase.database().ref('status/connections/webclient').push();

					// When I disconnect, remove this device
					connection.onDisconnect().remove();
					
					// Add this device to my connections list
					// this value could contain info about the device or a timestamp too
					connection.set(true);
				}
			});
			firebase.database().ref().child("historic_sessions").on("child_added", function(snapshot) {
				var key = snapshot.getKey();
				var newName = {
					"key":key,
					"show": false,
					"name": snapshot.val().name,
				};
				tempMonitor.historicDataArray.push(newName);
			});

		},
	},
});

tempMonitor.initFirebase();
tempMonitor.initTempChart();
tempMonitor.initHumidityChart();
tempMonitor.initHistoricTempChart();
tempMonitor.initHistoricHumidityChart();