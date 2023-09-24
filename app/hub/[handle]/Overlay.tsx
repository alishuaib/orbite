'use client'
import { readContext , writeContext} from "@/app/context"
import * as Icon from "@phosphor-icons/react"
import { useRef } from "react"

export default function Overlay(props:{type:"course" | "module" }) {
    const overlay = readContext()?.overlay
    const setOverlay = writeContext()?.setOverlay!      
   
    function closeOverlay(event: React.MouseEvent<HTMLDivElement>){
        if (event.target === event.currentTarget) {
            setOverlay(null);
        }
    }

    return (        
        <div 
            onClick={closeOverlay} 
            className="transition-all top-0 left-0 flex absolute h-screen w-screen backdrop-blur-sm bg-black/30 z-50 items-center justify-center overflow-hidden"
            style={{display: overlay ? "flex" : "none",pointerEvents: overlay ? "auto" : "none",opacity: overlay ? "1" : "0"}}
        >
            {
                {
                    'course': <CourseOverlay/>,
                    'module': <ModuleOverlay/>
                }[overlay || 'course']
            }
        </div>
    )
}

function CourseOverlay(){
    const formRef = useRef<HTMLFormElement>(null)
    const setOverlay = writeContext()?.setOverlay!

    function submitForm(event: React.MouseEvent<HTMLDivElement>){
        console.log('can you submit form')
        setOverlay(null);
    }

    return (
        <div className="h-4/5 w-4/5 bg-gray-100 rounded-lg flex overflow-hidden">
                <div className="h-full w-3/5 p-8 flex flex-col gap-4">
                    <h1 className="text-4xl">Create a new course</h1>
                    <form ref={formRef} action="" className="flex flex-col gap-8">
                        <div className="flex  flex-col gap-2">                            
                            <label htmlFor=""> Course Name </label>
                            <input type="text" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor=""> Label (Optional) </label>
                            <input type="text" name="" id="" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor=""> Description </label>
                            <textarea name="" id="" cols={30} rows={8}></textarea>
                        </div>

                        <div className="flex gap-4 items-center">
                            <label htmlFor="">Visibility</label>
                            <div className="flex gap-4">
                                <div className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-full cursor-pointer hover:scale-95 border-indigo-400`}>
                                    <Icon.Eye className="fill-indigo-400" width={24} height={24}/>
                                    <p className="text-indigo-400">Visible</p>
                                </div>    
                                <div className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-full cursor-pointer hover:scale-95 border-gray-300`}>
                                    <Icon.Buildings className="fill-gray-300" width={24} height={24}/>
                                    <p className="text-gray-300">Insider</p>
                                </div>
                                <div className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-full cursor-pointer hover:scale-95 border-gray-300`}>
                                    <Icon.EyeSlash className="fill-gray-300" width={24} height={24}/>
                                    <p className="text-gray-300">Private</p>
                                </div>                        
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="flex flex-col">
                                <label className="" htmlFor="">Logo</label>
                                <p className="text-xs text-gray-300">Recommended Size <br /> 256px x 256px</p>
                            </div>
                            <input className="" type="file" name="" id="" />
                        </div>
                    </form>
                </div>
                <div className="flex items-end h-full w-fit p-2">
                    <div className="flex items-center w-full gap-1 cursor-pointer" onClick={submitForm}>
                        <h2 className="text-2xl" >Create</h2>
                        <Icon.ArrowCircleRight weight="thin" className="fill-gray-400" width={48} height={48}/>
                    </div>
                </div>
                <div className="h-full w-2/5 bg-gray-200 flex-none"></div>
            </div>
    )
}


function ModuleOverlay(){
    const formRef = useRef<HTMLFormElement>(null)
    const setOverlay = writeContext()?.setOverlay!

    function submitForm(event: React.MouseEvent<HTMLDivElement>){
        console.log('can you submit form')
        setOverlay(null);
    }
    
    return (
        <div className="h-4/5 w-2/5 bg-gray-100 rounded-lg flex flex-col overflow-hidden">
                <div className="h-full w-full p-8 flex flex-1 flex-col gap-4">
                    <h1 className="text-4xl">Create a new module</h1>
                    <form ref={formRef} action="" className="flex flex-col gap-8">
                        <div className="flex  flex-col gap-2">                            
                            <label htmlFor=""> Course Name </label>
                            <input type="text" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor=""> Label (Optional) </label>
                            <input type="text" name="" id="" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor=""> Description </label>
                            <textarea name="" id="" cols={30} rows={8}></textarea>
                        </div>

                        <div className="flex gap-4 items-center">
                            <label htmlFor="">Visibility</label>
                            <div className="flex gap-4">
                                <div className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-full cursor-pointer hover:scale-95 border-indigo-400`}>
                                    <Icon.Eye className="fill-indigo-400" width={24} height={24}/>
                                    <p className="text-indigo-400">Visible</p>
                                </div>    
                                <div className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-full cursor-pointer hover:scale-95 border-gray-300`}>
                                    <Icon.Buildings className="fill-gray-300" width={24} height={24}/>
                                    <p className="text-gray-300">Insider</p>
                                </div>
                                <div className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-full cursor-pointer hover:scale-95 border-gray-300`}>
                                    <Icon.EyeSlash className="fill-gray-300" width={24} height={24}/>
                                    <p className="text-gray-300">Private</p>
                                </div>                        
                            </div>
                        </div>

                        {/* <div className="flex gap-4 items-center">
                            <div className="flex flex-col">
                                <label className="" htmlFor="">Logo</label>
                                <p className="text-xs text-gray-300">Recommended Size <br /> 256px x 256px</p>
                            </div>
                            <input className="" type="file" name="" id="" />
                        </div> */}
                    </form>
                </div>
                <div className="flex items-end h-fit w-full p-8">
                    <div className="flex items-center w-full gap-1 cursor-pointer" onClick={submitForm}>
                        <h2 className="text-2xl" >Create</h2>
                        <Icon.ArrowCircleRight weight="thin" className="fill-gray-400" width={48} height={48}/>
                    </div>
                </div>
                {/* <div className="h-full w-2/5 bg-gray-200 flex-none"></div> */}
            </div>
    )
}