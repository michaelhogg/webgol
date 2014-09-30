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
 * Populate the "target framerate" <select> menu
 *
 * @param {number} defaultTargetFramerate
 */
GOLUI.prototype.populateTargetFramerateMenu = function(defaultTargetFramerate) {

    var framerates = [
        60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 6, 4, 2, 1, 0.5, 0.25
    ];

    var optionsData = [];

    for (var i = 0; i < framerates.length; i++) {
        optionsData.push({
            value: framerates[i],
            label: framerates[i]
        });
    }

    GOLUI.populateMenu(
        $("#selectTargetFramerate"),
        optionsData,
        defaultTargetFramerate
    );

};

/**
 * Set the event handler for the "target framerate" <select> menu
 */
GOLUI.prototype.setEventHandlerForTargetFramerateMenu = function() {

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
 * Create the "wrapping" switchery
 */
GOLUI.prototype.createWrappingSwitchery = function() {

    var checkbox = document.getElementById("checkboxSwitcheryWrapping");
    var settings = {
        color:          "#00c000",  // On
        secondaryColor: "#c00000"   // Off
    };

    this.wrappingSwitchery = new Switchery(checkbox, settings);

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
 * Set the event handler for the "wrapping" switchery
 */
GOLUI.prototype.setEventHandlerForWrappingSwitchery = function() {

    var _this = this;

    $("#checkboxSwitcheryWrapping").on("change", function() {
        _this.gol.toggleWrapping();
        _this.updateWrappingSwitcheryState();
    });

};

/**
 * Generate the help markers and bubbles
 */
GOLUI.prototype.generateHelpMarkersAndBubbles = function() {

    var items = [
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
                _this.gol.setRandom();
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
 * @param {number} defaultTargetFramerate
 */
GOLUI.prototype.init = function(defaultTargetFramerate) {

    this.populateTargetFramerateMenu(defaultTargetFramerate);

    this.setEventHandlerForTargetFramerateMenu();

    this.setEventHandlersForControlPanel();

    this.createWrappingSwitchery();

    this.updateWrappingSwitcheryState();

    this.setEventHandlerForWrappingSwitchery();

    this.generateHelpMarkersAndBubbles();

    this.setEventHandlerForControlKeys();

}
