precision mediump float;
#define CELL_STATE_DEAD 0
#define CELL_STATE_ALIVE 1
#define COLOUR_DEAD vec4(0.0, 0.0, 0.0, 1.0)
#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)
uniform sampler2D sampler;
uniform vec2 stateDimensions;
uniform bool enableWrapping;
float wrapValue(float value) {
 if (value < 0.0) value += 1.0;
 if (value > 1.0) value -= 1.0;
 return value;
}
int getCellState(vec2 offset) {
 vec2 coord = (gl_FragCoord.xy + offset) / stateDimensions;
 if (enableWrapping == true) {
 coord.x = wrapValue(coord.x);
 coord.y = wrapValue(coord.y);
 } else {
 if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
 return CELL_STATE_DEAD;
 }
 }
 vec4 colour = texture2D(sampler, coord);
 return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);
}
int countNeighbours() {
 return getCellState(vec2(-1.0, -1.0)) +
 getCellState(vec2(-1.0, 0.0)) +
 getCellState(vec2(-1.0, 1.0)) +
 getCellState(vec2( 0.0, -1.0)) +
 getCellState(vec2( 0.0, 1.0)) +
 getCellState(vec2( 1.0, -1.0)) +
 getCellState(vec2( 1.0, 0.0)) +
 getCellState(vec2( 1.0, 1.0));
}
int calculateNextGeneration(int neighbours) {
 if (neighbours == 3) {
 return CELL_STATE_ALIVE;
 } else if (neighbours == 2) {
 return getCellState(vec2(0.0, 0.0));
 } else {
 return CELL_STATE_DEAD;
 }
}
void setFragColour(int cellState) {
 gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? COLOUR_ALIVE : COLOUR_DEAD);
}
void main() {
 int neighbours = countNeighbours();
 int cellState = calculateNextGeneration(neighbours);
 setFragColour(cellState);
}
