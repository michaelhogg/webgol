precision mediump float;

uniform sampler2D uSamplerA;
uniform sampler2D uSamplerB;

varying vec2 vTexCoord;

/**
 * Main
 */
void main() {

    vec4 colourA = texture2D(uSamplerA, vTexCoord);
    vec4 colourB = texture2D(uSamplerB, vTexCoord);

    vec4 sum = clamp(colourA + colourB, 0.0, 1.0);

    gl_FragColor = vec4(sum.rgb, 1.0);

}
