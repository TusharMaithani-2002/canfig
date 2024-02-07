"use client";
import LeftSideBar from "@/components/LeftSideBar";
import Live from "@/components/Live";
import NavBar from "@/components/NavBar";
import RightSideBar from "@/components/RightSideBar";
import { useEffect, useRef, useState } from "react";
import {fabric} from 'fabric';
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/canvas";
import { ActiveElement } from "@/types/type";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef<boolean>(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string|null>('rectangle');

  const [activeElement,setActiveElement] = useState<ActiveElement>({
    name:'',
    value:'',
    icon:''
  })

  const handleActiveElement = (elem:ActiveElement) => {
    setActiveElement(elem)

    selectedShapeRef.current = elem?.value as string;
  }

  useEffect(()=>{
    const canvas = initializeFabric({canvasRef,fabricRef})
    canvas.on('mouse:down',(options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef
      })
    })

    window.addEventListener("resize",() => {
      handleResize({fabricRef})
    })
  },[]);
  return (
    <main className="h-screen overflow-hidden">
      <NavBar 
      activeElement={activeElement}
      handleActiveElement={handleActiveElement}
      
      />

      <section className="flex h-full flex-row">
      
      <LeftSideBar />
      <Live canvasRef={canvasRef}/>
      <RightSideBar />
      </section>
    </main>
  );
}
