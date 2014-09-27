/**
 * Game Of Life animator
 *
 * @param {GOL}    gol
 * @param {number} fps - Frames per second
 */
function GOLAnimator(gol, fps) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

    /**
     * Frames per second
     * @type {number}
     */
    this.fps = fps;

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

    var _this      = this;
    var frameDelay = 1000 / this.fps;  // Milliseconds

    this.timerID = setInterval(
        function() {
            _this.gol.stepAndDraw();
        },
        frameDelay
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
