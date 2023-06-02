import { createContext, useState } from "react";

const initialState = {id:null,name:null,mail:null,loggedIn:false}

const UserContext = createContext(initialState)


const UserProvider = ({children}) => {
    const [user,setUser] = useState(initialState)

    const updateUser = (user) => {
        setUser(user)
    }

    return <UserContext.Provider value={{
        user:user,
        updateUser:updateUser
    }}>
        {children}
    </UserContext.Provider>
}

export {UserProvider,UserContext};