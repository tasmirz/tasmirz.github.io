#version 300 es
precision mediump float;

in vec4 v_color;
in vec2 v_uv; // -1..1 local coordinate (unrotated)
in float v_rotation; // rotation angle from vertex shader
out vec4 outColor;

uniform sampler2D u_texture;
// a global coordinate provided from JS (in pixels, e.g. [x,y])
uniform vec2 u_globalCoord;
uniform float u_rotationScale;

void main() {
  float dist = length(v_uv);

  // rotate texture coordinates by the particle rotation (try negative rotation)
  float cr = cos(-v_rotation);
  float sr = sin(-v_rotation);
  vec2 rotated_uv = vec2(v_uv.x * cr - v_uv.y * sr, v_uv.x * sr + v_uv.y * cr);
  
  vec2 texcoord = rotated_uv * 0.5 + 0.5;
  vec4 tex = texture(u_texture, texcoord);

  float alpha = v_color.a * tex.a;
  // discard fully transparent fragments to avoid write to depth/stencil and unnecessary blending
  if (alpha < 0.01) discard;
  // premultiply color by alpha because the WebGL canvas was created with premultipliedAlpha = true
  vec3 color = v_color.rgb * tex.rgb * alpha;
  outColor = vec4(color, alpha);
}
