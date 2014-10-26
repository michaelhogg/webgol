/**
 * Game Of Life user interface: Keyboard Shortcuts panel
 */
function GOLUIPanelKeyboardShortcuts() {

    /**
     * Is the panel open?
     * @type {boolean}
     */
    this.isOpen = false;

}

/**
 * Initialise
 */
GOLUIPanelKeyboardShortcuts.prototype.init = function() {

    var _this = this;

    $("#iCloseKeyboardShortcutsPanel").on("click", function() {
        _this.close();
    });

};

/**
 * Open
 */
GOLUIPanelKeyboardShortcuts.prototype.open = function() {

    $("#divKeyboardShortcutsPanel").fadeIn(GOLUI.FAST_FADE_DURATION);

    this.isOpen = true;

};

/**
 * Close
 */
GOLUIPanelKeyboardShortcuts.prototype.close = function() {

    $("#divKeyboardShortcutsPanel").fadeOut(GOLUI.FAST_FADE_DURATION);

    this.isOpen = false;

};
