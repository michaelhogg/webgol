/**
 * Game Of Life user interface: Application menu
 *
 * @param {GOLUIPanelKeyboardShortcuts} panelKeyboardShortcuts
 */
function GOLUIMenuApplication(panelKeyboardShortcuts) {

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
GOLUIMenuApplication.prototype.init = function() {

    var _this = this;

    $("#iApplicationMenuIcon").on("click", function(event) {
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

    $("#divApplicationMenuKeyboardShortcuts").on("click", function() {
        _this.panelKeyboardShortcuts.open();
    });

    $("#divApplicationMenuTroubleshooting").on("click", function() {
        GOLUIPanelSupport.open(false, "Experiencing problems with WebGOL?", true, _this.gol);
    });

};

/**
 * Update
 */
GOLUIMenuApplication.prototype.update = function() {

    $("#divApplicationMenuContainer").toggle(this.isOpen);

    $("#iApplicationMenuIcon").toggleClass("application-menu-open", this.isOpen);

};
