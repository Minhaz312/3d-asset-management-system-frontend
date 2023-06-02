import axios from 'axios'
import React, { useContext, useState } from 'react'

import {Row, Col, Offcanvas} from 'react-bootstrap'
import { AiOutlineClose } from 'react-icons/ai'
import { FaBars } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { UserContext } from '../contexts/userContext';
import URL from '../api/Routes'

import SideBar from './SideBar'
import { TypeContext } from '../contexts/typeContext'

export default function Layot({children}) {


const userContext = useContext(UserContext)
const typeContext = useContext(TypeContext)


  const [user, setUser] = useState({id:null,name:null,mail:null})
  const [showDrawer, setShowDrawer] = useState(false)

  const handleOpenDrawer = () => {
    if(showDrawer===true) {
      setShowDrawer(false)
    }else{
      setShowDrawer(true)
    }
  }

  const navigate = useNavigate()
  let auth=false;
  if(sessionStorage.getItem("loggedin")==="true" && sessionStorage.getItem("token")!=="null"){
    auth = true
  }

  const getAllType = () => {
    const uri = URL+"/type/get/all";
    const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
    axios.get(uri,header).then(res=> {
        if(res.status === 200 && res.data.success === true) {
          typeContext.setUpdatedTypeList({error: false, data: res.data.data});
        }else{
            typeContext.setUpdatedTypeList({error: true, data: []});
        }
    }).catch(error=> {
        typeContext.setUpdatedTypeList({error: true, data: []});
    })
}


  const getLoggedinUser = async (id,token) => {
    await axios.get(URL+`/user/get/${id}`,{headers:{"Authorization":token}}).then(res=> {
        if(res.status === 200 && res.data.success === true) {
            let user = res.data.data;
            setUser({id:user._id,name:user.name,mail:user.mail})
            userContext.updateUser({id:user._id,name:user.name,mail:user.mail,loggedIn:true})
        }
    }).catch(err=>{
    })
  }

  React.useEffect(()=>{
    if(auth===false) {
      navigate("/",{replace:true})
    }else{
      const id = sessionStorage.getItem("_id")
      const token = sessionStorage.getItem("token")
      getLoggedinUser(id,token)
      getAllType()
    }
  },[])
  if(auth===true) {
    return (<>
            <Offcanvas show={showDrawer} onHide={handleOpenDrawer}>
              <Offcanvas.Header style={{background:"#17AC8C 28.87%"}}>
                <div className='w-100 d-flex justify-content-between px-3'>
                  <span></span>
                  <span style={{cursor: "pointer"}} className="text-white fs-5 font-weight-bold" onClick={handleOpenDrawer}><AiOutlineClose /></span>
                </div>
              </Offcanvas.Header>
              <SideBar userContext={userContext} />
            </Offcanvas>
            <div className="layout-container">
            <div className='d-lg-block d-none' style={{width:"215px"}}>
              <SideBar userContext={userContext} />
            </div>
              <div style={{height: '100vh',overflowX:'hidden', overflowY: 'auto',width:"100%"}}>
              <div className="d-lg-none d-block">
              <div style={{background:"linear-gradient(90deg, #17AC8C 28.87%, #2DC9D8 100%)",height:"7vh"}} className="w-100 py-1 d-flex justify-content-between align-items-center" >
                <button onClick={handleOpenDrawer} className="btn btn-transparent text-white"><FaBars fontSize="30px" /></button>
                <div className="px-3">
                  <img src='/images/logo.png' style={{width:"auto",height: '50px'}} />
                </div>
              </div>
              </div>
                <ToastContainer 
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <div className="p-3 w-100">
                  {children}
                </div>
            </div>
            </div>
        </>
    )
  }else{
    return (
      <div>
        <h1 className="text-center text-danger my-5">Please login first</h1>
      </div>
    )
  }
}
