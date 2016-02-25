/*****
 * FILE: ui.js
 * ---
 * This file defines all UI functionality for the app. The code is organized
 * in three main sections:
 *
 * 1. The 'updateDisplay' function which is responsibile for rendering weights
 *    on the canvas based on the results of the 'setWeight' app method.
 * 2. The 'showModal' method attached the window, which is used to load
 *    Bootstrap modals with AJAX for configuration screens.
 * 3. The 'init' function which defines all UI event listeners and states.
 *
 * The init function is called after the window has fully loaded.
 *****/

 /**
  * TODO: Make all template scripts be part of one object in UI.js, with one method for each page's JS
  * TODO: Make all templates be part of one JS object for efficiency?
  */

$(function() {
  // Define vars for canvas operations and the active weight set
  var activeWeightSet = {},
      canvas = document.getElementById('grafix'),
      ctx = canvas.getContext("2d"),
      weightImgObj = {},
      barImgObj = {},
      stopperImgObj = {},
      drawCount = 0;

  canvas.width = window.innerWidth;

  /*****
  * FUNCTION: updateDisplay
  * ---
  * Parameters:
  * - weight (Number): the target weight for which to do calculations
  * - warmup (Boolean): whether the calculation is for a warmup percentage
  *
  * Returns:
  * - undefined
  *
  * This function is primarily responsible for rendering calculated weights
  * on the canvas. Data is received from the 'setWeight' method, and looped
  * through to determine how to render weight graphics.
  *****/
  function updateDisplay(weight, warmup){
    /* Define vars and get the weight calculations from 'setWeight' method.
     * 'weightTd' and 'weightTr' are used to render the HTML table.
     * 'drawCount' and 'weightSize' are used to loop through weights.
     */
    var response = barbellBro.setWeight(weight, warmup),
        theWeight = response.weight,
        theResults = response.results,
        weightTd,
        weightTr,
        drawCount = 0,
        weightSize = 0;

    /*****
    * NOTE: Canvas operations begin below
    *****/
    // Define images and sources upfront to prevent loading issues
    barImgObj = new Image();
    barImgObj.src = 'img/bar.png';
    stopperImgObj = new Image();
    stopperImgObj.src = 'img/barstop.png';
    weightImgObj = new Image();
    weightImgObj.src = 'img/plate.png';

    /*****
    * INNER FUNCTION: drawBar
    * ---
    * Parameters:
    * - none
    *
    * Returns:
    * - undefined
    *
    * This function sets the 'onload' event for the weight bar image which
    * draws it on the canvas before calling the function to draw the stopper.
    *****/
    this.drawBar = function(){
      barImgObj.onload = function(){
        ctx.drawImage( barImgObj, 0, canvas.height/2 - 20, canvas.width * 0.95, 40 );
        drawStopper();
      };
    };

    /*****
    * INNER FUNCTION: drawStopper
    * ---
    * Parameters:
    * - none
    *
    * Returns:
    * - undefined
    *
    * This function sets the 'onload' event for the bar stopper image which
    * draws it on the canvas before calling the function to draw the weights.
    *****/
    this.drawStopper = function(){
      stopperImgObj.onload = function(){
        ctx.drawImage( stopperImgObj, 5, canvas.height / 2 - (80 / 2), 30, 80 );
        drawWeights();
      };
    };

    /*****
    * INNER FUNCTION: drawStopper
    * ---
    * Parameters:
    * - img (Image): the Image to draw on the canvas
    * - drawCount (Number): a counter used to position drawn weights
    * - weightSize (Number): used to set the height of a drawn weight
    *
    * Returns:
    * - undefined
    *
    * This function is called by 'drawWeights' to draw individual weights on
    * the canvas as the weight results are looped through.
    *****/
    this.weightMaker = function(img, drawCount, weightSize){
        ctx.drawImage( img, drawCount * 35 + ( i > 0 ? 35 : 0 ), canvas.height / 2 - ( 100 + canvas.height*( weightSize/100 ) ) / 2 , 35, 100 + canvas.height * ( weightSize/100 ) );
        ctx.font = "18px Arial";
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.fillText( weightSize, ( drawCount * 35 ) + 17.5 + ( i > 0 ? 35 : 0 ), canvas.height / 2 + 5 );
    };

    this.drawWeights = function(){
      for(var i = 0; i < theResults.length; i++ ) {
        if(theResults[i] > 0) {
          weightSize = activeWeightSet.weights[i];
          for(var j = 0; j < theResults[i]; j++){
            weightImgObj.onload = weightMaker(weightImgObj, drawCount, weightSize);
            drawCount++;
          }
        }
      }
    };

    // Clear the entire canvas so we can update it
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Start the drawing chain by drawing the bar on the canvas.
    drawBar();

    /*****
    * NOTE: Canvas operations end above
    *****/

    /* Update the weight input with the caculated value. This is used with
     * the warmup set buttons to show the currently calculated weight.
     */
    $('input[name="weightInput"]').val( theWeight );

    // Clear the weight table so it can be redrawn
    $('#weightTable').html("");

    /* Loop throw all the weights in the calculated results, and create a TD
     * fragment for each, ultimately attaching all to a TR fragment for the
     * table itself. Each cell's value is based on whether the weight is active
     * and required to meet the weight load or not.
     */
    weightTr = $('<tr>');

    for (i = 0; i < theResults.length; i++){
      if(theResults[i] === 0 ){
        weightTd = $('<td class="zero ' + (activeWeightSet.weightStatus[i] == 1 ? '' : 'inactive') + '" data-num="' + i + '">');
      } else {
        weightTd = $('<td class="' + (activeWeightSet.weightStatus[i] == 1 ? '' : 'inactive') + '" data-num="' + i + '">');
      }

      weightTd.append( '<p class="heading">' + activeWeightSet.weights[i] + '</p><p>' + theResults[i] +'</p>');
      weightTr.append( weightTd );
    }

    $('#weightTable').append(weightTr);
  }

  /*****
  * FUNCTION: showModal
  * ---
  * Parameters:
  * - target (String): the name of the target modal HTML template to load
  *
  * Returns:
  * - undefined
  *
  * This function takes in the name of a target modal HTML template to load,
  * and loads the data in a Bootstrap modal display. Each page uses the same
  * Bootstrap modal markup to appear correctly as a modal.
  *****/
  window.showModal = function(target){
    var urlString = 'templates/' + target + '.html';

    barbellBro.log("Attempting to load template: " + urlString);

    $.ajax({
      url: urlString
    }).done(function(data){
      $('#modalContainer').html('');
      $('#modalContainer').append(data);
      $('#modal').modal({ keyboard: false, backdrop: 'static' });
    });
  };

  /*****
  * FUNCTION: init
  * ---
  * Parameters:
  * - none
  *
  * Returns:
  * - undefined
  *
  * This function initializes the UI elements using any saved settings in
  * localStorage if they are available, and using a default set if not. The
  * weight table and bump buttons are initialized based on the active weight
  * set and the display updated with a value of 0 to begin. All event
  * listeners are also setup when the function is called.
  *****/
  function init() {
    // Attempt to load saved settings to begin with.
    barbellBro.loadSettings();

    activeWeightSet = barbellBro.getWeightSet( barbellBro.getSetting( 'activeWeightSet' ) );

    // If this is the users's first time in, display the first use modal
    if( barbellBro.getSetting( 'firstUse' ) ) {
      showModal('first-use');
    }

    $('.metric').html( "Plates Per Side (" + (barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].type == "US" ? "lb" : "kg") + ")" );

    //Set up UI with initial calc 0, then clear the input to show the PH text
    updateDisplay(0);
    $('input[name="weightInput"]').val('');

    // Set the bump button values to the lowest weight in the set
    $('#bumpWeight').html( activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] );

    $('button.btn-bump').first().attr('data-increment', activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 ).html( "+" + activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 );
    $('button.btn-bump').last().attr('data-increment', -( activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 ) ).html( -( activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 ) );

    // The warmup buttons temporarily calculate a percentage of the working weight
    $('button.btn-warmup').on('click', function(){
      if( $(this).data( 'percent' ) == "100") {
        updateDisplay( barbellBro.getSetting( 'activeWeight' ), false );
      } else {
        updateDisplay( barbellBro.getSetting( 'activeWeight' ) * ( $(this).data( 'percent' ) / 100 ), true );
      }

      $('button.btn-warmup').removeClass('active');
      $(this).addClass('active');
    });

    // The bump buttons bump the calculated weight up or down by their value
    $('button.btn-bump').on('click', function(){
      var activeWeight = barbellBro.getSetting( 'activeWeight' );
      updateDisplay( activeWeight += $(this).data( 'increment' ) );
    });

    // If an input for weight is not a number, ignore it.
    $('input[name="weightInput"]').on('keydown', function(e){
      if(event.keyCode < 48 || event.keyCode > 57){
        if(event.keyCode != 8){
          e.preventDefault();
        }
      }
    });

    // Clear the input when it's selected (for ease of use on mobile)
    $('input').on('click', function(){
      $(this).val("");
    });

    // Update the display with a calculation when a number is entered
    $('input[name="weightInput"]').on('keyup', function(){
      updateDisplay( Number( $(this).val() ) );
    });

    /* When a table cell in the weight list ic clicked, toggle the weight
     * on/off and recalculate to figure out required plates.
     */
    $('#weightTable').on('click', 'td', function(){
      barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].weightStatus[ $(this).data('num') ] =
        barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].weightStatus[ $(this).data('num') ] == 1 ? 0 : 1;

      updateDisplay( Number( $('input[name="weightInput"]').val() ), barbellBro.session.warmup );
    });
  }

  window.init = function(){ init(); };

  // Call the init function to kick everything off!
  init();
});
