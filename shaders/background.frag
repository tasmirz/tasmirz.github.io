precision mediump float;

uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform float iFrameRate;
uniform int iFrame;
uniform vec4 iMouse;
uniform vec4 iDate;

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
   
    for(float i = 1.0; i < 8.0; i++){
        uv.y += i * 0.1 / i * 
          sin(uv.x * i * i + iTime * 0.5) * sin(uv.y * i * i + iTime * 0.5);
    }
    
    vec3 col;
    col.r = uv.y + 0.95;
    col.g = uv.y + 0.3;
    col.b = uv.y - 0.1;
    
    gl_FragColor = vec4(col, 1.0);
}