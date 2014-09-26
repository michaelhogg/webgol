#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D sampler;
uniform vec2      viewDimensions;

void main() {

    vec2 coord = gl_FragCoord.xy / viewDimensions;  // Normalise to range 0-1

    gl_FragColor = texture2D(sampler, coord);

}
