/* -------- JSHint --------- */
/* exported GOLShaderSources */

/**
 * Source code for shaders
 */
var GOLShaderSources = {

    // The include directives are processed by includereplace in Gruntfile.js

    vNextState: "@@include('next-state.vert')",
    fNextState: "@@include('next-state.frag')",

    vRender: "@@include('render.vert')",
    fRender: "@@include('render.frag')",

    vBlur: "@@include('blur.vert')",
    fBlur: "@@include('blur.frag')",

    vAdd: "@@include('add.vert')",
    fAdd: "@@include('add.frag')"

};
