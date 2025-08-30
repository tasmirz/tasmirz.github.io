precision mediump float;

uniform vec2 iResolution;
uniform vec2 iOffset;
uniform sampler2D iTexture;
uniform float iTime;
uniform float iProgress;

varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    
    vec2 worldUV = uv + iOffset;
    
    float zoom = 4.0;
    vec2 zoomedUV = (worldUV - 0.5) / zoom + 0.5;
    
    zoomedUV.y = 1.0 - zoomedUV.y;
    vec3 bgColor = texture2D(iTexture, zoomedUV).rgb;
    
    vec2 center = vec2(0.5);
    vec2 aspectCorrected = (uv - center) * vec2(iResolution.x / iResolution.y, 1.0);
    float dist = length(aspectCorrected);
    float character = 1.0 - smoothstep(0.02, 0.025, dist);
    
    vec3 charColor = vec3(0.0, 1.0, 1.0);
    vec3 finalColor = mix(bgColor, charColor, character);
    
    float brightness = 1.0;
    if (iProgress > 0.9 && iProgress <= 1.0) {
        float fadeProgress = (iProgress - 0.9) / 0.1; 
        brightness = .9 - fadeProgress + .1; 
    }
    finalColor *= brightness;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
