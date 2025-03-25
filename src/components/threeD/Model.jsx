import { useAnimations, useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

useFBX.preload("/assets/img/cloth/ClothsAndCharacter/Cloth1/Model/TShirt1.fbx");

export default function Model() {
  const group = useRef<Group>(null);
  const scene = useFBX("/assets/img/cloth/ClothsAndCharacter/Cloth1/Model/TShirt1.fbx");
  const { animations } = scene;
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    const action = actions["Experiment"];
    if (action) {
      action.play().paused = true; // Chain play and pause
    }
  }, [actions]);

  useFrame((state, delta) => {
    const action = actions["Experiment"];
    if (action) {
      action.time = (action.getClip().duration * state.scroll.offset) / 4;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}