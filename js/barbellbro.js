/*****
 * FILE: barbellbro.js
 * ---
 * This file defines the main app object. The app object contains all its
 * functioanlity, such as configuration vars, getter and setter functions,
 * and the main weight calculation function, 'calcWeight'.
 *
 * It is designed to work with external UI functionality that uses
 * data returned from the 'calcWeight' function.
 *****/

var barbellBro = {
  // Debug mode is used in the 'log' function to enable console logging.
  debugMode: false,

  tempData: {},

  /* The settings object contains settings used during operation, such as
   * the defined weight sets, and the active calculated weight.
   */
  settings: {
    config: {
        firstUse: true,
        metric: 'lbs',
        activeWeightSet: 0,
        activeWeight: 0,
    },

    /* The weightSets array contains defined weight sets. The first two are
     * the default sets.
     *
     * Weight sets have the following attributes:
     * - Name (String): The name of the weight set
     * - Type (String): Either US/Imperial or Metric
     * - Weights (Array): The weights available in the set
     * - WeightStatus (Array): The active state of each weight. This array
     *   MUST be the same length as the weights array in the parent object.
     */
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
      {
        name: "Regular (Custom)",
        type: "US",
        weights: [],
        weightStatus: []
      },
      {
        name: "Olympic (Custom)",
        type: "metric",
        weights: [],
        weightStatus: []
      }
    ]
  },

  /* The session object holds temporary data for operation, such as whether
   * the user is viewing warmup weight values for their working weight or not.
   */
  session: {
    warmup: false
  },

  /*****
  * FUNCTION: log
  * ---
  * Parameters:
  * - msg (String): A message to be logged on the console
  *
  * Returns:
  * - A call to console.log method passing the 'msg' parameter
  *
  * This function takes in a message string and logs it to the console if
  * debug mode is active.
  *****/
  log: function(msg) {
    if(this.debugMode) {
      return console.log(msg);
    }
  },

  /*****
  * FUNCTION: setWeight
  * ---
  * Parameters:
  * - weight (Number): the target weight for which to do calculations
  * - warmup (Boolean): whether the calculation is for a warmup percentage
  *   of the weight or not
  *
  * Returns:
  * - a call to the 'calcWeight' function passing the 'weight' parameter
  *
  * This function first checks whether a warmup or working weight calculation
  * is being made, then passes the weight value to the 'calcWeight' function
  * for calculation.
  *****/
  setWeight: function(weight, warmup) {
    if(warmup !== true) {
      this.session.warmup = false;
      this.log('Making working weight calculation...');
      this.settings.config.activeWeight = weight;
    } else {
      this.session.warmup = true;
      this.log('Making warmup calculation...');
    }

    return this.calcWeight(weight);
  },

  /*****
  * FUNCTION: calcWeight
  * ---
  * Parameters:
  * - weight (Number): the target weight for which to calculate plate load.
  *
  * Returns:
  * - An object containing the weight value and an array of numbers which
  *   dictate how many plates to use
  *
  * This function takes a target weight and calculates the number of plates
  * to use based on the available active weights in the current active weight
  * set, e.g., # of 45's required to get as close to the target as possible,
  * then the number of 35's required, etc. down the list.
  *****/
  calcWeight: function(weight) {
    // Calculate the start weight based on metrics (lbs/kgs)
    var startWeight = (this.settings.weightSets[ this.settings.config.activeWeightSet ].type == "US") ? ( ( weight - 45 ) / 2 ) : ( ( weight - 20 ) / 2 ),
        weightSet = this.settings.weightSets[ this.settings.config.activeWeightSet ].weights,
        originalWeight = startWeight,
        numWeights = 0,
        results = [];

    // No need to do negative calculations.
    if (startWeight < 0 ) {
      startWeight = 0;
    }

    this.log("Using weight set: '" +
      this.settings.weightSets[ this.settings.config.activeWeightSet ].name +
      "' (" + this.settings.weightSets[ this.settings.config.activeWeightSet ].type + ")" );
    this.log("Calculating weight for: " + weight + " (" + startWeight + " is our target with plates for each side.)");

    // Look at each plate in the active set.
    for( var i = 0; i < weightSet.length; i++ ) {
      // If a weight is active...
      if(this.settings.weightSets[ this.settings.config.activeWeightSet ].weightStatus[i] == 1) {
        // ...and we can get a whole number of a certain plate, attach it.
        if( Math.floor( startWeight / weightSet[i] ) > 0 ) {
          this.log( weightSet[i] + ": " + Math.floor( startWeight / weightSet[i] ) );
          results.push( Math.floor( startWeight / weightSet[i] ) );
        } else {
          this.log( weightSet[i] + ": " + Math.floor( startWeight / weightSet[i] ) );
          results.push( 0 );
        }
        // Remove that weight from the working total to figure out others.
        startWeight -= Math.floor( startWeight / weightSet[i] ) * weightSet[i];
      } else {
        results.push( 0 );
      }
    }
    // Finally return the results in an object
    return { weight: weight, results: results };
  },

  /*****
  * FUNCTION: getSetting
  * ---
  * Parameters:
  * - setting (String): the setting to look up
  *
  * Returns:
  * - The value of the referenced setting
  *
  * This function returns the config setting that matches the 'setting'
  * parameter. Only looks in the 'config' object.
  *****/
  getSetting: function(setting) {
    return this.settings.config[String(setting)];
  },

  /*****
  * FUNCTION: setSetting
  * ---
  * Parameters:
  * - setting (String): the setting to look up
  * - value (String): the value to set the specified setting
  *
  * Returns:
  * - undefined
  *
  * This function sets the config setting matching the 'setting' parameter to
  * the value in the 'value' parameter.
  *****/
  setSetting: function(setting, value) {
    if(this.settings.config[setting] !== null && value !== null) {
      this.settings.config[setting] = String(value);
    }
  },

  /*****
  * FUNCTION: getWeightSet
  * ---
  * Parameters:
  * - setNum (Number): the weight set to look up by number
  *
  * Returns:
  * - The object for the weight set specified by the index of 'setNum'
  *
  * This function returns the weight set object within the weightSets array
  * at the index specified by the 'setNum' paramater.
  *****/
  getWeightSet: function(setNum){
    return this.settings.weightSets[Number(setNum)];
  },

  /*****
  * FUNCTION: saveWeightSet
  *****/
  saveCustomWeightSet: function(set, settings) {
    if(set === 0 || set === 1) return;
    var theSet = barbellBro.settings.weightSets[set];
    if(theSet !== undefined) {
      theSet.weights = settings.weights;
      theSet.weightStatus = settings.weightStatus;
    }
  },

  /*****
  * FUNCTION: saveSettings
  * ---
  * Parameters:
  * - none
  *
  * Returns:
  * - undefined
  *
  * This function saves the settings in the localStorage object if available.
  *****/
  saveSettings: function() {
    if(window.localStorage !== undefined) {
      var settings = JSON.stringify(this.settings);
      localStorage.setItem("barbellBroSettings", settings);
      this.log("Saving settings... " + settings);
    } else {
      this.log("No localStorage available");
    }
  },

  /*****
  * FUNCTION: loadSettings
  * ---
  * Parameters:
  * - none
  *
  * Returns:
  * - undefined
  *
  * This function loads the settings in the localStorage object, if it is
  * available, and applies them to the app.
  *****/
  loadSettings: function() {
    if(localStorage.getItem("barbellBroSettings") !== null) {
      this.settings = JSON.parse(localStorage.getItem("barbellBroSettings"));
      this.log("Loading settings... " + this.settings);
    } else {
      this.log("No saved settings");
    }
  },

  /*****
  * FUNCTION: resetSettings
  * ---
  * Parameters:
  * - none
  *
  * Returns:
  * - undefined
  *
  * This function removes the settings object from localStorage, if available,
  * so that the hard-coded defaults will be used.
  *****/
  resetSettings: function(){
    if(localStorage.getItem("barbellBroSettings") !== null) {
      localStorage.removeItem("barbellBroSettings");
      this.log("All settings reverted to default");
    }
  }
};
