import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import URL from '../api/Routes';
import { ErrorToast, SuccessToast, WarningToast } from '../compoents/toast-alert/SuccessToast';
import { UserContext } from '../contexts/userContext';

export default function Login() {

    const {user,updateUser} = useContext(UserContext)


    const [mail, setMail] = useState("");
    const [mailValid, setMailValid] = useState(null);
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(null)

    const navigate = useNavigate()
    useEffect(()=> {
        if(sessionStorage.getItem("loggedin")==="true" && sessionStorage.getItem("token")!=="null") {
            navigate("/home")
        }
    },[])

    const mailValidation = (mail) => {
        if((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))){
            return true;
        }else{
            return false
        }
    }

    const handleMailChange = e =>{
        let usermail = e.target.value;
        if(mailValidation(usermail.trim())){
            setMail(usermail);
            setMailValid(true)
        }else{
            setMailValid(false)
            setMail("")
        }
    }

    const handleSetMail = e => {
    }

    const handlePasswordChange = e =>{
        setPassword(e.target.value.trim())
    }
    const handleLogin = async () =>{
        setLoading(true)
        const uri = URL+"/user/login";
        await axios.post(uri,{mail:mail,password:password}).then(res=> {
            setLoading(false)
            if(res.status === 200 && res.data.success === true) {
                sessionStorage.setItem("loggedin",true)
                sessionStorage.setItem("token",res.data.token)
                sessionStorage.setItem("_id",res.data.data.id)
                sessionStorage.setItem("_name",res.data.data.username)
                updateUser({id:res.data.data.id,username:res.data.data.username,mail:res.data.data.mail,loggedIn:true})
                SuccessToast("Logged in successfully!")
                navigate("/home",{replace: true})
            }else{
                ErrorToast("Failed to logged in!")
                sessionStorage.setItem("_id",null)
                sessionStorage.setItem("_name",null)
                sessionStorage.setItem("loggedin",false)
                sessionStorage.setItem("token",null)
            }
        }).catch(err=>{
            setLoading(false)
            ErrorToast(err.response.data.message)
            sessionStorage.setItem("_id",null)
            sessionStorage.setItem("_name",null)
            sessionStorage.setItem("loggedin",false)
            sessionStorage.setItem("token",null)
        })
    }


  return (
    <>
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
    <div className='login-page' style={{height: '100vh',overflow:'hidden !important'}}>
        <div className="overlay">
        </div>
    </div>
        <div className='d-flex w-100 justify-content-center align-items-center' style={{height: '100vh'}}>
            <div className='bg-light rounded shadow-lg p-3' style={{height: '500px',width: '550px'}}>
                <h2 className='m-5 pb-3 border-bottom text-center'>3D Asset Management</h2>
                <input type="text" onChange={handleMailChange} className='bg-white shadow-sm form-control form-control-lg mt-3 py-2' placeholder='Enter mail' />
                {
                    mailValid!==null?<>
                        {mailValid===false?<span className='text-danger mx-1'>Mail is not valid</span>:<span className='text-success mx-1'>Valid mail</span>}
                    </>:null
                }
                <input type="password" onChange={handlePasswordChange} className='bg-white shadow-sm form-control form-control-lg mt-3 py-2' placeholder='password' />
                <button onClick={handleLogin} disabled={mail===""||password===""?true:false} className='btn btn-primary bg-custom-secondary w-100 mt-5 mb-3'>{loading===true?<Spinner size="sm" animation="border" />:"LOGIN"}</button>
                <p className="text-center">
                    <Link to="/create-account" className='text-muted fs-5 text-decoration-none'>Create Account</Link>
                </p>
            </div>
        </div>
    </>
  )
}
