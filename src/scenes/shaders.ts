// ─── GLSL Shaders ────────────────────────────────────────────────────────────

// ── Orb: morphing sphere vertex ──────────────────────────────────────────────
export const ORB_VERT = /* glsl */`
uniform float uT;
uniform float uM;
varying vec3 vN;
varying vec3 vP;
varying vec2 vUv;

float h(vec3 p){
  p=fract(p*vec3(443.9,397.3,491.2));
  p+=dot(p.zxy,p.yxz+19.19);
  return fract(p.x*p.y*p.z);
}
float n3(vec3 p){
  vec3 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(
    mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),
    f.z
  );
}

void main(){
  vUv = uv;
  float t = uT * 0.32;
  float d = (n3(position*1.1+t)*0.5 + n3(position*2.4-t*0.55)*0.25 + n3(position*4.2+t)*0.125 - 0.5) * uM;
  vec3 pos = position + normal * d;
  vN = normalize(normalMatrix * normal);
  vP = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

// ── Orb: iridescent fragment ─────────────────────────────────────────────────
export const ORB_FRAG = /* glsl */`
uniform float uT;
uniform float uI;
uniform sampler2D uTex;
varying vec3 vN;
varying vec3 vP;
varying vec2 vUv;

vec3 pal(float t){
  return vec3(0.5,0.4,0.6)
       + vec3(0.5,0.4,0.5) * cos(6.2832 * (vec3(1.0,0.78,1.0)*t + vec3(0.0,0.28,0.6)));
}

void main(){
  vec3 n = normalize(vN);
  vec3 v = normalize(vec3(0.0,0.0,1.0) - vP*0.16);
  float fr  = pow(1.0 - max(dot(n,v), 0.0), 2.3);
  float rim = smoothstep(0.22, 1.0, fr);

  vec3 col = mix(vec3(0.02,0.015,0.03), pal(dot(n,vec3(0.5,0.68,0.32)) + uT*0.1), rim*0.94);
  col += vec3(1.0,0.54,0.1) * pal((dot(n,vec3(-0.58,-0.42,0.52)) + uT*0.07)*0.5).r * pow(fr,4.8) * 0.72;

  vec4 tx = texture2D(uTex, vUv);
  col = mix(col, tx.rgb * 0.9, uI * (1.0 - rim*0.72));
  col += vec3(0.85,0.92,1.0) * pow(max(dot(reflect(-v,n), vec3(0.0,0.0,1.0)), 0.0), 26.0) * 0.3;

  gl_FragColor = vec4(col, clamp(rim*1.55 + 0.08 + uI*(1.0-rim*0.72)*0.62, 0.0, 1.0));
}
`

// ── Post-processing quad ─────────────────────────────────────────────────────
export const QUAD_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export const QUAD_FRAG = /* glsl */`
uniform float uT;
uniform sampler2D uS;
varying vec2 vUv;

float rnd(vec2 c){ return fract(sin(dot(c, vec2(12.98,78.23)))*43758.55); }

void main(){
  vec4 c = texture2D(uS, vUv);
  // Film grain
  c.rgb += (rnd(vUv + fract(uT*0.046))*2.0 - 1.0) * 0.024;
  // Vignette
  vec2 u = vUv*2.0 - 1.0;
  c.rgb *= 1.0 - dot(u*vec2(0.76,1.0), u*vec2(0.76,1.0)) * 0.3;
  gl_FragColor = clamp(c, 0.0, 1.0);
}
`

// ── Particles ────────────────────────────────────────────────────────────────
export const PARTICLE_VERT = /* glsl */`
attribute float aS;
attribute float aSp;
uniform float uT;
uniform float uY;
varying float vA;

void main(){
  vec3 p = position;
  float d = mod(p.y + uT*aSp*0.13 + uY*0.00045, 11.0) - 5.5;
  p.y = d;
  p.x += sin(uT*aSp*0.22 + p.z) * 0.028;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aS * (250.0 / -mv.z);
  float t = (d + 5.5) / 11.0;
  vA = sin(t * 3.14159) * 0.52;
}
`

export const PARTICLE_FRAG = /* glsl */`
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  if(length(c) > 0.5) discard;
  gl_FragColor = vec4(0.5, 0.44, 0.62, (1.0 - length(c)*2.0)*vA*0.38);
}
`
