
var tempMonitor = new Vue({
	el:"#tempMonitor",
	data:{
		appState: 0,
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
		showSoilMoisture:false,
		soilMoistureHeader:"Soil Moisture: ",
		soilMoistureValue: null,
		showHistoric:false,
		showSession:false,
		historicData:null,
		sessionData:[],
		timeInterval:null,
		newTimestampArray:[],
		newTempArray:[],
		newHumidityArray:[],
		tempChart:null,
		humidityChart:null,
		firebaseKey:null,
	},
	methods:{
		displayCurrentInfo:function(){
			if(this.appState===0){
				this.appState=1;
				this.statusBtnText="Stop Collecting Data";
				this.isOnline=true;
			}
			else if (this.appState===1){
				this.appState=0;
				this.statusBtnText="Start Collecting Data";
				this.isOnline=false;
				clearInterval(tempMonitor.timeInterval);
				firebase.database().ref().child("status").update({
					"isRecording":false,
				});
			}
			
			if(tempMonitor.appState===1){
				//reset session data arrays so duplicate data isn't appended when user clicks collect data button 2nd time.
				tempMonitor.newTimestampArray=[];
				tempMonitor.newTempArray=[];
				tempMonitor.newHumidityArray=[];
				tempMonitor.sessionData=[];

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
				firebase.database().ref().child("historic_sessions").child("-KpRXX9lJgH8d3Og530e").child("data").on("child_added", function(snapshot) {
					
						tempMonitor.tempValue = snapshot.val().temperature;
						tempMonitor.humidityValue = snapshot.val().humidity;
						tempMonitor.soilMoistureValue = snapshot.val().pressure;
						timestamp= snapshot.val().timestamp;
						
						var newRecord = {
							"session_name":tempMonitor.sessionName,
							"time":timestamp,
							"temp":tempMonitor.tempValue,
							"humidity":tempMonitor.humidityValue,
							"soilMoisture":tempMonitor.soilMoistureValue,
						};
						tempMonitor.sessionData.push(newRecord);
						tempMonitor.newTimestampArray.push(timestamp);
						tempMonitor.newTempArray.push(tempMonitor.tempValue);
						tempMonitor.newHumidityArray.push(tempMonitor.humidityValue);
						Chart.defaults.global.animation=false;
						tempMonitor.sessionTempChart();
						tempMonitor.sessionHumidityChart();			
				});
			}
		},
		
		displayHistoricInfo:function(){
			if(this.showHistoric===false){
				this.showHistoric=true;
				this.dataToggleText="Hide Historic Data";
				this.historicData=testData.historicConditions;
			}
			else{
				this.showHistoric=false;
				this.dataToggleText="Show Historic Data";
			}
			
		},
		displaySessionInfo:function(){
			if(this.showSession===false){
				this.showSession=true;
				this.sessionToggleText="Hide Session Data";
				this.sessionTempChart();
				this.sessionHumidityChart();
			}
			else{
				this.showSession=false;
				this.sessionToggleText="Show Session Data";
			}
			
		},
		sessionTempChart:function(){		
			
			var option={
				responsive:true,
			};
			var data = {
			    labels: this.limitLabels(this.newTimestampArray),
			    datasets: [
			        {
			            label: "Temp Chart",
			            fillColor: "rgba(151,187,205,0.2)",
			            strokeColor: "rgba(151,187,205,1)",
			            pointColor: "rgba(151,187,205,1)",
			            pointStrokeColor: "#fff",
			            pointHighlightFill: "#fff",
			            pointHighlightStroke: "rgba(151,187,205,1)",
			            data: this.newTempArray,
			        }
			    ]
			};
			var ctx = document.getElementById("sessionTempChart").getContext('2d');
    		this.tempChart = new Chart(ctx).Line(data, option); //'Line' defines type of the chart.

		},
		sessionHumidityChart:function(){
			var option={
				responsive:true,
			};
			var data = {
			    labels: this.limitLabels(this.newTimestampArray),
			    datasets: [
			        {
			            label: "Humidity Chart",
			            fillColor: "rgba(220,220,220,0.2)",
			            strokeColor: "rgba(220,220,220,1)",
			            pointColor: "rgba(220,220,220,1)",
			            pointStrokeColor: "#fff",
			            pointHighlightFill: "#fff",
			            pointHighlightStroke: "rgba(220,220,220,1)",
			            data: this.newHumidityArray,
			        },
			    ]
			};
			var ctx = document.getElementById("sessionHumidityChart").getContext('2d');
    		this.humidityChart = new Chart(ctx).Line(data, option); //'Line' defines type of the chart.
		},
		//only show 5 labels for array of time after large number of data points for readability
		limitLabels:function(array){
			if(array.length>12){
				var firstLabel = array[0];
				var lastLabel = array[array.length -1];
				var label25 = array[Math.floor(array.length/4)];
				var label50 = array[Math.floor((array.length/4)*2)];
				var label75 = array[Math.floor((array.length/4)*3)];
				var newLabelArray = [];

				for (var i=0;i<this.newTimestampArray.length;i++){
					newLabelArray[i]="";
				}
				newLabelArray[0]=firstLabel;
				newLabelArray[Math.floor(array.length/4)]=label25;
				newLabelArray[Math.floor(array.length/4)*2]=label50;
				newLabelArray[Math.floor(array.length/4)*3]=label75;
				newLabelArray[array.length -1]=lastLabel;
			}
			else{
				var newLabelArray = array;
			}
			return (newLabelArray);	
		},
		initFirebase:function(){
			firebase.initializeApp(keys.firebaseKeys);
		},
	},
});

firebase.initializeApp(firebaseKeys);