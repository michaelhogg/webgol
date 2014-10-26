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
     * @type {(GOLUIPanelControl|null)}
     */
    this.panelControl = null;

    /**
     * @type {(GOLUIPanelKeyboardShortcuts|null)}
     */
    this.panelKeyboardShortcuts = null;

    /**
     * Object storing the current state of the UI
     * @type {object}
     */
    this.state = {
        hasUserOpenedControlPanelYet: false,
        isToolbarDisplayed:           false,
        toolbarFadeoutTimeoutID:      null
    };

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
 * Set the mousemove event handler for the canvas
 */
GOLUI.prototype.configureCanvasMousemove = function() {

    var _this = this;

    $("#golCanvas").on("mousemove", function() {

        if (!_this.state.isToolbarDisplayed) {
            $("#divToolbar").fadeIn(GOLUI.FAST_FADE_DURATION);
            _this.state.isToolbarDisplayed = true;
        }

        if (_this.state.toolbarFadeoutTimeoutID !== null) {
            clearTimeout(_this.state.toolbarFadeoutTimeoutID);
            _this.state.toolbarFadeoutTimeoutID = null;
        }

        if (_this.state.hasUserOpenedControlPanelYet) {
            _this.state.toolbarFadeoutTimeoutID = setTimeout(
                function() {
                    $("#divToolbar").fadeOut(GOLUI.SLOW_FADE_DURATION);
                    _this.state.isToolbarDisplayed      = false;
                    _this.state.toolbarFadeoutTimeoutID = null;
                },
                1500
            );
        }

    });

};

/**
 * Set the event handler for the control keys
 */
GOLUI.prototype.configureControlKeys = function() {

    var _this = this;

    $(document).on("keyup", function(event) {
        switch (event.which) {
            case 80:  // p
                _this.golAnimator.toggle();
                _this.updateToolbar();
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
 * Update the toolbar
 */
GOLUI.prototype.updateToolbar = function() {

    var isRunning = this.golAnimator.isRunning();

    $("#iToolbarPlay" ).toggle(!isRunning);
    $("#iToolbarPause").toggle( isRunning);

    $("#iToolbarStepForwards").toggleClass("tool-disabled", isRunning);

};

/**
 * Configure the toolbar
 */
GOLUI.prototype.configureToolbar = function() {

    var _this = this;

    this.state.isToolbarDisplayed = true;

    $("#divToolbar").fadeIn(GOLUI.SLOW_FADE_DURATION);

    $("#divToolbar").on("mousemove", function() {

        if (_this.state.toolbarFadeoutTimeoutID !== null) {
            clearTimeout(_this.state.toolbarFadeoutTimeoutID);
            _this.state.toolbarFadeoutTimeoutID = null;
        }

    });

    $("#iToolbarPlay, #iToolbarPause").on("click", function() {

        _this.golAnimator.toggle();
        _this.updateToolbar();

    });

    $("#iToolbarStepForwards").on("click", function() {

        if (!_this.golAnimator.isRunning()) {
            _this.gol.calculateAndRenderNextState();
        }

    });

    $("#iToolbarOpenControlPanel").on("click", function() {

        $("#divToolbar").fadeOut(GOLUI.FAST_FADE_DURATION);

        _this.state.isToolbarDisplayed           = false;
        _this.state.hasUserOpenedControlPanelYet = true;

        _this.panelControl.open();

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

    this.configureCanvasMousemove();

    this.configureControlKeys();

    // Miscellaneous

    var buttonRandomModeRandomise = new GOLUIButtonRandomModeRandomise(this.gol);

    buttonRandomModeRandomise.init();

    GOLUIHelp.generateMarkersAndBubbles();

    this.configureToolbar();

};
