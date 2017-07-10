var tempMonitor = new Vue({
	el:"#tempMonitor",
	data:{
		appName: "Temperature Monitor",
		userName: '',
		isOnline:false,
		header1: "header1",
		displayOptions:[],
		tempHeader: "Temperature: ",
		tempValue: 50,
		humidityHeader:"Humidity: ",
		humidityValue: "45%",
	},
});