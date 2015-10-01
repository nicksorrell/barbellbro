var barbellBro = {
  debugMode: true,

  settings: {
    config: {
        firstUse: 0,
        activeWeightSet: 0,
        activeWeight: 0
    },

    weightSets: [
      {
        name: "Regular",
        type: "US",
        weights: [ 45, 35, 25, 10, 5, 2.5, 1, 0.5 ],
        weightStatus: [ 1, 1, 1, 1, 1, 1, 1, 1 ]
      },
      {
        name: "Olympic",
        type: "metric",
        weights: [ 25, 20, 15, 10, 5, 2.5, 2, 1.5, 1, 0.5 ],
        weightStatus: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]
      },
    ]
  },

  session: {
    warmup: false
  },

  log: function(msg) {
    if(this.debugMode) {
      console.log(msg);
    }
  },

  setWeight: function(weight, warmup) {
    //save current weight value
    if(warmup != true) {
      this.session.warmup = false;
      this.log('Making working weight calculation...');
      this.settings.config.activeWeight = weight;
    } else {
      this.session.warmup = true;
      this.log('Making warmup calculation...');
    }

    //and calculate the plate load
    return this.calcWeight(weight);
  },

  calcWeight: function(weight) {
    //See what type of weights we're dealing with
    var startWeight = (this.settings.weightSets[ this.settings.config.activeWeightSet ].type == "US") ? ( ( weight - 45 ) / 2 ) : ( ( weight - 20 ) / 2 );
        weightSet = this.settings.weightSets[ this.settings.config.activeWeightSet ].weights,
        originalWeight = startWeight,
        numWeights = 0,
        results = [];

    if (startWeight < 0 ) {
      startWeight = 0;
    }

    this.log("Using weight set: '" + this.settings.weightSets[ this.settings.config.activeWeightSet ].name + "' (" + this.settings.weightSets[ this.settings.config.activeWeightSet ].type + ")" );
    this.log("Calculating weight for: " + weight + " (" + startWeight + " is our target with plates for each side.)");

    //look at each plate in the list
    for( var i = 0; i < weightSet.length; i++ ) {
      if(this.settings.weightSets[ this.settings.config.activeWeightSet ].weightStatus[i] == 1) {
        //if we can get a whole number of a certain plate, put that number on
        if( Math.floor( startWeight / weightSet[i] ) > 0 ) {
          this.log( weightSet[i] + ": " + Math.floor( startWeight / weightSet[i] ) );
          results.push( Math.floor( startWeight / weightSet[i] ) );
        } else {
          this.log( weightSet[i] + ": " + Math.floor( startWeight / weightSet[i] ) );
          results.push( 0 );
        }
        //remove that weight from the working total to figure out other plates
        startWeight -= Math.floor( startWeight / weightSet[i] ) * weightSet[i];
      } else {
        results.push( 0 );
      }
    }
    //return an array that matches the current active one in length
    return { weight: weight, results: results }
  },

  getSetting: function(setting) {
    return this.settings.config[String(setting)];
  },

  setSetting: function(setting, value) {
    if(this.settings.config[setting] != null && value != null)
      this.settings.config[setting] = String(value);
  },

  getWeightSet: function(setNum){
    return this.settings.weightSets[Number(setNum)];
  },

  saveSettings: function() {
    var settings = JSON.stringify(this.settings);
    localStorage.setItem("barbellBroSettings", settings);
    this.log("Saving settings... " + settings);
  },

  loadSettings: function() {
    if(localStorage.getItem("barbellBroSettings") != null) {
      this.settings = JSON.parse(localStorage.getItem("barbellBroSettings"));
      this.log("Loading settings... " + this.settings);
    } else {
      this.log("No saved settings");
    }
  },

  resetSettings: function(){
    if(localStorage.getItem("barbellBroSettings") != null) {
      localStorage.removeItem("barbellBroSettings");
      this.log("All settings reverted to default");
    }
  }
};
