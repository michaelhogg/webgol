/**
 * Game Of Life user interface: Toolbar
 *
 * @param {GOLAnimator}       golAnimator
 * @param {GOLUIPanelControl} panelControl
 */
function GOLUIToolbar(golAnimator, panelControl) {

    /**
     * @type {GOLAnimator}
     */
    this.golAnimator = golAnimator;

    /**
     * @type {GOLUIPanelControl}
     */
    this.panelControl = panelControl;

    /**
     * Is the toolbar displayed?
     * @type {boolean}
     */
    this.isDisplayed = false;

    /**
     * Has the control panel ever been opened?
     * @type {boolean}
     */
    this.hasControlPanelEverBeenOpened = false;

    /**
     * Timeout ID for fading out
     * @type {(number|null)}
     */
    this.fadeoutTimeoutID = null;

}

/**
 * Initialise
 */
GOLUIToolbar.prototype.init = function() {

    this.initCanvas();
    this.initPlayPause();
    this.initStepForwards();
    this.initOpenControlPanel();

    var _this = this;

    $("#divToolbar").on("mousemove", function() {
        _this.clearFadeoutTimeout();
    });

    this.fadeIn(GOLUI.SLOW_FADE_DURATION);

};

/**
 * Set the mousemove event handler for the canvas
 */
GOLUIToolbar.prototype.initCanvas = function() {

    var _this = this;

    $("#golCanvas").on("mousemove", function() {

        if (!_this.isDisplayed) {
            _this.fadeIn(GOLUI.FAST_FADE_DURATION);
        }

        _this.clearFadeoutTimeout();

        if (_this.hasControlPanelEverBeenOpened) {
            _this.fadeoutTimeoutID = setTimeout(
                function() {
                    _this.fadeOut(GOLUI.SLOW_FADE_DURATION);
                    _this.fadeoutTimeoutID = null;
                },
                1500
            );
        }

    });

};

/**
 * Set the click event handler for the Play and Pause buttons
 */
GOLUIToolbar.prototype.initPlayPause = function() {

    var _this = this;

    $("#iToolbarPlay, #iToolbarPause").on("click", function() {
        _this.golAnimator.toggle();
        _this.update();
    });

};

/**
 * Set the click event handler for the Step Forwards button
 */
GOLUIToolbar.prototype.initStepForwards = function() {

    var _this = this;

    $("#iToolbarStepForwards").on("click", function() {
        if (!_this.golAnimator.isRunning()) {
            _this.golAnimator.doAnimationStep();
        }
    });

};

/**
 * Set the click event handler for the Open Control Panel button
 */
GOLUIToolbar.prototype.initOpenControlPanel = function() {

    var _this = this;

    $("#iToolbarOpenControlPanel").on("click", function() {
        _this.fadeOut(GOLUI.FAST_FADE_DURATION);
        _this.panelControl.open();
        _this.hasControlPanelEverBeenOpened = true;
    });

};

/**
 * Fade in
 *
 * @param {number} fadeDuration - Milliseconds
 */
GOLUIToolbar.prototype.fadeIn = function(fadeDuration) {

    $("#divToolbar").fadeIn(fadeDuration);

    this.isDisplayed = true;

};

/**
 * Fade out
 *
 * @param {number} fadeDuration - Milliseconds
 */
GOLUIToolbar.prototype.fadeOut = function(fadeDuration) {

    $("#divToolbar").fadeOut(fadeDuration);

    this.isDisplayed = false;

};

/**
 * Clear the fadeOut timeout
 */
GOLUIToolbar.prototype.clearFadeoutTimeout = function() {

    if (this.fadeoutTimeoutID !== null) {
        clearTimeout(this.fadeoutTimeoutID);
        this.fadeoutTimeoutID = null;
    }

};

/**
 * Update
 */
GOLUIToolbar.prototype.update = function() {

    var isRunning = this.golAnimator.isRunning();

    $("#iToolbarPlay" ).toggle(!isRunning);
    $("#iToolbarPause").toggle( isRunning);

    $("#iToolbarStepForwards").toggleClass("tool-disabled", isRunning);

};
