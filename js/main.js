/* Initialize everything. */

var gol = null;

$(document).ready(function() {

    var $canvas  = $('#life');
    var cellSize = 4;

    gol = new GOL($canvas[0], cellSize);
    gol.draw();
    gol.start();

    $(document).on('keyup', function(event) {
        switch (event.which) {
            case 82: /* r */
                gol.setRandom();
                gol.draw();
                break;
            case 83: /* s */
                gol.toggle();
                break;
        }
    });

});
