/**
 * Game Of Life animator
 *
 * @param {GOL} gol
 */
function GOLAnimator(gol) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

    /**
     * ID of the animation timer (if null, then the timer is not running)
     * @type {(number|null)}
     */
    this.timerID = null;

}

/**
 * Start the animation
 */
GOLAnimator.prototype.start = function() {

    if (this.isRunning()) {
        return;
    }

    var _this = this;

    this.timerID = setInterval(
        function() {
            _this.gol.stepAndDraw();
        },
        60
    );

};

/**
 * Stop the animation
 */
GOLAnimator.prototype.stop = function() {

    if (!this.isRunning()) {
        return;
    }

    clearInterval(this.timerID);

    this.timerID = null;

};

/**
 * Is the animation running?
 *
 * @returns {boolean}
 */
GOLAnimator.prototype.isRunning = function() {

    return (this.timerID !== null);

};

/**
 * Toggle the animation state
 */
GOLAnimator.prototype.toggle = function() {

    if (this.isRunning()) {
        this.stop();
    } else {
        this.start();
    }

};
