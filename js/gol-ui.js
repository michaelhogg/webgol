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

}

/**
 * Create an <option> jQuery element for a <select> menu
 *
 * @param   {object} optionData
 * @returns {object}
 * @static
 */
GOLUI.createMenuOption = function(optionData) {

    return $("<option></option>").attr("value", optionData.value).text(optionData.label);

};

/**
 * Populate a <select> menu with options
 *
 * @param {object}          $selectMenu
 * @param {object[]}        optionsData
 * @param {(string|number)} defaultValue
 * @static
 */
GOLUI.populateMenu = function($selectMenu, optionsData, defaultValue) {

    var i, optionData, $option;

    for (i = 0; i < optionsData.length; i++) {

        optionData = optionsData[i];
        $option    = GOLUI.createMenuOption(optionData);

        if (optionData.value === defaultValue) {
            $option.prop("defaultSelected", true);
        }

        $selectMenu.append($option);

    }

};

/**
 * Populate a <select> menu using an array of values
 *
 * @param {object}              $selectMenu
 * @param {(string[]|number[])} values
 * @param {(string|number)}     defaultValue
 * @static
 */
GOLUI.populateMenuWithValues = function($selectMenu, values, defaultValue) {

    var optionsData = [];

    for (var i = 0; i < values.length; i++) {
        optionsData.push({
            value: values[i],
            label: values[i]
        });
    }

    GOLUI.populateMenu($selectMenu, optionsData, defaultValue);

};

/**
 * Configure the "cell size" <select> menu
 *
 * @param {number} defaultCellSize
 */
GOLUI.prototype.configureCellSizeMenu = function(defaultCellSize) {

    var cellSizes = [];

    for (var i = 1; i <= 20; i++) {
        cellSizes.push(i);
    }

    GOLUI.populateMenuWithValues(
        $("#selectCellSize"),
        cellSizes,
        defaultCellSize
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

    GOLUI.populateMenuWithValues(
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
 * Set the event handlers for the control panel
 */
GOLUI.prototype.setEventHandlersForControlPanel = function() {

    var state = {
        isGearDisplayed:      false,
        isPanelDisplayed:     false,
        gearFadeoutTimeoutID: null
    };

    $("#golCanvas").on("mousemove", function() {

        if (state.isPanelDisplayed) {
            return;
        }

        if (!state.isGearDisplayed) {
            $("#iOpenControlPanel").fadeIn(200);
            state.isGearDisplayed = true;
        }

        if (state.gearFadeoutTimeoutID !== null) {
            clearTimeout(state.gearFadeoutTimeoutID);
        }

        state.gearFadeoutTimeoutID = setTimeout(
            function() {
                $("#iOpenControlPanel").fadeOut(1000);
                state.isGearDisplayed      = false;
                state.gearFadeoutTimeoutID = null;
            },
            1000
        );

    });

    $("#iOpenControlPanel").on("mousemove", function() {

        if (state.gearFadeoutTimeoutID !== null) {
            clearTimeout(state.gearFadeoutTimeoutID);
            state.gearFadeoutTimeoutID = null;
        }

    });

    $("#iOpenControlPanel").on("click", function() {

        $("#iOpenControlPanel").fadeOut(200);
        $("#divControlPanelOuterContainer").fadeIn(200);

        state.isGearDisplayed  = false;
        state.isPanelDisplayed = true;

    });

    $("#iCloseControlPanel").on("click", function() {

        $("#divControlPanelOuterContainer").fadeOut(200);

        state.isPanelDisplayed = false;

    });

};

/**
 * Create a switchery
 *
 * @param   {string} checkboxElementId
 * @returns {Switchery}
 */
GOLUI.prototype.createSwitchery = function(checkboxElementId) {

    var checkbox = document.getElementById(checkboxElementId);
    var settings = {
        color:          "#00c000",  // On
        secondaryColor: "#c00000"   // Off
    };

    return new Switchery(checkbox, settings);

};

/**
 * Configure the "wrapping" switchery
 */
GOLUI.prototype.configureWrappingSwitchery = function() {

    this.wrappingSwitchery = this.createSwitchery("checkboxSwitcheryWrapping");

    var _this = this;

    $("#checkboxSwitcheryWrapping").on("change", function() {
        _this.gol.toggleWrapping();
        _this.updateWrappingSwitcheryState();
    });

    this.updateWrappingSwitcheryState();

};

/**
 * Update the state of the "wrapping" switchery
 */
GOLUI.prototype.updateWrappingSwitcheryState = function() {

    if (this.wrappingSwitchery.isChecked() !== this.gol.enableStateWrapping) {
        this.wrappingSwitchery.setPosition(true);  // Toggle state
    }

};

/**
 * Generate the help markers and bubbles
 */
GOLUI.prototype.generateHelpMarkersAndBubbles = function() {

    var items = [
        { id: "CellSize",        html: "The width and height of each cell, in pixels<br>(changing this setting will reload the page,<br>to recreate the WebGL textures)" },
        { id: "TargetFramerate", html: "The number of<br>frames-per-second<br>to attempt to reach" },
        { id: "ActualFramerate", html: "The actual number of<br>frames-per-second<br>being displayed" },
        { id: "Wrapping",        html: "Wrap the screen horizontally<br>(left and right edges joined)<br>and vertically (top and bottom<br>edges joined)" }
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
 * Set the event handler for the control keys
 */
GOLUI.prototype.setEventHandlerForControlKeys = function() {

    var _this = this;

    $(document).on("keyup", function(event) {
        switch (event.which) {
            case 82:  // r
                _this.gol.randomiseState();
                _this.gol.draw();
                break;
            case 80:  // p
                _this.golAnimator.toggle();
                break;
            case 83:  // s
                if (!_this.golAnimator.isRunning()) {
                    _this.gol.stepAndDraw();
                }
                break;
        }
    });

};

/**
 * Initialise the UI
 *
 * @param {number} defaultCellSize
 * @param {number} defaultTargetFramerate
 */
GOLUI.prototype.init = function(defaultCellSize, defaultTargetFramerate) {

    // Configure menus

    this.configureCellSizeMenu(defaultCellSize);

    this.configureTargetFramerateMenu(defaultTargetFramerate);

    // "Wrapping" switchery

    this.configureWrappingSwitchery();

    // Event handlers

    this.setEventHandlersForControlPanel();

    this.setEventHandlerForControlKeys();

    // Help

    this.generateHelpMarkersAndBubbles();

}
