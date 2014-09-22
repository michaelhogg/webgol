#ifdef GL_ES
precision mediump float;
#endif

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

uniform sampler2D state;
uniform vec2      scale;

int get(vec2 offset) {
    return int(texture2D(state, (gl_FragCoord.xy + offset) / scale).r);
}

/**
 * Count neighbours
 */
int countNeighbours() {

    return get(vec2(-1.0, -1.0)) +  // Left bottom
           get(vec2(-1.0,  0.0)) +  // Left centre
           get(vec2(-1.0,  1.0)) +  // Left top

           get(vec2( 0.0, -1.0)) +  // Centre bottom
                                    // Ignore the central cell
           get(vec2( 0.0,  1.0)) +  // Centre top

           get(vec2( 1.0, -1.0)) +  // Right bottom
           get(vec2( 1.0,  0.0)) +  // Right centre
           get(vec2( 1.0,  1.0));   // Right top

}

/**
 * Main
 */
void main() {
    int sum = countNeighbours();
    if (sum == 3) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else if (sum == 2) {
        float current = float(get(vec2(0.0, 0.0)));
        gl_FragColor = vec4(current, current, current, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
