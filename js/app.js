
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
		sessionData:null,
		timeInterval:null,
		newTimestampArray:[],
		newTempArray:[],
		newHumidityArray:[],
		tempChart:null,
		humidityChart:null,
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
			}
			
			//show updated data every 5 seconds and log it to the newData array
			if(tempMonitor.appState===1){
				tempMonitor.timeInterval=window.setInterval(function(){
						//placeholders for now - will reset to input from rasberry pi api
						tempMonitor.tempValue = Math.floor(Math.random()*20)+50;
						tempMonitor.humidityValue = Math.floor(Math.random()*100);
						tempMonitor.soilMoistureValue = Math.floor(Math.random()*100);
						var timestamp= moment().format("LTS");
						var datestamp=moment().format('L')
						
						var newRecord = {
							"session_name":tempMonitor.sessionName,
							"date":datestamp,
							"time":timestamp,
							"temp":tempMonitor.tempValue,
							"humidity":tempMonitor.humidityValue,
							"soilMoisture":tempMonitor.soilMoistureValue,
						};
						newData.push(newRecord);
						tempMonitor.newTimestampArray.push(timestamp);
						tempMonitor.newTempArray.push(tempMonitor.tempValue);
						tempMonitor.newHumidityArray.push(tempMonitor.humidityValue);
						Chart.defaults.global.animation=false;
						tempMonitor.sessionTempChart();
						tempMonitor.sessionHumidityChart();			
				},5000);
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
				this.sessionData=newData;
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
			    labels: this.newTimestampArray,
			    datasets: [
			        {
			            label: "My Second dataset",
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
			    labels: this.newTimestampArray,
			    datasets: [
			        {
			            label: "My First dataset",
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
	},
});