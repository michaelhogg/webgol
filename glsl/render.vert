precision mediump float;

attribute vec2 aVertex;

varying vec2 vTexCoord;

/**
 * Main
 */
void main() {

    gl_Position = vec4(aVertex, 0, 1.0);

    // Convert aVertex range (-1 to 1)
    // to required range of vTexCoord (0 to 1)
    vTexCoord = (aVertex + 1.0) / 2.0;

}
