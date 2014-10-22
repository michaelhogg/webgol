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
     * Object storing the current state of the UI
     * @type {object}
     */
    this.state = {
        hasUserOpenedControlPanelYet:      false,
        isToolbarDisplayed:                false,
        isControlPanelDisplayed:           false,
        toolbarFadeoutTimeoutID:           null,
        isControlMenuDisplayed:            false,
        isKeyboardShortcutsPanelDisplayed: false
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
 * Show the support panel
 *
 * @param {boolean}    isError
 * @param {string}     supportMessage
 * @param {boolean}    showBrowserHelp
 * @param {(GOL|null)} gol
 * @static
 */
GOLUI.showSupportPanel = function(isError, supportMessage, showBrowserHelp, gol) {

    $("#divSupportPanelTitleError"          ).toggle( isError);
    $("#divSupportPanelTitleTroubleshooting").toggle(!isError);
    $("#divSupportPanelBrowserHelpContainer").toggle(showBrowserHelp);

    $("#divSupportPanelMessage").text(supportMessage);

    var showWebglContainer = false;

    if (gol !== null) {
        try {

            var webglInfo     = GOLUtils.getWebglInfo(gol);
            var webglWarnings = GOLUtils.getWebglWarnings(gol);

            var infoListElements    = GOLUIUtils.createListElements(webglInfo);
            var warningListElements = GOLUIUtils.createListElements(webglWarnings);

            $("#ulSupportPanelWebGLInfo"    ).html("").append(infoListElements);
            $("#ulSupportPanelWebGLWarnings").html("").append(warningListElements);

            $("#divSupportPanelWebGLWarningsContainer").toggle(webglWarnings.length > 0);

            showWebglContainer = true;

        } catch (e) {
            // Ignore error
        }
    }

    $("#divSupportPanelWebGLContainer").toggle(showWebglContainer);

    $("#divSupportPanel").fadeIn(GOLUI.FAST_FADE_DURATION);

};

/**
 * Configure the support panel
 */
GOLUI.prototype.configureSupportPanel = function() {

    var _this = this;

    $("#iCloseSupportPanel").show();

    $("#iCloseSupportPanel").on("click", function() {
        _this.closeSupportPanel();
    });

};

/**
 * Can the support panel be closed?
 *
 * @returns {boolean}
 */
GOLUI.prototype.canSupportPanelBeClosed = function() {

    return $("#divSupportPanel"   ).is(":visible") &&
           $("#iCloseSupportPanel").is(":visible");

};

/**
 * Close the support panel
 */
GOLUI.prototype.closeSupportPanel = function() {

    $("#divSupportPanel").fadeOut(GOLUI.FAST_FADE_DURATION);

};

/**
 * Close the control panel
 */
GOLUI.prototype.closeControlPanel = function() {

    $("#divControlPanel").fadeOut(GOLUI.FAST_FADE_DURATION);

    this.state.isControlPanelDisplayed = false;

};

/**
 * Close the keyboard shortcuts panel
 */
GOLUI.prototype.closeKeyboardShortcutsPanel = function() {

    $("#divKeyboardShortcutsPanel").fadeOut(GOLUI.FAST_FADE_DURATION);

    this.state.isKeyboardShortcutsPanelDisplayed = false;

};

/**
 * Configure the keyboard shortcuts panel
 */
GOLUI.prototype.configureKeyboardShortcutsPanel = function() {

    var _this = this;

    $("#iCloseKeyboardShortcutsPanel").on("click", function() {
        _this.closeKeyboardShortcutsPanel();
    });

};

/**
 * Update the control menu
 */
GOLUI.prototype.updateControlMenu = function() {

    $("#divControlMenuContainer").toggle(this.state.isControlMenuDisplayed);

    $("#iControlMenuIcon").toggleClass("control-menu-open", this.state.isControlMenuDisplayed);

};

/**
 * Configure the control menu
 */
GOLUI.prototype.configureControlMenu = function() {

    var _this = this;

    $("#iControlMenuIcon").on("click", function(event) {
        event.stopPropagation();  // Stop event from bubbling up to the document on-click handler
        _this.state.isControlMenuDisplayed = !_this.state.isControlMenuDisplayed;
        _this.updateControlMenu();
    });

    $(document).on("click", function() {
        if (_this.state.isControlMenuDisplayed) {
            _this.state.isControlMenuDisplayed = false;
            _this.updateControlMenu();
        }
    });

    $("#divControlMenuKeyboardShortcuts").on("click", function() {
        _this.state.isKeyboardShortcutsPanelDisplayed = true;
        $("#divKeyboardShortcutsPanel").fadeIn(GOLUI.FAST_FADE_DURATION);
    });

    $("#divControlMenuTroubleshooting").on("click", function() {
        GOLUI.showSupportPanel(false, "Experiencing problems with WebGOL?", true, _this.gol);
    });

};

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
 * Set the event handlers for the "close control panel" cross
 */
GOLUI.prototype.configureCloseControlPanel = function() {

    var _this = this;

    $("#iCloseControlPanel").on("click", function() {
        _this.closeControlPanel();
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
                if (_this.canSupportPanelBeClosed()) {
                    _this.closeSupportPanel();
                } else if (_this.state.isKeyboardShortcutsPanelDisplayed) {
                    _this.closeKeyboardShortcutsPanel();
                } else if (_this.state.isControlPanelDisplayed) {
                    _this.closeControlPanel();
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
 * Generate the help markers and bubbles
 */
GOLUI.prototype.generateHelpMarkersAndBubbles = function() {

    var items = [
        { id: "CellSize",        html: "The width and height of each cell, in pixels<br>(changing this setting will reload the page,<br>to recreate the WebGL textures)" },
        { id: "TargetFramerate", html: "The number of frames-per-second to attempt to reach" },
        { id: "ActualFramerate", html: "The actual number of frames-per-second being displayed" },
        { id: "Wrapping",        html: "Wrap the screen horizontally (left and right edges joined)<br>and vertically (top and bottom edges joined)" },

        { id: "RandomModeMutation", html: "Randomly add live cells<br>to prevent life from dying out" }
    ];

    for (var i = 0; i < items.length; i++) {

        (function(item) {

            $("#tdHelpCell" + item.id).append(

                $("<i></i>")
                    .attr("class", "fa fa-question-circle help-marker")
                    .on("mouseover", function() {
                        $("#divHelpBubble" + item.id).show();
                    })
                    .on("mouseout", function() {
                        $("#divHelpBubble" + item.id).hide();
                    }),

                $("<div></div>")
                    .attr("id", "divHelpBubble" + item.id)
                    .attr("class", "help-bubble")
                    .html(item.html)

            );

        })(items[i]);

    }

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

        $("#divToolbar"     ).fadeOut(GOLUI.FAST_FADE_DURATION);
        $("#divControlPanel").fadeIn( GOLUI.FAST_FADE_DURATION);

        _this.state.isToolbarDisplayed           = false;
        _this.state.isControlPanelDisplayed      = true;
        _this.state.hasUserOpenedControlPanelYet = true;

    });

};

/**
 * Initialise the UI
 */
GOLUI.prototype.init = function() {

    // Configure panels

    this.configureSupportPanel();

    this.configureKeyboardShortcutsPanel();

    // Configure menus

    this.configureControlMenu();

    this.configureCellSizeMenu();

    this.configureTargetFramerateMenu();

    // Switcherys

    var wrappingSwitchery = new GOLUISwitcheryWrapping(this.gol);
    var mutationSwitchery = new GOLUISwitcheryMutation(this.gol);

    wrappingSwitchery.init();
    mutationSwitchery.init();

    // Set event handlers

    this.configureCanvasMousemove();

    this.configureCloseControlPanel();

    this.configureControlKeys();

    this.configureRandomModeRandomiseButton();

    // Miscellaneous

    this.generateHelpMarkersAndBubbles();

    this.configureToolbar();

};
