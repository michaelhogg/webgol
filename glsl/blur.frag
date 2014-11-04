precision mediump float;

uniform sampler2D uSampler;
uniform float     uBrighteningFactor;

varying vec2 vTexCoord;
varying vec2 vBlurTexCoordsLeftOrDown[4];
varying vec2 vBlurTexCoordsRightOrUp[4];

/**
 * Main
 *
 * Weights are taken from
 * rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
 */
void main() {

    vec4 blurred = vec4(0.0);

    blurred += texture2D(uSampler, vBlurTexCoordsLeftOrDown[3]) * 0.0162162162;
    blurred += texture2D(uSampler, vBlurTexCoordsLeftOrDown[2]) * 0.0540540541;
    blurred += texture2D(uSampler, vBlurTexCoordsLeftOrDown[1]) * 0.1216216216;
    blurred += texture2D(uSampler, vBlurTexCoordsLeftOrDown[0]) * 0.1945945946;

    blurred += texture2D(uSampler, vTexCoord)                   * 0.2270270270;

    blurred += texture2D(uSampler, vBlurTexCoordsRightOrUp[0])  * 0.1945945946;
    blurred += texture2D(uSampler, vBlurTexCoordsRightOrUp[1])  * 0.1216216216;
    blurred += texture2D(uSampler, vBlurTexCoordsRightOrUp[2])  * 0.0540540541;
    blurred += texture2D(uSampler, vBlurTexCoordsRightOrUp[3])  * 0.0162162162;

    blurred = clamp(blurred * uBrighteningFactor, 0.0, 1.0);

    gl_FragColor = vec4(blurred.rgb, 1.0);

}
