#version 300 es
precision mediump float;

in vec2 a_position;// particle spawn position (pixels) - per-instance
in vec2 a_corner;// per-vertex corner coordinate (-1..1)
in float a_size;// half-size in pixels (s = size/2) - per-instance
in float a_rotation;// base particle rotation in radians
in float a_particleId;// particle index for randomness
in float a_spawnTime;// when this particle was spawned (seconds)
in vec2 a_velocity;// particle velocity (vx, vy)
in float a_rotationVelocity;// rotation velocity
// per-vertex color removed; use uniform tint instead
uniform vec4 u_globalTint;
uniform vec2 u_resolution;
uniform float u_rotationScale;
uniform float u_time;// time in seconds for animation
uniform float u_rotationDelta;// randomness amount (0-1)
uniform float u_windRotation;// wind-driven rotation
uniform float u_mouseWind;// mouse-controlled wind (-1 to 1)
out vec4 v_color;
out vec2 v_uv;// normalized local coord (-1..1)
out float v_rotation;// pass rotation to fragment shader

void main(){
    // Calculate particle age and movement
    float particleAge=u_time-a_spawnTime;
    
    // Calculate current position based on spawn position, velocity, and time
    vec2 currentPos=a_position+a_velocity*particleAge;
    
    // Apply wind displacement to particle position
    float ambientWind=sin(u_time+a_particleId)*5.;
    float totalWind=ambientWind+u_mouseWind*1000.;
    float windDisplacement=totalWind*particleAge*.02;
    vec2 particlePos=currentPos+vec2(windDisplacement,0.);
    
    // Calculate current rotation based on base rotation, rotation velocity, and time
    float currentRotation=a_rotation+a_rotationVelocity*particleAge;
    
    // Calculate fade-out based on Y position relative to canvas height
    float yProgress=particlePos.y/u_resolution.y;// 0.0 at top, 1.0 at bottom
    
    // Fade-out logic: start random disappearing at 0.8-0.9, completely gone at 0.95
    float fadeStart=.8+(sin(a_particleId*17.3)*.5+.5)*.1;// Random between 0.8-0.9
    float fadeEnd=.95;
    
    // Calculate alpha multiplier based on Y position progress
    float alphaMultiplier=1.;
    if(yProgress>fadeStart){
        if(yProgress>=fadeEnd){
            alphaMultiplier=0.;// Completely transparent
        }else{
            // Linear fade from fadeStart to fadeEnd
            alphaMultiplier=1.-(yProgress-fadeStart)/(fadeEnd-fadeStart);
            // Add some randomness to the fade for more natural disappearing
            float randomFade=sin(a_particleId*23.7+u_time*2.)*.3+.7;
            alphaMultiplier*=randomFade;
        }
    }
    
    // Generate synchronized rotation with controllable randomness
    float syncedRot=sin(u_time/2.)*3.14159/6.;// gentle synchronized rotation
    
    // Generate pseudo-random offset using particle ID
    float randomSeed=a_particleId*12.9898;
    float randomOffset=(sin(randomSeed)*2.-1.)*u_rotationDelta*3.14159/8.;
    
    // Combine all rotation components (use calculated current rotation instead of base)
    float totalRotation=currentRotation+syncedRot+randomOffset+u_windRotation;
    float rotAngle=totalRotation*max(u_rotationScale,0.);
    
    // compute offset from unit corner (-1..1) scaled by size and rotate it
    float cr=cos(rotAngle);
    float sr=sin(rotAngle);
    vec2 local=a_corner*a_size;// a_corner ∈ {-1,1}
    vec2 rot=vec2(local.x*cr-local.y*sr,local.x*sr+local.y*cr);
    vec2 pos=particlePos+rot;
    
    // provide unrotated local coordinate to fragment shader for texture sampling
    v_uv=a_corner;// -1..1 local coordinate
    // pass the rotation angle to fragment shader for texture coordinate rotation
    v_rotation=rotAngle;
    
    vec2 clip=(pos/u_resolution)*2.-1.;
    gl_Position=vec4(clip.x,-clip.y,0.,1.);
    
    // use global tint; apply alpha multiplier
    v_color=vec4(u_globalTint.rgb,u_globalTint.a*alphaMultiplier);
}
