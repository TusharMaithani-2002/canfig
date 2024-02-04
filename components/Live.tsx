import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
  const others = useOthers();
  const broadcast = useBroadcastEvent();

  
  const [{cursor},updateMyPresence] = useMyPresence() as any;
  const [cursorState,setCursorState] = useState({
    mode:CursorMode.Hidden
  })

  // clearing emojies after 4 seconds
  useInterval(()=>{
    setReactions((reaction)=>reaction.filter((r) => r.timestamp > Date.now() - 4000))
  },1000);
  useInterval(() => {
    
    if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReactions(reactions => reactions.concat([
        {
          point:{x:cursor.x,y:cursor.y},
          value:cursorState.reaction,
          timestamp:Date.now(),
        }
      ]))

      broadcast({
        x:cursor.x,
        y:cursor.y,
        value:cursorState.reaction
      })
    }
  },100);


  useEventListener((eventData)=> {
    const event = eventData.event as ReactionEvent;

    setReactions(reactions => reactions.concat([
      {
        point:{x:event.x,y:event.y},
        value:event.value,
        timestamp:Date.now(),
      }
    ]))
  })

  const [reactions,setReactions] = useState<Reaction[]>([])

  const handlePointerMove = useCallback((event:React.PointerEvent) => {
    event.preventDefault();

    if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
  
      updateMyPresence({cursor :{x,y}});
    }

  },[]);

  const handlePointerLeave = useCallback((event:React.PointerEvent) => {
    setCursorState({mode:CursorMode.Hidden})

    updateMyPresence({cursor :null,message:null});
  },[]);

  const handlePointerDown = useCallback((event:React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({cursor :{x,y}});
    // check if we are in reaction mode
   setCursorState((state:CursorState)=>cursorState.mode === CursorMode.Reaction ? {...state,isPressed:true} : state);
  },[cursorState.mode,setCursorState]);

  const handlePointerUp = useCallback(() => {
    setCursorState((state:CursorState) => cursorState.mode === CursorMode.Reaction ? {...state,isPressed:false}:state)
  },[cursorState.mode,setCursorState]);

  useEffect(()=>{
    const onKeyUp = (e:KeyboardEvent) => {
      if(e.key === '/') {
        setCursorState({
          mode:CursorMode.Chat,
          previousMessage:null,
          message:'',
        })
      } else if (e.key === 'Escape') {
        updateMyPresence({message:''})
        setCursorState({
          mode:CursorMode.Hidden
        })

      }
      else if(e.key==='e') {
        
        setCursorState({
          mode:CursorMode.ReactionSelector
        })
      }
    }
    const onKeyDown = (e:KeyboardEvent) => {
      if(e.key === '/') e.preventDefault();
    } 

    window.addEventListener('keyup',onKeyUp);
    window.addEventListener('keydown',onKeyDown);


    return () => {
      window.removeEventListener('keyup',onKeyUp);
      window.removeEventListener('keydown',onKeyDown);
    }
  },[updateMyPresence]);

  const setReaction = useCallback((reaction:string) => {
    setCursorState({mode:CursorMode.Reaction,reaction,isPressed:false})
  },[])
  console.log('rendering')
  // console.log(reactions)
  return (
    <div
    onPointerMove={handlePointerMove}
    onPointerLeave={handlePointerLeave}
    onPointerDown={handlePointerDown}
    onPointerUp={handlePointerUp}
    className="h-[100vh] w-full flex justify-center items-center text-center"
    >
        <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>
          {/* {console.log(reactions)} */}
        {
          reactions.map((r) => (<FlyingReaction key={r.timestamp.toString()} x={r.point.x} y={r.point.y} timestamp={r.timestamp} value={r.value}/>))
        }
        {cursor && <CursorChat cursor={cursor} cursorState={cursorState}
        setCursorState={setCursorState} updateMyPresence={updateMyPresence}
        />}

        {cursorState.mode === CursorMode.ReactionSelector && (<ReactionSelector setReaction = {setReaction} />)}
      <LiveCursors others={others}/>
    </div>
  );
};

export default Live;