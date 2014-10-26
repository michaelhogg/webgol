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
 * Configure the "cell size" <select> menu
 */
GOLUI.prototype.configureCellSizeMenu = function() {

    var cellSizes = [];

    for (var i = 1; i <= 20; i++) {
        cellSizes.push(i);
    }

    GOLUIUtils.populateMenuWithValues(
        $("#selectCellSize"),
        cellSizes,
        this.gol.CELL_SIZE
    );

    $("#selectCellSize").on("change", function() {

        var cellSize = parseInt($(this).val());

        window.location.href = "index.html?cs=" + cellSize;

    });

};

/**
 * Configure the "target framerate" <select> menu
 */
GOLUI.prototype.configureTargetFramerateMenu = function() {

    var framerates = [
        0.25, 0.5, 1, 2, 4, 6, 8, 10, 15, 20, 25, 30, 40, 50, 60
    ];

    GOLUIUtils.populateMenuWithValues(
        $("#selectTargetFramerate"),
        framerates,
        this.golAnimator.targetFPS
    );

    var _this = this;

    $("#selectTargetFramerate").on("change", function() {

        var framerate = parseFloat($(this).val());

        _this.golAnimator.changeTargetFramerate(framerate);

    });

};

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
 * Set the event handler for the "Random mode: Randomise" button
 */
GOLUI.prototype.configureRandomModeRandomiseButton = function() {

    var _this = this;

    $("#buttonRandomModeRandomise").on("click", function() {
        _this.gol.randomiseState();
        _this.gol.renderState();
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

    // Configure menus

    var menuControl = new GOLUIMenuControl(this.panelKeyboardShortcuts);

    menuControl.init();

    this.configureCellSizeMenu();

    this.configureTargetFramerateMenu();

    // Switcherys

    var wrappingSwitchery = new GOLUISwitcheryWrapping(this.gol);
    var mutationSwitchery = new GOLUISwitcheryMutation(this.gol);

    wrappingSwitchery.init();
    mutationSwitchery.init();

    // Set event handlers

    this.configureCanvasMousemove();

    this.configureControlKeys();

    this.configureRandomModeRandomiseButton();

    // Miscellaneous

    GOLUIHelp.generateMarkersAndBubbles();

    this.configureToolbar();

};
