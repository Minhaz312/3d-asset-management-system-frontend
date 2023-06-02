import { createContext, useState } from "react";

const initialState = {
    data: [
        {id:null,name:null,createdAt:null,updatedAt:null}
    ],
    setUpdatedTypeList:null
}

const TypeContext = createContext(initialState)


const TypeProvider = ({children}) => {
    const [typeList,setTypeList] = useState(initialState)

    const setUpdatedTypeList = (updatedList) => {
        setTypeList(updatedList)
    }

    return <TypeContext.Provider value={{
        typeList,typeList,
        setUpdatedTypeList:setUpdatedTypeList
    }}>
        {children}
    </TypeContext.Provider>
}

export {TypeProvider,TypeContext};