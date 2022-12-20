uniform float u_time;
uniform float u_vwidth;
uniform float u_vheight;

varying vec3 v_pos;
varying float v_random;

void main() {
  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
  float progress = (sin(u_time * v_random * 5.0) * 0.5 + 0.5) + 0.75;
  float opacity = mix(1.0, 0.0, ((u_vheight * 0.75) - v_pos.y) / (u_vheight * 0.75)) * (progress);

  float r = 0.0, delta = 0.0, alpha = 1.0;
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  r = dot(cxy, cxy);

  if (r > 1.0) {
    discard;
  }

  delta = fwidth(r);
  alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);

  gl_FragColor = color * opacity * alpha;
}