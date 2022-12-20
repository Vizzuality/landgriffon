#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)


uniform float u_time;
uniform float u_vwidth;
uniform float u_vheight;

attribute float a_random;
attribute float a_speed;

varying vec3 v_pos;
varying float v_random;

float PI = 3.141592653589793;

void main() {
  float progress = (u_time * a_speed) + a_random;
  vec3 nPos = position;

  nPos.x += snoise2(vec2(progress, a_random)) * 0.1;
  nPos.y -= mod(progress, u_vheight);

  v_pos = nPos;
  v_random = a_random;

  // Particle size
  gl_PointSize = 16.0;
  gl_PointSize *= (1.0 / - (modelViewMatrix * vec4(nPos, 1.0)).z);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}