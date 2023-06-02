import React, { useContext, useState } from 'react'
import { Button, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";

import { MdLogout } from 'react-icons/md'

import { useLocation } from 'react-router-dom'
import axios from 'axios';
import URL from '../api/Routes';
import { FaListUl, FaUserCircle } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineUnorderedList } from 'react-icons/ai';
import { ErrorToast, SuccessToast, WarningToast } from './toast-alert/SuccessToast';
import Swal from 'sweetalert2';
import { UserContext } from '../contexts/userContext';

export default function SideBar({userContext}) {


    const {user,updateUser} = userContext;


    const [showUpdateUserModal,setShowUpdateUserModal] = useState(false)
    const [showCreateUserModal,setShowCreateUserModal] = useState(false)
    const [showPassword,setShowPassword] = useState(false)

    const [oldPassword, setOldPassword] = useState("")

    const [updateName,setUpdatedName] = useState("")
    const [updatedMail,setUpdatedMail] = useState("")
    const [updatedPassword,setUpdatedPassword] = useState("")
    
    const [createUserName,setCreateUserName] = useState("")
    const [createUserdMail,setCreateUserMail] = useState("")
    const [createUserdPassword,setCreateUserPassword] = useState("")

    const [passLengthErr, setPassLengthErr] = useState(null)

    const location = useLocation()
    const navigate = useNavigate()

    const locationArray = location.pathname.split("/");

    const path = locationArray[locationArray.length-1]


    const header = {headers:{"Authorization":sessionStorage.getItem("token")}}


    const handleOpenUpdateUserModal = () =>{
        if(showUpdateUserModal===true) {
            setShowUpdateUserModal(false)
            setUpdatedName("")
            setUpdatedMail("")
            setUpdatedPassword("")
            setOldPassword("")
            setPassLengthErr(null)
            setShowPassword(false)
        }else{
            setShowUpdateUserModal(true)
        }
    }

    const handleShowPassword = () => {
        if(showPassword===true){
            setShowPassword(false)
        }else{
            setShowPassword(true)
        }
    }
    const handleOpenCreateUserModal = () => {
        if(showCreateUserModal===true){
            
            setShowCreateUserModal(false)
        }else{
            setShowCreateUserModal(true)
        }
    }

    const handleCreateNewUser = async () => {
        const data = {name:createUserName,mail:createUserdMail, password:createUserdPassword};
        await axios.post(URL+"/user/create",data,header).then(res=>{
            if(res.status === 200 && res.data.success === true) {
                SuccessToast("User created successfully!")
            }else{
                ErrorToast("Failed to create new user!")
            }
        }).catch(error=>{
            ErrorToast("Failed to create new user!")
        })
    }
    const handleUpdateUser = async () => {
        if(oldPassword===""){
            alert("Enter the old password")
        }else if(updateName==="" && updatedMail==="" && updatedPassword===""){
            WarningToast("Please update data!")
        }else{
            const data = {
                newName:updateName===""?user.name:updateName,
                newMail:updatedMail===""?user.mail:updatedMail,
                newPassword:updatedPassword,
                oldPassword:oldPassword,
                oldMail:user.mail,
                userId:user.id
            }
            await axios.put(URL+"/user/update",data,header).then(res=>{
                if(res.status === 200 && res.data.success === true) {
                    const userData = res.data.data
                    updateUser({id:userData.id,name:userData.name,mail:userData.mail,loggedIn:true})
                    SuccessToast("User Update successfully!")
                    setShowUpdateUserModal(false)
                    setUpdatedName("")
                    setUpdatedMail("")
                    setUpdatedPassword("")
                    setOldPassword("")
                    setPassLengthErr(null)
                    setShowPassword(false)
                }else{
                    ErrorToast("Failed to update user!")
                }
            }).catch(error=>{
                ErrorToast("Failed to update user!")
            })
        }
    }
    
    const handleDeleteAccount = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete'
          }).then((result) => {
            if (result.isConfirmed) {
                const data = {id:user.id}
                axios.delete(URL+`/user/delete/${user.id}`,data,header).then(res=>{
                    if(res.status === 200 && res.data.success === true) {
                        sessionStorage.removeItem("_id")
                        sessionStorage.removeItem("_name")
                        sessionStorage.removeItem("loggedin")
                        sessionStorage.removeItem("token")
                        navigate("/",{replace:true})
                    }else{
                        ErrorToast("Failed to delete account!")
                    }
                }).catch(error=>{
                    ErrorToast("Failed to delete account!")
                })
            }
          })
    }

    const handleSetUpdatedPass = e => {
        let pass = e.target.value.trim();
        if(pass.length>5){
            setPassLengthErr(true)
            setUpdatedPassword(pass)
        }else{
            setPassLengthErr(false)
            setUpdatedPassword("")
        }
    }


  return (
    <>
    <Modal show={showUpdateUserModal} onHide={handleOpenUpdateUserModal} centered animation={false} className="rounded-0">
        <Modal.Header closeButton>Update your profile</Modal.Header>
        <Modal.Body>
            <input type="text" maxLength={30} defaultValue={user.name} className='form-control my-3' onChange={e=>{setUpdatedName(e.target.value.trim())}} />
            <input type="mail" maxLength={41} defaultValue={user.mail} className='form-control my-3' onChange={e=>{setUpdatedMail(e.target.value.trim())}} />
            <div className='input-group my-3'>
                <input type={showPassword?"text":"password"} placeholder="Enter old password" className='form-control' onChange={e=>{setOldPassword(e.target.value.trim())}} />
                <span className="input-group-text" onClick={handleShowPassword}>
                    {
                        showPassword===false?<AiOutlineEyeInvisible />:<AiOutlineEye />
                    }
                </span>
            </div>
            <div className='input-group my-3'>
                <input type={showPassword?"text":"password"} placeholder="Update password" className='form-control' onChange={handleSetUpdatedPass} />
                <span className="input-group-text" onClick={handleShowPassword}>
                    {
                        showPassword===false?<AiOutlineEyeInvisible />:<AiOutlineEye />
                    }
                </span>
            </div>
            {
                passLengthErr!==null?<span className={`text-${passLengthErr===true?"success":"danger"}`}>{passLengthErr===true?"Look's good":"Enter at lease 6 characters password"}</span>:null
            }
        </Modal.Body>
        <Modal.Footer>
            <Button variant='secondary' size='sm' className="rounded" onClick={handleOpenUpdateUserModal}>Cancel</Button>
            <Button variant='success' size='sm' className="rounded" onClick={handleUpdateUser}>Update</Button>
        </Modal.Footer>
    </Modal>
    <Modal show={showCreateUserModal} onHide={handleOpenCreateUserModal} centered animation={false} className="rounded-0">
        <Modal.Header closeButton>Create a new User</Modal.Header>
        <Modal.Body>
            <input type="text" placeholder='Enter name' className='form-control my-3' onChange={e=>{setCreateUserName(e.target.value.trim())}} />
            <input type="mail" placeholder='Enter mail' className='form-control my-3' onChange={e=>{setCreateUserMail(e.target.value.trim())}} />
            <div className='input-group my-3'>
                <input type={showPassword?"text":"password"} placeholder="Enter password" className='form-control' onChange={e=>{setCreateUserPassword(e.target.value.trim())}} />
                <span className="input-group-text" onClick={handleShowPassword}>
                    {
                        showPassword===false?<AiOutlineEyeInvisible />:<AiOutlineEye />
                    }
                </span>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='secondary' size='sm' className="rounded-0" onClick={handleOpenUpdateUserModal}>Cancel</Button>
            <Button variant='success' size='sm' className="rounded-0" onClick={handleCreateNewUser}>Create</Button>
        </Modal.Footer>
    </Modal>
    <div style={{height: '100vh',width:"215px",position: 'relative',background:"linear-gradient(180deg, #17AC8C 28.87%, #2DC9D8 100%)"}} className="g-custom-primary">
        <div className='d-flex justify-content-center py-3'>
            <img src='/images/3dam_white_logo.png' style={{width: '100%',height: 'auto'}} />
        </div>
        <ul className='sidebar'>
            <li>
                <Link to="/home" className={`${path==="home"?"sidebar-active":""}`}>
                    <img src="/images/home-icon.png" style={{fonWeight: 'bolder',fontSize:"20px",marginRight:"10px"}} />
                    Home
                </Link>
            </li>
            <li>
                <Link to="/asset-list" className={`${path==="asset-list"?"sidebar-active":""}`}>
                    <FaListUl style={{fonWeight: 'bolder',fontSize:"20px",marginRight:"10px"}} />
                    Asset List
                </Link>
            </li>
            <li>
                <Link to="/registration/individual" className={`${path==="mass"||path==="individual"?"sidebar-active":""}`}>
                    <img src='/images/regist.png' height="22px" style={{marginRight: '5px'}} />
                    Model Registration
                </Link>
            </li>
            <li>
                <Link to="/create-model" className={`${path==="create-model"?"sidebar-active":""}`}>
                    <img src='/images/create.png' height="22px" style={{marginRight: '5px'}} />
                    Create Model
                </Link>
            </li>
        </ul>
        <div className="d-flex w-100 justify-content-between align-items-center" style={{position: 'absolute', bottom: '30px'}}>
            <p className="fs-5 py-0 text-white text-bold px-1 d-flex align-items-center"><FaUserCircle style={{fontSize:"30px",marginRight: '5px'}} />{user.name?`${user.name.length>5?user.name.slice(0,5):user.name}...`:null}</p>
            <Dropdown as={ButtonGroup}>
            <Button variant="success" className="text-white border-0" style={{background:"rgb(255,255,255,0.3)"}}>Action</Button>

            <Dropdown.Toggle split variant="success" className="text-white border-0" style={{background:"rgb(255,255,255,0.3)"}} id="dropdown-split-basic" />

            <Dropdown.Menu>
                <Dropdown.Item href="" onClick={()=>{
                sessionStorage.removeItem("loggedin")
                sessionStorage.removeItem("token")
                sessionStorage.removeItem("_id")
                sessionStorage.removeItem("_name")
                navigate("/")
                }}><span>Logout</span><MdLogout style={{marginLeft:"5px",fontSize: '15px'}} /></Dropdown.Item>
                <Dropdown.Item href="" onClick={handleOpenUpdateUserModal}>Update me</Dropdown.Item>
                <Dropdown.Item href="" onClick={handleDeleteAccount}>Delete Account</Dropdown.Item>
            </Dropdown.Menu>
            </Dropdown>
        </div>
    </div>
    </>
  )
}
