/**
 * Manages the user interface for a simulation.
 */
function Controller(gol) {
    this.gol = gol;
    $(document).on('keyup', function(event) {
        switch (event.which) {
        case 82: /* r */
            gol.setRandom();
            gol.draw();
            break;
        case 83: /* s */
            gol.toggle();
            break;
        };
    });
}
