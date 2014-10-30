/* -------- JSHint --------- */
/* exported GOLShaderSources */

/**
 * Source code for shaders
 */
var GOLShaderSources = {

    // The include directives are processed by includereplace in Gruntfile.js
    vTriangleStrip: "@@include('triangle-strip.vert')",
    fNextState:     "@@include('next-state.frag')",
    fRender:        "@@include('render.frag')"

};
