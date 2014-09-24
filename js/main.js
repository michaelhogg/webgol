/* Initialize everything. */

var gol = null;

$(document).ready(function() {

    var canvas   = document.getElementById('golCanvas');
    var cellSize = 4;

    gol = new GOL(canvas, cellSize);
    gol.setRandom();
    gol.draw();
    gol.start();

    $(document).on('keyup', function(event) {
        switch (event.which) {
            case 82: /* r */
                gol.setRandom();
                gol.draw();
                break;
            case 80: /* p */
                gol.toggle();
                break;
        }
    });

});
