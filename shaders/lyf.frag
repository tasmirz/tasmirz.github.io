precision mediump float;

uniform vec2 iResolution;
uniform vec2 iOffset;
uniform sampler2D iTexture;
uniform float iTime;
uniform float iProgress;

varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    
    // Apply scrolling offset
    vec2 worldUV = uv + iOffset;
    
    // Simple zoom
    float zoom = 4.0;
    vec2 zoomedUV = (worldUV - 0.5) / zoom + 0.5;
    
    // Fix Y-axis and sample texture
    zoomedUV.y = 1.0 - zoomedUV.y;
    vec3 bgColor = texture2D(iTexture, zoomedUV).rgb;
    
    // Simple character dot at center
    vec2 center = vec2(0.5);
    vec2 aspectCorrected = (uv - center) * vec2(iResolution.x / iResolution.y, 1.0);
    float dist = length(aspectCorrected);
    float character = 1.0 - smoothstep(0.02, 0.025, dist);
    
    // Mix character with background
    vec3 charColor = vec3(0.0, 1.0, 1.0);
    vec3 finalColor = mix(bgColor, charColor, character);
    
    // Apply brightness fade when progress > 0.9
    float brightness = 1.0;
    if (iProgress > 0.9 && iProgress <= 1.0) {
        float fadeProgress = (iProgress - 0.9) / 0.1; 
        brightness = .9 - fadeProgress + .1; 
    }
    finalColor *= brightness;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
