/**
 * Game Of Life user interface utilities
 */
var GOLUIUtils = {

    /**
     * Create an <option> jQuery element for a <select> menu
     *
     * @param   {object} optionData
     * @returns {object}
     */
    createMenuOption: function(optionData) {

        return $("<option></option>").attr("value", optionData.value)
                                     .text(optionData.label);

    },

    /**
     * Populate a <select> menu with options
     *
     * @param {object}          $selectMenu
     * @param {object[]}        optionsData
     * @param {(string|number)} defaultValue
     */
    populateMenu: function($selectMenu, optionsData, defaultValue) {

        var i, optionData, $option;

        for (i = 0; i < optionsData.length; i++) {

            optionData = optionsData[i];
            $option    = GOLUIUtils.createMenuOption(optionData);

            if (optionData.value === defaultValue) {
                $option.prop("defaultSelected", true);
            }

            $selectMenu.append($option);

        }

    },

    /**
     * Populate a <select> menu using an array of values
     *
     * @param {object}              $selectMenu
     * @param {(string[]|number[])} values
     * @param {(string|number)}     defaultValue
     */
    populateMenuWithValues: function($selectMenu, values, defaultValue) {

        var optionsData = [];

        for (var i = 0; i < values.length; i++) {
            optionsData.push({
                value: values[i],
                label: values[i]
            });
        }

        GOLUIUtils.populateMenu($selectMenu, optionsData, defaultValue);

    },

    /**
     * Create a switchery
     *
     * @param   {string} checkboxElementId
     * @returns {Switchery}
     */
    createSwitchery: function(checkboxElementId) {

        var checkbox = document.getElementById(checkboxElementId);
        var settings = {
            color:          "#00c000",  // On
            secondaryColor: "#c00000"   // Off
        };

        return new Switchery(checkbox, settings);

    },

    /**
     * Update the state of a switchery
     *
     * @param {Switchery} switchery
     * @param {boolean}   newState
     */
    updateSwitcheryState: function(switchery, newState) {

        if (switchery.isChecked() !== newState) {
            switchery.setPosition(true);  // Toggle state
        }

    }

};
