precision mediump float;

uniform vec3 iResolution;     // viewport resolution (in pixels)
uniform float iTime;          // shader playback time (in seconds)
uniform float iTimeDelta;     // render time (in seconds)
uniform float iFrameRate;     // shader frame rate
uniform int iFrame;           // shader playback frame
uniform vec4 iMouse;          // mouse pixel coords. xy: current, zw: click
uniform vec4 iDate;           // (year, month, day, time in seconds)

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float aspect = iResolution.x / iResolution.y;
    vec2 scaledUV = uv;
    scaledUV.x *= aspect;
    vec2 mouseUV = iMouse.xy / iResolution.xy;
    mouseUV.x *= aspect;
    vec3 color = vec3(0.0);
    
    // Create ripples from each stored position

            float dist = distance(scaledUV, mouseUV);
            float ripple = 10.0*sin(dist * 12.0 - iTime * 1.0) * exp(-dist * 9.0);
            color += vec3(0.0118, 0.3922, 1.0) * ripple * 0.1;

    gl_FragColor = vec4(color, 1.0);
}