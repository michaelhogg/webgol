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
 * Initialise
 */
GOLUI.prototype.init = function() {

    // Panels

    GOLUIPanelSupport.initCloseButton();

    this.panelControl = new GOLUIPanelControl();
    this.panelControl.init();

    this.panelKeyboardShortcuts = new GOLUIPanelKeyboardShortcuts();
    this.panelKeyboardShortcuts.init();

    // Menus

    var menuApplication = new GOLUIMenuApplication(this.gol, this.panelKeyboardShortcuts);
    var menuCellSize    = new GOLUIMenuCellSize(this.gol);

    menuApplication.init();
    menuCellSize.init();

    // Sliders

    var sliderTargetFramerate = new GOLUISliderTargetFramerate(this.golAnimator);
    var sliderGlow            = new GOLUISliderGlow(this.gol.gpu);

    sliderTargetFramerate.init();
    sliderGlow.init();

    // Switcherys

    var wrappingSwitchery = new GOLUISwitcheryWrapping(this.gol);
    var mutationSwitchery = new GOLUISwitcheryMutation(this.gol);

    wrappingSwitchery.init();
    mutationSwitchery.init();

    // Miscellaneous

    this.toolbar = new GOLUIToolbar(this.golAnimator, this.panelControl);
    this.toolbar.init();

    var buttonRandomModeRandomise = new GOLUIButtonRandomModeRandomise(this.gol);
    var shortcutKeys              = new GOLUIShortcutKeys(this.golAnimator, this.toolbar, this.panelKeyboardShortcuts, this.panelControl);

    buttonRandomModeRandomise.init();
    shortcutKeys.init();

    GOLUIHelp.generateMarkersAndBubbles();

};
