precision mediump float;
attribute vec2 aVertex;
void main() {
 gl_Position = vec4(aVertex, 0, 1.0);
}
