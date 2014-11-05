precision mediump float;
attribute vec2 aVertex;
varying vec2 vTexCoord;
void main() {
 gl_Position = vec4(aVertex, 0, 1.0);
 vTexCoord = (aVertex + 1.0) / 2.0;
}
