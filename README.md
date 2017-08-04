# Rasberry Pi Monitor

This is a monitor interface to manage data collection for a rasberry pi equipped with a BME280 Sensor.  A demo of the application is deployed using Firebase at [link to Demo](rasberrypi-68cfc.firebaseapp.com/).  Note that users won't likely be able to start recording new session data or look at the session charts unless a sensor is currently online and running the node.js version of the sensor application.  However, there is some sample historic data to show the data visualizations.  

The sensor application is available at [https://github.com/tstorti/RasberryPiSensor].  Additional documentation is available on that page.  

The appplication was developed using the Vue.js framework and responsive bootstrap layout. 

Charting functionality relies on HighCharts [link](https://www.highcharts.com/).

Sensor data is stored on a Firebase database. The web interface remotely controls sensors by updating specific firebase values which are watched by the sensor.

##### Contributors:
Tony Storti
