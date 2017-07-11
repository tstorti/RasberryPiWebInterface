
var tempMonitor = new Vue({
	el:"#tempMonitor",
	data:{
		appName: "Temperature Monitor",
		appState: 0,
		statusBtnText: "Start Collecting Data",
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
		historicData:null,
		timeInterval:null,

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
				this.tempValue = null;
				this.humidityValue = null;
				this.soilMoistureValue = null;
				clearInterval(tempMonitor.timeInterval);
			}
			
			//show updated data every 5 seconds and log it to the newData array
			if(tempMonitor.appState===1){
				tempMonitor.timeInterval=window.setInterval(function(){
						//placeholders for now - will reset to input from rasberry pi api
						tempMonitor.tempValue = Math.floor(Math.random()*20)+50;
						tempMonitor.humidityValue = Math.floor(Math.random()*100);
						tempMonitor.soilMoistureValue = Math.floor(Math.random()*100);
						
						var newRecord = {
							"session_name":tempMonitor.sessionName,
							"temp":tempMonitor.tempValue,
							"humidity":tempMonitor.humidityValue,
							"soilMoisture":tempMonitor.soilMoistureValue,
						};
						newData.push(newRecord);			
				},5000);
			}
		},
		
		displayHistoricInfo:function(){
			this.showHistoric=true;
			this.historicData=testData.historicConditions;
		},
	},
});