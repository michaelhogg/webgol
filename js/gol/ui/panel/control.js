/**
 * Game Of Life user interface: Control panel
 */
function GOLUIPanelControl() {

    /**
     * Is the panel open?
     * @type {boolean}
     */
    this.isOpen = false;

}

/**
 * Initialise
 */
GOLUIPanelControl.prototype.init = function() {

    var _this = this;

    $("#iCloseControlPanel").on("click", function() {
        _this.close();
    });

};

/**
 * Open
 */
GOLUIPanelControl.prototype.open = function() {

    $("#divControlPanel").fadeIn(GOLUI.FAST_FADE_DURATION);

    this.isOpen = true;

};

/**
 * Close
 */
GOLUIPanelControl.prototype.close = function() {

    $("#divControlPanel").fadeOut(GOLUI.FAST_FADE_DURATION);

    this.isOpen = false;

};
