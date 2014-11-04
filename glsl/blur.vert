precision mediump float;

uniform vec2 uDimensions;
uniform vec2 uBlurDirection;

attribute vec2 aVertex;

varying vec2 vTexCoord;
varying vec2 vBlurTexCoordsLeftOrDown[4];
varying vec2 vBlurTexCoordsRightOrUp[4];

/**
 * Main
 */
void main() {

    gl_Position = vec4(aVertex, 0, 1.0);

    // Convert aVertex range (-1 to 1)
    // to required range of vTexCoord (0 to 1)
    vTexCoord = (aVertex + 1.0) / 2.0;

    vec2 onePixel       = vec2(1.0, 1.0) / uDimensions;
    vec2 blurOffsetStep = onePixel * uBlurDirection;

    vBlurTexCoordsLeftOrDown[3] = vTexCoord - (4.0 * blurOffsetStep);
    vBlurTexCoordsLeftOrDown[2] = vTexCoord - (3.0 * blurOffsetStep);
    vBlurTexCoordsLeftOrDown[1] = vTexCoord - (2.0 * blurOffsetStep);
    vBlurTexCoordsLeftOrDown[0] = vTexCoord - (1.0 * blurOffsetStep);

    vBlurTexCoordsRightOrUp[0]  = vTexCoord + (1.0 * blurOffsetStep);
    vBlurTexCoordsRightOrUp[1]  = vTexCoord + (2.0 * blurOffsetStep);
    vBlurTexCoordsRightOrUp[2]  = vTexCoord + (3.0 * blurOffsetStep);
    vBlurTexCoordsRightOrUp[3]  = vTexCoord + (4.0 * blurOffsetStep);

}
