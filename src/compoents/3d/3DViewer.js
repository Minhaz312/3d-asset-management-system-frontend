import React, { useEffect, useRef } from 'react'
import ModalLoader from "./../../lib/ModalLoader.js"

export default function Viewer({height,width,bgColor,filelocation}) {
    const canvas = useRef(null);
  const container = useRef(null);
  const loadingElement = useRef(null);
  useEffect(()=> {
    ModalLoader(container.current,loadingElement.current,filelocation,bgColor)
  },[filelocation])
  return (
    <div ref={container} style={{height: height,width: width}}>
        <div ref={loadingElement} className="modal-loading-progress">
          
        </div>
    </div>
  )
}
