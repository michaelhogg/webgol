/**
 * Game Of Life user interface
 *
 * @param {GOL}         gol
 * @param {GOLAnimator} golAnimator
 */
function GOLUI(gol, golAnimator) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

    /**
     * @type {GOLAnimator}
     */
    this.golAnimator = golAnimator;

    /**
     * @type {(GOLUIToolbar|null)}
     */
    this.toolbar = null;

    /**
     * @type {(GOLUIPanelControl|null)}
     */
    this.panelControl = null;

    /**
     * @type {(GOLUIPanelKeyboardShortcuts|null)}
     */
    this.panelKeyboardShortcuts = null;

}

/**
 * Duration of a fast fade (in milliseconds)
 *
 * @constant {number}
 * @static
 */
GOLUI.FAST_FADE_DURATION = 200;

/**
 * Duration of a slow fade (in milliseconds)
 *
 * @constant {number}
 * @static
 */
GOLUI.SLOW_FADE_DURATION = 1000;

/**
 * Set the event handler for the control keys
 */
GOLUI.prototype.configureControlKeys = function() {

    var _this = this;

    $(document).on("keyup", function(event) {
        switch (event.which) {
            case 80:  // p
                _this.golAnimator.toggle();
                _this.toolbar.update();
                break;
            case 83:  // s
                if (!_this.golAnimator.isRunning()) {
                    _this.gol.calculateAndRenderNextState();
                }
                break;
            case 27:  // esc
                if (GOLUIPanelSupport.canBeClosed()) {
                    GOLUIPanelSupport.close();
                } else if (_this.panelKeyboardShortcuts.isOpen) {
                    _this.panelKeyboardShortcuts.close();
                } else if (_this.panelControl.isOpen) {
                    _this.panelControl.close();
                }
                break;
        }
    });

};

/**
 * Initialise the UI
 */
GOLUI.prototype.init = function() {

    // Panels

    GOLUIPanelSupport.initCloseButton();

    this.panelControl = new GOLUIPanelControl();
    this.panelControl.init();

    this.panelKeyboardShortcuts = new GOLUIPanelKeyboardShortcuts();
    this.panelKeyboardShortcuts.init();

    // Menus

    var menuApplication     = new GOLUIMenuApplication(this.panelKeyboardShortcuts);
    var menuCellSize        = new GOLUIMenuCellSize(this.gol);
    var menuTargetFramerate = new GOLUIMenuTargetFramerate(this.golAnimator);

    menuApplication.init();
    menuCellSize.init();
    menuTargetFramerate.init();

    // Switcherys

    var wrappingSwitchery = new GOLUISwitcheryWrapping(this.gol);
    var mutationSwitchery = new GOLUISwitcheryMutation(this.gol);

    wrappingSwitchery.init();
    mutationSwitchery.init();

    // Set event handlers

    this.configureControlKeys();

    // Miscellaneous

    this.toolbar = new GOLUIToolbar(this.golAnimator, this.panelControl);
    this.toolbar.init();

    var buttonRandomModeRandomise = new GOLUIButtonRandomModeRandomise(this.gol);
    buttonRandomModeRandomise.init();

    GOLUIHelp.generateMarkersAndBubbles();

};
