var gol         = null;
var golAnimator = null;

$(document).ready(function() {

    var canvas   = document.getElementById('golCanvas');
    var cellSize = 4;

    gol = new GOL(canvas, cellSize);
    gol.setRandom();
    gol.draw();

    golAnimator = new GOLAnimator(gol);
    golAnimator.start();

    $(document).on('keyup', function(event) {
        switch (event.which) {
            case 82: /* r */
                gol.setRandom();
                gol.draw();
                break;
            case 80: /* p */
                golAnimator.toggle();
                break;
            case 83: /* s */
                if (!golAnimator.isRunning()) {
                    gol.stepAndDraw();
                }
                break;
        }
    });

});
