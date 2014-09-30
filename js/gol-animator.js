/**
 * Game Of Life animator
 *
 * @param {GOL}    gol
 * @param {number} targetFPS
 * @param {string} actualFPSDisplayElementID
 */
function GOLAnimator(gol, targetFPS, actualFPSDisplayElementID) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

    /**
     * Target frames-per-second
     * @type {number}
     */
    this.targetFPS = targetFPS;

    /**
     * jQuery DOM element for displaying actual FPS
     * @type {object}
     */
    this.$actualFPSDisplayElement = $("#" + actualFPSDisplayElementID);

    /**
     * Actual frames-per-second
     * @type {number}
     */
    this.actualFPS = 0;

    /**
     * Unix timestamp (in seconds) of the latest animation step
     * @type {number}
     */
    this.latestStepTimestamp = 0;

    /**
     * ID of the animation timer (if null, then the timer is not running)
     * @type {(number|null)}
     */
    this.timerID = null;

    /**
     * Milliseconds per second
     * @constant {number}
     */
    this.MS_PER_SECOND = 1000;

}

/**
 * Get the current Unix timestamp (in seconds)
 *
 * @returns {number}
 */
GOLAnimator.prototype.now = function() {

    return Math.floor(Date.now() / this.MS_PER_SECOND);

};

/**
 * Perform one animation step
 */
GOLAnimator.prototype.doAnimationStep = function() {

    this.gol.stepAndDraw();

    if (this.now() === this.latestStepTimestamp) {
        this.actualFPS++;
    } else {
        this.$actualFPSDisplayElement.text(this.actualFPS);
        this.latestStepTimestamp = this.now();
        this.actualFPS           = 0;
    }

};

/**
 * Start the animation
 */
GOLAnimator.prototype.start = function() {

    if (this.isRunning()) {
        return;
    }

    this.actualFPS           = 0;
    this.latestStepTimestamp = this.now();

    var _this      = this;
    var frameDelay = this.MS_PER_SECOND / this.targetFPS;

    this.timerID = setInterval(
        function() {
            _this.doAnimationStep();
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

/**
 * Change the target framerate
 *
 * @param {number} targetFPS
 */
GOLAnimator.prototype.changeTargetFramerate = function(targetFPS) {

    var wasRunning = this.isRunning();

    if (wasRunning) {
        this.stop();
    }

    this.targetFPS = targetFPS;

    if (wasRunning) {
        this.start();
    }

};
