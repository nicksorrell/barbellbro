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

$(function() {
  // Define vars for canvas operations and the active weight set
  var activeWeightSet = barbellBro.getWeightSet( barbellBro.getSetting( 'activeWeightSet' ) ),
      canvas = document.getElementById('grafix'),
      ctx = canvas.getContext("2d"),
      weightImgs = [],
      imgObj, imgObj2,
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
    //if(weight < 45) weight = 45;

    var response = barbellBro.setWeight(weight, warmup),
        theWeight = response.weight,
        theResults = response.results,
        weightTd,
        weightTr;


    /*************
    * CANVAS STUFF (start)
    **************/

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    grd = ctx.createLinearGradient(0,90,0,60);
    grd.addColorStop(0,"#555");
    grd.addColorStop(1,"#ccc");

    drawCount = 0;
    weightSize = 0;

    imgObj = new Image();
    imgObj.src = 'img/bar.png';
    imgObj.onload = function(){
      ctx.drawImage( imgObj, 0, canvas.height/2 - 20, canvas.width * 0.95, 40 );

      imgObj2 = new Image();
      imgObj2.src = 'img/barstop.png';
      imgObj2.onload = function(){
        ctx.drawImage( imgObj2, 5, canvas.height / 2 - (80 / 2), 30, 80 );
      };
    };

    var imgMaker = function(img, drawCount, weightSize){
        ctx.drawImage( img, drawCount * 35 + ( i > 0 ? 35 : 0 ), canvas.height / 2 - ( 100 + canvas.height*( weightSize/100 ) ) / 2 , 35, 100 + canvas.height * ( weightSize/100 ) );
        ctx.font = "18px Arial";
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.fillText( weightSize, ( drawCount * 35 ) + 17.5 + ( i > 0 ? 35 : 0 ), canvas.height / 2 + 5 );
    };

    for(var i = 0; i < theResults.length; i++ ) {
      if(theResults[i] > 0) {
        weightSize = activeWeightSet.weights[i];
        for(var j = 0; j < theResults[i]; j++){
          weightImgs[drawCount] = new Image();
          weightImgs[drawCount].src = 'img/plate.png';
          weightImgs[drawCount].onload = function(){
            var _drawCount = drawCount,
                _weightSize = weightSize;

            return function(){
              //ctx.drawImage( this, _drawCount*40, ((canvas.height/2)-(100 + _weightSize/2)), 35, 100 * (1 + _weightSize/100) );
              ctx.drawImage( this, _drawCount * 35 + ( i > 0 ? 35 : 0 ), canvas.height / 2 - ( 100 + canvas.height*( _weightSize/100 ) ) / 2 , 35, 100 + canvas.height * ( _weightSize/100 ) );
              ctx.font = "18px Arial";
              ctx.fillStyle = "#FFF";
              ctx.textAlign = "center";
              ctx.fillText( _weightSize, ( _drawCount * 35 ) + 17.5 + ( i > 0 ? 35 : 0 ), canvas.height / 2 + 5 );
            };
          }();

          drawCount++;
        }
      }
    }

    /*************
    * CANVAS STUFF (end)
    **************/

    $('input[name="weightInput"]').val( theWeight );
    $('#weightTable').html("");

    weightTr = $('<tr>');
    for (i = 0; i < theResults.length; i++){
      weightTd = (theResults[i] === 0) ?
        //TO DO: SEE ABOUT THE LINE BELOW ACTING WEIRD WITH THE GETTER
        $('<td class="zero ' + (barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].weightStatus[ i ] == 1 ? '' : 'inactive') + '" data-num="' + i + '">') :
        $('<td class="' + (activeWeightSet.weightStatus[ i ] == 1 ? '' : 'inactive') + '" data-num="' + i + '">');
      weightTd.append( '<p class="heading">' + activeWeightSet.weights[i] + '</p><p>' + theResults[i] +'</p>');
      weightTr.append( weightTd );
    }

    $('#weightTable').append(weightTr);
  }

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

  function init() {
    barbellBro.loadSettings();
    if( barbellBro.getSetting( 'firstUse' ) ) {
      showModal('first-use');
    }

    $('.metric').append( " (" + (barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].type == "US" ? "lb" : "kg") + ")" );

    //Set up UI with initial calculation of 0, then clear the input to show the PH text
    updateDisplay(0);
    $('input[name="weightInput"]').val('');

    $('#bumpWeight').html( activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] );

    //DO I NEED TO MAKE THIS ADJUST IF THE LOWEST WEIGHT IS TOGGLED OFF?
    $('button.btn-bump').first().attr('data-increment', activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 ).html( "+" + activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 );
    $('button.btn-bump').last().attr('data-increment', -( activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 ) ).html( -( activeWeightSet.weights[ activeWeightSet.weights.length - 1 ] * 2 ) );

    $('button.btn-warmup').on('click', function(){
      if( $(this).data( 'percent' ) == "100") {
        updateDisplay( barbellBro.getSetting( 'activeWeight' ), false );
      } else {
        updateDisplay( barbellBro.getSetting( 'activeWeight' ) * ( $(this).data( 'percent' ) / 100 ), true );
      }

      $('button.btn-warmup').removeClass('active');
      $(this).addClass('active');
    });

    $('button.btn-bump').on('click', function(){
      var activeWeight = barbellBro.getSetting( 'activeWeight' );
      updateDisplay( activeWeight += $(this).data( 'increment' ) );
    });

    $('input[name="weightInput"]').on('keydown', function(e){
      if(event.keyCode < 48 || event.keyCode > 57){
        e.preventDefault();
      }
    });

    $('input[name="weightInput"]').on('keyup', function(){
      updateDisplay( Number( $(this).val() ) );
    });

    $('input').on('click', function(){
      $(this).val("");
    });

    $('#weightTable').on('click', 'td', function(){
      barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].weightStatus[ $(this).data('num') ] =
        barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].weightStatus[ $(this).data('num') ] == 1 ? 0 : 1;

      updateDisplay( Number( $('input[name="weightInput"]').val() ), barbellBro.session.warmup );
    });
  }

  init();

});
