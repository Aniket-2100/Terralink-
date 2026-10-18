// --- 1. SCROLL REVEAL (FORCES CONTENT TO BE VISIBLE IMMEDIATELY) ---
function revealElements() {
    const reveals = document.querySelectorAll(".reveal");
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 40 || window.scrollY > 50) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", revealElements);
window.addEventListener("DOMContentLoaded", () => {
    // Reveal initial viewports immediately
    document.querySelectorAll(".reveal").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add("active");
        }
    });
});
revealElements();

// --- 2. RESTORE FULL 3D MAG-LEV SUBTERRANEAN SIMULATION ---
const container = document.getElementById('simulation-bg');

if (container && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.035);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Tunnel Rings / Micro-Tube Grid
    const tubeGroup = new THREE.Group();
    const ringCount = 28;
    const ringSpacing = 3.5;

    for (let i = 0; i < ringCount; i++) {
        const ringGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.08, 16, 1, true);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.z = -i * ringSpacing;
        tubeGroup.add(ring);
    }

    // Mag-Lev Track Guideway
    const trackGeo = new THREE.BoxGeometry(1.6, 0.06, ringCount * ringSpacing);
    const trackMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.35
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, -1.8, -(ringCount * ringSpacing) / 2);
    tubeGroup.add(track);

    // Glowing Linear Acceleration Pulses
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        posArr[i] = (Math.random() - 0.5) * 5;
        posArr[i + 1] = (Math.random() - 0.5) * 4;
        posArr[i + 2] = -Math.random() * (ringCount * ringSpacing);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 0.045,
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    tubeGroup.add(particles);

    scene.add(tubeGroup);

    // Mouse Tracking for dynamic steering
    let targetX = 0;
    let targetY = 0;
    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 1.2;
        targetY = -(e.clientY / window.innerHeight - 0.5) * 0.8;
    });

    // Animation Loop
    let speed = 0.45;
    function animate() {
        requestAnimationFrame(animate);

        // Move tunnel backward to simulate high-speed forward travel
        tubeGroup.children.forEach((child) => {
            if (child !== track && child !== particles) {
                child.position.z += speed;
                if (child.position.z > 5) {
                    child.position.z -= ringCount * ringSpacing;
                }
            }
        });

        // Loop Particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 2; i < particleCount * 3; i += 3) {
            positions[i] += speed * 1.5;
            if (positions[i] > 5) {
                positions[i] = -(ringCount * ringSpacing);
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Smooth camera dampening to mouse
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.lookAt(0, -0.4, -20);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}