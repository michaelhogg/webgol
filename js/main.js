window.onerror = function(errorMessage) {
    alert("Something went wrong :(\n\n" + errorMessage);
};

var gol         = null;
var golAnimator = null;

$(document).ready(function() {

    var canvas   = document.getElementById('golCanvas');
    var cellSize = 4;

    gol = new GOL(canvas, cellSize);
    gol.setRandom();
    gol.draw();

    var fps = 15;

    golAnimator = new GOLAnimator(gol, fps);
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
