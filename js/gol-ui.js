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
     * Switchery object for the "wrapping" checkbox
     * @type {(Switchery|null)}
     */
    this.wrappingSwitchery = null;

    /**
     * Switchery object for the "mutation" checkbox
     * @type {(Switchery|null)}
     */
    this.mutationSwitchery = null;

    /**
     * Object storing the current state of the UI
     * @type {object}
     */
    this.state = {
        isGearHelpDisplayed:  true,
        isGearDisplayed:      true,
        isPanelDisplayed:     false,
        gearFadeoutTimeoutID: null
    };

}

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

    var _this = this;

    $("#selectCellSize").on("change", function() {

        var cellSize = parseInt($(this).val());

        window.location.href = "index.html?cs=" + cellSize;

    });

};

/**
 * Configure the "target framerate" <select> menu
 *
 * @param {number} defaultTargetFramerate
 */
GOLUI.prototype.configureTargetFramerateMenu = function(defaultTargetFramerate) {

    var framerates = [
        0.25, 0.5, 1, 2, 4, 6, 8, 10, 15, 20, 25, 30, 40, 50, 60
    ];

    GOLUIUtils.populateMenuWithValues(
        $("#selectTargetFramerate"),
        framerates,
        defaultTargetFramerate
    );

    var _this = this;

    $("#selectTargetFramerate").on("change", function() {

        var framerate = parseFloat($(this).val());

        _this.golAnimator.changeTargetFramerate(framerate);

    });

};

/**
 * Configure the "wrapping" switchery
 */
GOLUI.prototype.configureWrappingSwitchery = function() {

    this.wrappingSwitchery = GOLUIUtils.createSwitchery("checkboxSwitcheryWrapping");

    var _this = this;

    $("#checkboxSwitcheryWrapping").on("change", function() {
        _this.gol.toggleWrapping();
        GOLUIUtils.updateSwitcheryState(_this.wrappingSwitchery, _this.gol.enableWrapping);
    });

    GOLUIUtils.updateSwitcheryState(this.wrappingSwitchery, this.gol.enableWrapping);

};

/**
 * Configure the "mutation" switchery
 */
GOLUI.prototype.configureMutationSwitchery = function() {

    this.mutationSwitchery = GOLUIUtils.createSwitchery("checkboxSwitcheryRandomModeMutation");

    var _this = this;

    $("#checkboxSwitcheryRandomModeMutation").on("change", function() {
        _this.gol.toggleMutation();
        GOLUIUtils.updateSwitcheryState(_this.mutationSwitchery, _this.gol.enableMutation);
    });

    GOLUIUtils.updateSwitcheryState(this.mutationSwitchery, this.gol.enableMutation);

};

/**
 * Set the mousemove event handler for the canvas
 */
GOLUI.prototype.configureCanvasMousemove = function() {

    var _this = this;

    $("#golCanvas").on("mousemove", function() {

        if (_this.state.isPanelDisplayed) {
            return;
        }

        if (!_this.state.isGearDisplayed) {
            $("#iOpenControlPanel").fadeIn(200);
            _this.state.isGearDisplayed = true;
        }

        if (_this.state.gearFadeoutTimeoutID !== null) {
            clearTimeout(_this.state.gearFadeoutTimeoutID);
            _this.state.gearFadeoutTimeoutID = null;
        }

        if (!_this.state.isGearHelpDisplayed) {
            _this.state.gearFadeoutTimeoutID = setTimeout(
                function() {
                    $("#iOpenControlPanel").fadeOut(1000);
                    _this.state.isGearDisplayed      = false;
                    _this.state.gearFadeoutTimeoutID = null;
                },
                1000
            );
        }

    });

};

/**
 * Set the event handlers for the "open control panel" gear
 */
GOLUI.prototype.configureOpenControlPanel = function() {

    var _this = this;

    $("#iOpenControlPanel").on("mousemove", function() {

        if (_this.state.gearFadeoutTimeoutID !== null) {
            clearTimeout(_this.state.gearFadeoutTimeoutID);
            _this.state.gearFadeoutTimeoutID = null;
        }

    });

    $("#iOpenControlPanel").on("click", function() {

        $("#divGearHelpBubble").fadeOut(200);
        $("#iOpenControlPanel").fadeOut(200);
        $("#divControlPanelOuterContainer").fadeIn(200);

        _this.state.isGearHelpDisplayed = false;
        _this.state.isGearDisplayed     = false;
        _this.state.isPanelDisplayed    = true;

    });

};

/**
 * Set the event handlers for the "close control panel" cross
 */
GOLUI.prototype.configureCloseControlPanel = function() {

    var _this = this;

    $("#iCloseControlPanel").on("click", function() {

        $("#divControlPanelOuterContainer").fadeOut(200);

        _this.state.isPanelDisplayed = false;

    });

};

/**
 * Set the event handler for the control keys
 */
GOLUI.prototype.setEventHandlerForControlKeys = function() {

    var _this = this;

    $(document).on("keyup", function(event) {
        switch (event.which) {
            case 80:  // p
                _this.golAnimator.toggle();
                break;
            case 83:  // s
                if (!_this.golAnimator.isRunning()) {
                    _this.gol.calculateAndRenderNextState();
                }
                break;
        }
    });

};

/**
 * Set the event handler for the "Random mode: Randomise" button
 */
GOLUI.prototype.setEventHandlerForRandomModeRandomiseButton = function() {

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
 * Initialise the UI
 *
 * @param {number} defaultTargetFramerate
 */
GOLUI.prototype.init = function(defaultTargetFramerate) {

    // Configure menus

    this.configureCellSizeMenu();

    this.configureTargetFramerateMenu(defaultTargetFramerate);

    // Configure switcherys

    this.configureWrappingSwitchery();

    this.configureMutationSwitchery();

    // Set event handlers

    this.configureCanvasMousemove();

    this.configureOpenControlPanel();

    this.configureCloseControlPanel();

    this.setEventHandlerForControlKeys();

    this.setEventHandlerForRandomModeRandomiseButton();

    // Help

    this.generateHelpMarkersAndBubbles();

}
