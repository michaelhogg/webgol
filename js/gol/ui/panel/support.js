/**
 * Game Of Life user interface: Support panel
 */
var GOLUIPanelSupport = {

    /**
     * Show
     *
     * @param {boolean}    isError
     * @param {string}     supportMessage
     * @param {boolean}    showBrowserHelp
     * @param {(GOL|null)} gol
     */
    show: function(isError, supportMessage, showBrowserHelp, gol) {

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

    },

    /**
     * Initialise the close button
     */
    initCloseButton: function() {

        $("#iCloseSupportPanel").show();

        $("#iCloseSupportPanel").on("click", function() {
            GOLUIPanelSupport.close();
        });

    },

    /**
     * Can it be closed?
     *
     * @returns {boolean}
     */
    canBeClosed: function() {

        return $("#divSupportPanel"   ).is(":visible") &&
               $("#iCloseSupportPanel").is(":visible");

    },

    /**
     * Close
     */
    close: function() {

        $("#divSupportPanel").fadeOut(GOLUI.FAST_FADE_DURATION);

    }

};
