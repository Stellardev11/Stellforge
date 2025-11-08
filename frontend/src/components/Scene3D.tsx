import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Float } from '@react-three/drei'
import { Suspense } from 'react'

function FloatingToken() {
  return (
    <Float
      speed={2}
      rotationIntensity={1}
      floatIntensity={0.5}
    >
      <mesh>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#3BA3FF"
          emissive="#134E9C"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#3BA3FF" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#F8C365" />
          
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          
          <FloatingToken />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
