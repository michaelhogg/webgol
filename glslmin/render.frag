precision mediump float;
#define CELL_STATE_DEAD 0
#define CELL_STATE_ALIVE 1
#define COLOUR_DEAD vec4(0.0, 0.0, 0.0, 1.0)
#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)
uniform sampler2D sampler;
uniform vec2 viewDimensions;
uniform vec4 colourTopLeft;
uniform vec4 colourTopRight;
uniform vec4 colourBottomLeft;
uniform vec4 colourBottomRight;
int getCellState() {
 vec2 coord = gl_FragCoord.xy / viewDimensions;
 vec4 colour = texture2D(sampler, coord);
 return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);
}
vec4 calculateInterpolatedColour() {
 vec2 fraction = gl_FragCoord.xy / viewDimensions;
 vec4 colourTop = mix(colourTopLeft, colourTopRight, fraction.x);
 vec4 colourBottom = mix(colourBottomLeft, colourBottomRight, fraction.x);
 return mix(colourBottom, colourTop, fraction.y);
}
void setFragColour(int cellState, vec4 interpolatedColour) {
 gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? interpolatedColour : COLOUR_DEAD);
}
void main() {
 int cellState = getCellState();
 vec4 interpolatedColour = calculateInterpolatedColour();
 setFragColour(cellState, interpolatedColour);
}
