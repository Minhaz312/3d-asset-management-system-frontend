import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import URL from '../api/Routes';
import { ErrorToast, SuccessToast } from '../compoents/toast-alert/SuccessToast';

export default function Signup() {

    const [name, setName] = useState("");
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("")


    const [mailValid,setMailValid] = useState(null)
    const [passLengthErr,setPassLengthErr] = useState(null)
    const [passMatched,setPassMatched] = useState(null)


    const navigate = useNavigate()
    useEffect(()=> {
        if(sessionStorage.getItem("loggedin")==="true" && sessionStorage.getItem("token")!=="null") {
            navigate("/asset-list")
        }
    },[])

    const mailValidation = (mail) => {
        if((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))){
            return true;
        }else{
            return false
        }
    }

    const handleCreateUser = () =>{
        if(name!=="" && mail!=="" && password!=="" && passMatched===true && mail.length<41 && name.length<31){
            const uri = URL+"/user/create";
            axios.post(uri,{name:name,mail:mail,password:password}).then(res=> {
                if(res.status === 200 && res.data.success === true) {
                    SuccessToast("Account created, login please.")
                    setTimeout(()=>{
                        navigate("/",{replace: true})
                    },[2000])
                }else{
                    ErrorToast("Failed to create account!")
                }
            }).catch(err=>{
                ErrorToast(err.response.data.message)
            })

        }else{
            ErrorToast("Enter valied information!")
        }
    }

    const handleSetMail = e => {
        let usermail = e.target.value;
        if(mailValidation(usermail.trim())){
            setMail(usermail);
            setMailValid(true)
        }else{
            setMailValid(false)
            setMail("")
        }
    }
    const handleSetPassword = e => {
        let pass = e.target.value.trim();
        if(pass.length>5){
            setPassLengthErr(true)
            setPassword(pass)
        }else{
            setPassLengthErr(false)
            setPassword("")
        }
    }

    const handleCheckReEnterPass = e => {
        if(e.target.value.trim()===password) {
            setPassMatched(true)
        }else{
            setPassMatched(false)
        }
    }

    return (
        <div>
        <ToastContainer 
                position="top-center"
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
            <div className='overlay'></div>
        </div>
        <div className='p-relative d-flex justify-content-center align-items-center' style={{height: '100vh'}}>
                <div className='bg-light rounded shadow-lg p-3' style={{height: '550px',width: '550px'}}>
                    <h2 className='mx-5 my-3 pb-3 border-bottom text-center'>CREATE ACCOUNT</h2>
                    <input type="text" maxLength={30} onChange={e=>setName(e.target.value.trim())} className='bg-white shadow-sm form-control form-control-lg mt-3 py-2' placeholder='Enter Name' />
                    <span>
                    <input type="mail" maxLength={40} onChange={handleSetMail} className='bg-white shadow-sm form-control form-control-lg mt-3 py-2' placeholder='Enter Mail' />
                    {
                        mailValid!==null?<span className={`text-${mailValid===true?"success":"danger"}`}>{mailValid===true?"Look's good":"Enter valid mail"}</span>:null
                    }
                    </span>
                    <span>
                    <input type="password" onChange={handleSetPassword} className='bg-white shadow-sm form-control form-control-lg mt-3 py-2' placeholder='Enter Password' />
                    {
                        passLengthErr!==null?<span className={`text-${passLengthErr===true?"success":"danger"}`}>{passLengthErr===true?"Look's good":"Enter at lease 6 characters password"}</span>:null
                    }
                    </span>
                    <span>
                    <input type="password" onChange={handleCheckReEnterPass} className='bg-white shadow-sm form-control form-control-lg mt-3 py-2' placeholder='Enter Password' />
                    {
                        passMatched!==null?<span className={`text-${passMatched===true?"success":"danger"}`}>{passMatched===true?"There you go":"Password not matched!"}</span>:null
                    }
                    </span>
                    <button onClick={handleCreateUser} disabled={mail===""||password===""?true:false} className='btn btn-primary bg-custom-secondary w-100 mt-3 mb-3'>CREATE</button>
                    <p className="text-center">
                        <Link to="/" className='text-muted fs-5 text-decoration-none'>Login your account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
