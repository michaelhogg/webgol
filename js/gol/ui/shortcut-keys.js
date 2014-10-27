/**
 * Game Of Life user interface: Shortcut keys
 *
 * @param {GOLAnimator}                 golAnimator
 * @param {GOLUIToolbar}                toolbar
 * @param {GOLUIPanelKeyboardShortcuts} panelKeyboardShortcuts
 * @param {GOLUIPanelControl}           panelControl
 */
function GOLUIShortcutKeys(golAnimator, toolbar, panelKeyboardShortcuts, panelControl) {

    /**
     * @type {GOLAnimator}
     */
    this.golAnimator = golAnimator;

    /**
     * @type {GOLUIToolbar}
     */
    this.toolbar = toolbar;

    /**
     * @type {GOLUIPanelKeyboardShortcuts}
     */
    this.panelKeyboardShortcuts = panelKeyboardShortcuts;

    /**
     * @type {GOLUIPanelControl}
     */
    this.panelControl = panelControl;

}

/**
 * Initialise
 */
GOLUIShortcutKeys.prototype.init = function() {

    var _this = this;

    $(document).on("keyup", function(event) {
        switch (event.which) {

            case 80:  // p
                _this.golAnimator.toggle();
                _this.toolbar.update();
                break;

            case 83:  // s
                if (!_this.golAnimator.isRunning()) {
                    _this.golAnimator.doAnimationStep();
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
