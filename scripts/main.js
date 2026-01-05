Vue.use(VueResource); //Required for GET requests

let app = new Vue({
  el: "#vue",
  data: {
    carID: "Demo", //eChook ID
    buttonText: "Go!",
    status: "Idle",
    carData: { // This holds the latest data and is accessible in HTML with {{carData.dataName}}
      updated: 0,
      voltage: 0,
      voltageLow: 0,
      voltageHigh: 0,
      current: 0,
      rpm: 0,
      speed: 0,
      t1: 0,
      t2: 0,
      ampHours: 0,
      lap: 0,
      gear: 0,
      brake: 0,
      throttle: 0
    },
    polling: null
  },
  methods: {
    getData: function() {
      // This function is called periodically and asks the server for the latest data for your ID
      // It passes the data to the updateData function.
      var self = this;
      this.$http.get(`https://data.echook.uk/api/get/${this.carID}`).then(function(response) {
        if (response.status == "200") {
          // console.log(response.data);
          this.status = `Getting Data from ${this.carID}`; //Update Status text
          if (this.polling != null) { // after stop is pressed previously requested data may still be coming in
            this.updateData(response.data); //Call updateData function, passing new data
          }
        }
      })
    },
    startPolling: function() {
      // This function is called when you press the go/stop button.
      if (this.polling === null) {
        // The polling variable holds the repeating function call.
        // if it is null, we're not requesting data, so the button needs to start requesting
        this.status = `Getting Data from ${this.carID}`; // Updates status with the ID being used`
        this.buttonText = "Stop"; //Changes button text to stop
        console.log(`Start Polling`);
        this.getData() // First request before poll interval, otherwise it waits the poll interval before first request
        this.polling = setInterval(() => {
          this.getData();
        }, 2000); // Calls getData every 2000ms
      } else {
        //Polling != null, therefore we have pressed the stop button
        console.log("Stop");
        clearInterval(this.polling) // Stops polling
        this.polling = null; // Sets polling variable to null
        this.status = "Idle"; // Sets Status Text
        this.buttonText = "Go!"; // Sets buttont text

      }

    },
    updateData: function(data) {
      if (data.voltage != undefined) this.carData.voltage = Number(data.voltage).toFixed(2);
      if (data.voltageLower != undefined) this.carData.voltageLow = Number(data.voltageLower).toFixed(2);
      if (data.voltage != undefined && data.voltageLower != undefined) this.carData.voltageHigh = Number(data.voltage - data.voltageLower).toFixed(2);
      if (data.current != undefined) this.carData.current = Number(data.current).toFixed(2);
      if (data.rpm != undefined) this.carData.rpm = Number(data.rpm).toFixed(0);
      if (data.speed != undefined) this.carData.speed = Number(data.speed).toFixed(2);
      if (data.throttle != undefined) this.carData.throttle = Number(data.throttle).toFixed(0);
      if (data.temp1 != undefined) this.carData.t1 = Number(data.temp1).toFixed(2);
      if (data.temp2 != undefined) this.carData.t2 = Number(data.temp2).toFixed(2);
      if (data.currLap != undefined) this.carData.lap = Number(data.currLap).toFixed(0);
    }
  },
  beforeDestroy() {
    clearInterval(this.polling)
  }

})