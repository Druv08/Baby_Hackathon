"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import styles from "./MariaStudio.module.css";

type Action = "left" | "right" | "up" | "down" | "in" | "out" | "reset" | "wave" | "look" | "bounce";

/** User-approved 3D interpretation; canonical 2D artwork remains untouched. */
export default function MariaStudio() {
  const host = useRef<HTMLDivElement>(null);
  const command = useRef<(action: Action) => void>(() => {});
  const [failed, setFailed] = useState(false), [status, setStatus] = useState("Drag to rotate. Pinch or use the zoom buttons to look closer.");
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor("#f4eaf6");
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional Maria. Use the buttons below as an alternative to dragging.");
    renderer.domElement.setAttribute("role", "img");
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 40);
    camera.position.set(0, 2.9, 7.8);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.7, 0); controls.enablePan = false;
    controls.minDistance = 4.8; controls.maxDistance = 10;
    controls.minPolarAngle = .65; controls.maxPolarAngle = 1.8;
    controls.update(); controls.saveState();
    scene.add(new THREE.HemisphereLight(0xfff5e0, 0x9d7ba9, 2.5));
    const sun = new THREE.DirectionalLight(0xffe5ca, 3); sun.position.set(-3, 6, 6); scene.add(sun);
    const fill = new THREE.DirectionalLight(0xd6c7ff, 1.3); fill.position.set(4, 3, -2); scene.add(fill);
    const model = new THREE.Group(); scene.add(model);
    const mat = (color: string, roughness = .9) => new THREE.MeshStandardMaterial({ color, roughness });
    const fur = mat("#d66c28"), cream = mat("#fff0ce"), brown = mat("#533329"), pink = mat("#ef9cba"), blush = mat("#f3b9c1"), black = mat("#251b1a", .15), white = mat("#ffffff");
    function ellipsoid(parent: THREE.Object3D, material: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), material);
      mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); parent.add(mesh); return mesh;
    }
    ellipsoid(model, brown, 0, 1, 0, .64, .83, .5);
    ellipsoid(model, fur, 0, 1.43, -.04, .66, .55, .5);
    for (const side of [-1, 1]) {
      ellipsoid(model, brown, side * .35, .33, .18, .27, .29, .36);
      for (let i = 0; i < 3; i++) ellipsoid(model, cream, side * .35 + (i - 1) * .08, .29, .51, .025, .045, .035);
    }
    const paw = new THREE.Group(); paw.position.set(-.61, 1.6, 0); model.add(paw);
    ellipsoid(paw, brown, -.05, -.24, .06, .23, .46, .25);
    ellipsoid(model, brown, .65, 1.18, .06, .24, .48, .25);
    const tailCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(.4,.6,-.35),new THREE.Vector3(1.25,.7,-.7),new THREE.Vector3(1.6,1.3,-.85),new THREE.Vector3(1.4,2,-.9),new THREE.Vector3(.95,2.15,-.9)]);
    for (let i = 0; i < 10; i++) {
      const curve = new THREE.CatmullRomCurve3([tailCurve.getPoint(i/10),tailCurve.getPoint((i+.5)/10),tailCurve.getPoint((i+1)/10)]);
      const segment = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, .3-i*.014, 12, false), i%2 ? cream : fur); model.add(segment);
    }
    const tip = tailCurve.getPoint(1); ellipsoid(model, cream, tip.x, tip.y, tip.z, .17, .17, .17);
    const head = new THREE.Group(); head.position.set(0, 2.25, 0); model.add(head);
    ellipsoid(head, fur, 0, 0, 0, .83, .74, .65);
    for (const side of [-1, 1]) {
      ellipsoid(head, cream, side*.65, .59, -.04, .32, .37, .22);
      ellipsoid(head, brown, side*.65, .59, .13, .19, .24, .08);
      ellipsoid(head, blush, side*.65, .59, .18, .11, .15, .03);
      ellipsoid(head, cream, side*.39, -.04, .5, .38, .39, .18);
      ellipsoid(head, fur, side*.37, .16, .59, .24, .32, .09);
      ellipsoid(head, brown, side*.34, .03, .67, .21, .24, .07);
      ellipsoid(head, black, side*.34, .05, .73, .155, .2, .07);
      ellipsoid(head, white, side*.34-.045, .115, .795, .045, .055, .02);
      ellipsoid(head, white, side*.34+.045, -.03, .798, .018, .025, .01);
      ellipsoid(head, cream, side*.36, .38, .56, .17, .085, .07);
      ellipsoid(head, cream, side*.12, -.24, .65, .21, .14, .14);
    }
    ellipsoid(head, black, 0, -.16, .805, .1, .065, .06);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(.11,.016,8,20,Math.PI),brown); smile.rotation.z=Math.PI; smile.position.set(0,-.29,.78); head.add(smile);
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(.46,.14,12,32),pink); scarf.rotation.x=Math.PI/2; scarf.position.set(0,1.75,.02); model.add(scarf);
    ellipsoid(model,pink,.1,1.37,.49,.16,.43,.07);ellipsoid(model,pink,.35,1.25,.46,.13,.4,.07);
    for(const [x,y] of [[.1,1.47],[.35,1.22],[-.2,1.73],[.25,1.73]]) {
      for(let p=0;p<5;p++)ellipsoid(model,cream,x+Math.cos(p/5*Math.PI*2)*.055,y+Math.sin(p/5*Math.PI*2)*.055,.59,.042,.042,.015);
      ellipsoid(model,mat("#edba57"),x,y,.61,.023,.023,.015);
    }
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.2,.16,48),mat("#d9c4e8")); floor.position.y=.05; scene.add(floor);
    const shadow = new THREE.Mesh(new THREE.SphereGeometry(1,24,12),new THREE.MeshBasicMaterial({color:"#765377",transparent:true,opacity:.13}));shadow.position.set(.2,.15,0);shadow.scale.set(1.05,.015,.65);scene.add(shadow);
    for(let i=0;i<9;i++){const star=new THREE.Mesh(new THREE.OctahedronGeometry(.035),mat("#f6cc79"));star.position.set(Math.cos(i*2.4)*2.2,.9+(i%4)*.65,Math.sin(i*2.4)*1.2);scene.add(star);}
    let frame=0, disposed=false, animation: "wave" | "look" | "bounce" | null=null, began=0;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    element.tabIndex = 0;
    element.setAttribute("role", "group");
    element.setAttribute("aria-label", "3D Maria studio. Camera and character controls follow the picture.");
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "center", behavior: reduced.matches ? "instant" : "smooth" });
    function draw(now=performance.now()) {
      frame=0;if(disposed||document.hidden)return;
      const elapsed=(now-began)/1000;
      paw.rotation.z=animation==="wave"?(reduced.matches?-2.1:-2.1+Math.sin(elapsed*12)*.25):0;
      head.rotation.y=animation==="look"?(reduced.matches?.25:Math.sin(elapsed*4)*.35):0;
      model.position.y=animation==="bounce"?(reduced.matches?.04:Math.abs(Math.sin(elapsed*6))*.16):0;
      if(elapsed>1.3){animation=null;paw.rotation.z=0;head.rotation.y=0;model.position.y=0;}
      renderer.render(scene,camera);
      renderer.domElement.dataset.yaw=controls.getAzimuthalAngle().toFixed(3);
      renderer.domElement.dataset.pitch=controls.getPolarAngle().toFixed(3);
      renderer.domElement.dataset.distance=camera.position.distanceTo(controls.target).toFixed(3);
      renderer.domElement.dataset.action=animation??"rest";
      renderer.domElement.dataset.drawCalls=String(renderer.info.render.calls);
      if(animation)frame=requestAnimationFrame(draw);
    }
    function requestDraw(){if(!frame&&!disposed)frame=requestAnimationFrame(draw);}
    function resize(){const r=element!.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();requestDraw();}
    command.current=action=>{
      if(disposed)return;
      if(action==="reset"){animation=null;controls.reset();setStatus("Camera reset. Maria is facing you again.");}
      else if(action==="wave"||action==="look"||action==="bounce"){animation=action;began=performance.now();setStatus(action==="wave"?"Maria waves her paw!":action==="look"?"Maria looks around curiously.":"A little happy bounce!");}
      else {const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
        if(action==="left"||action==="right")spherical.theta+=action==="left"?-.3:.3;
        if(action==="up"||action==="down")spherical.phi=THREE.MathUtils.clamp(spherical.phi+(action==="up"?-.18:.18),.65,1.8);
        if(action==="in"||action==="out")spherical.radius=THREE.MathUtils.clamp(spherical.radius*(action==="in"?.86:1.14),4.8,10);
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();setStatus("View changed. Drag or use the controls to keep exploring.");
      }requestDraw();
    };
    const observer=new ResizeObserver(resize);observer.observe(element);
    controls.addEventListener("change",requestDraw);
    function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;animation=null;}else requestDraw();}
    document.addEventListener("visibilitychange",visibility);
    const offscreen=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting){cancelAnimationFrame(frame);frame=0;animation=null;}else requestDraw();});offscreen.observe(element);
    function cleanup(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();offscreen.disconnect();controls.dispose();document.removeEventListener("visibilitychange",visibility);renderer.domElement.removeEventListener("webglcontextlost",lost);
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}});
      geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();command.current=()=>{};
    }
    function lost(event: Event){event.preventDefault();cleanup();setFailed(true);}
    renderer.domElement.addEventListener("webglcontextlost",lost);
    resize();return cleanup;
  }, []);
  if(failed)return <div className={styles.fallback} role="status"><Image src="/characters/1.png" alt="Normal Maria, the original approved illustration" width={240} height={320} /><p>The 3D studio is resting on this device. Maria’s illustrated adventures are ready to explore.</p><Link href="/" className="btn btn-secondary">Back to Maria</Link></div>;
  return <div className={styles.studio}>
    <div ref={host} className={styles.viewport} data-three-studio />
    <div className={styles.controls} role="group" aria-label="3D camera controls">{([['left','Rotate left'],['right','Rotate right'],['up','Tilt up'],['down','Tilt down'],['in','Zoom in'],['out','Zoom out'],['reset','Reset camera']] as const).map(([action,label])=><button type="button" className="btn btn-secondary" key={action} onClick={()=>command.current(action)}>{label}</button>)}</div>
    <div className={styles.controls} role="group" aria-label="Maria interactions">{([['wave','Wave'],['look','Look around'],['bounce','Happy bounce']] as const).map(([action,label])=><button type="button" className="btn btn-primary" key={action} onClick={()=>command.current(action)}>{label}</button>)}</div>
    <p role="status">{status}</p>
  </div>;
}
