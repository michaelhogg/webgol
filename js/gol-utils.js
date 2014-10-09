/**
 * Game Of Life utilities
 */
var GOLUtils = {

    /**
     * Fetch a shader source code file from the server
     *
     * @param   {string} url
     * @returns {string}
     * @throws Error if something goes wrong
     */
    fetchShaderSourceCode: function(url) {

        var successful   = null;
        var sourceCode   = null;
        var errorDetails = null;

        $.ajax({
            url:      url,
            async:    false,
            dataType: "text",
            success:  function(data, textStatus, jqXHR) {
                successful = true;
                sourceCode = data;
            },
            error:    function(jqXHR, textStatus, errorThrown) {
                successful   = false;
                errorDetails = errorThrown;
            }
        });

        if (successful !== true) {
            var errorMessage = "Error fetching '" + url + "' shader source code";
            if (errorDetails !== null && errorDetails !== "") {
                errorMessage += ": " + errorDetails;
            }
            throw new Error(errorMessage);
        }

        return sourceCode;

    }

};
