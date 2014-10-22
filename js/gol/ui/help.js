/* ----- JSHint ----- */
/* exported GOLUIHelp */

/**
 * Game Of Life user interface: Help
 */
var GOLUIHelp = {

    /**
     * Generate the help markers and bubbles
     */
    generateMarkersAndBubbles: function() {

        var items = [
            { id: "CellSize",        html: "The width and height of each cell, in pixels<br>(changing this setting will reload the page,<br>to recreate the WebGL textures)" },
            { id: "TargetFramerate", html: "The number of frames-per-second to attempt to reach" },
            { id: "ActualFramerate", html: "The actual number of frames-per-second being displayed" },
            { id: "Wrapping",        html: "Wrap the screen horizontally (left and right edges joined)<br>and vertically (top and bottom edges joined)" },

            { id: "RandomModeMutation", html: "Randomly add live cells<br>to prevent life from dying out" }
        ];

        for (var i = 0; i < items.length; i++) {

            (function(item) {

                $("#tdHelpCell" + item.id).html("").append(

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

    }

};
