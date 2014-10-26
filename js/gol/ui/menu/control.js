/**
 * Game Of Life user interface: Control menu
 *
 * @param {GOLUIPanelKeyboardShortcuts} panelKeyboardShortcuts
 */
function GOLUIMenuControl(panelKeyboardShortcuts) {

    /**
     * @type {GOLUIPanelKeyboardShortcuts}
     */
    this.panelKeyboardShortcuts = panelKeyboardShortcuts;

    /**
     * Is the menu open?
     * @type {boolean}
     */
    this.isOpen = false;

}

/**
 * Initialise
 */
GOLUIMenuControl.prototype.init = function() {

    var _this = this;

    $("#iControlMenuIcon").on("click", function(event) {
        event.stopPropagation();  // Stop event from bubbling up to the document on-click handler
        _this.isOpen = !_this.isOpen;
        _this.update();
    });

    $(document).on("click", function() {
        if (_this.isOpen) {
            _this.isOpen = false;
            _this.update();
        }
    });

    $("#divControlMenuKeyboardShortcuts").on("click", function() {
        _this.panelKeyboardShortcuts.open();
    });

    $("#divControlMenuTroubleshooting").on("click", function() {
        GOLUIPanelSupport.open(false, "Experiencing problems with WebGOL?", true, _this.gol);
    });

};

/**
 * Update
 */
GOLUIMenuControl.prototype.update = function() {

    $("#divControlMenuContainer").toggle(this.isOpen);

    $("#iControlMenuIcon").toggleClass("control-menu-open", this.isOpen);

};
