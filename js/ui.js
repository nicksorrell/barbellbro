$(function(){
  var activeWeightSet = barbellBro.getWeightSet( barbellBro.getSetting( 'activeWeightSet' ) ),
      tempWeightSet = [],
      weightStatus = 'on',
      canvas = document.getElementById('grafix'),
      ctx = canvas.getContext("2d"),
      weightImgs = [],
      imgObj, imgObj2,
      drawCount = 0;

  canvas.width = window.innerWidth;

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

    /*
    ctx.fillStyle = grd;
    ctx.fillRect( 0, 60, 300, 30);
    */

    imgObj = new Image();
    imgObj.src = 'img/bar.png';
    imgObj.onload = function(){
      ctx.drawImage( imgObj, 0, canvas.height/2 - 20, canvas.width * 0.95, 40 );
    };

    imgObj2 = new Image();
    imgObj2.src = 'img/barstop.png';
    imgObj2.onload = function(){
      ctx.drawImage( imgObj2, 5, canvas.height / 2 - (80 / 2), 30, 80 );
    };

    drawCount = 0;
    weightSize = 0;

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

  function init(){
    barbellBro.loadSettings();
    if( barbellBro.getSetting( 'firstUse' ) ) {
      showModal('first-use');
    }

    $('.metric').append( " (" + (barbellBro.settings.weightSets[ barbellBro.settings.config.activeWeightSet ].type == "US" ? "lb" : "kg") + ")" );

    //Set up UI with initial calculation of 0, then clear the input to show the PH text
    updateDisplay(0);
    $('input[name="weightInput"]').val('');
  }

  window.showModal = function(target){
    switch(target){
      case 'first-use':
        $.ajax({
          url: 'templates/first-use.html'
        }).done(function(data){
          $('#modalContainer').html('');
          $('#modalContainer').append(data);
          $('#modal').modal({ keyboard: false, backdrop: 'static' });
        });
        break;
      case 'setup-metrics':
        $.ajax({
          url: 'templates/setup-metrics.html'
        }).done(function(data){
          $('#modalContainer').html('');
          $('#modalContainer').append(data);
          $('#modal').modal({ keyboard: false, backdrop: 'static' });
        });
        break;
      case 'confirm-metrics':
        $.ajax({
          url: 'templates/confirm-metrics.html'
        }).done(function(data){
          $('#modalContainer').html('');
          $('#modalContainer').append(data);
          $('#modal').modal({ keyboard: false, backdrop: 'static' });
        });
        break;
      default:
        break;
    }
  };

  init();

});
