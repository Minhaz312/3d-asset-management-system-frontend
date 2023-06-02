import React, {useState, useContext} from 'react'
import { Col, Modal, Row } from 'react-bootstrap'
import URL from '../api/Routes'
import Layot from './../compoents/Layot'

import { SuccessToast, ErrorToast } from '../compoents/toast-alert/SuccessToast'
import axios from 'axios'
import { TypeContext } from '../contexts/typeContext'
import { useEffect } from 'react'

export default function Home() {


    const {typeList, setUpdatedTypeList} = useContext(TypeContext)

    const [openUserReqModal, setOpenUserReqModal] = useState(false)
    const [openUserAccModal, setOpenUserAccModal] = useState(false)
    const [totalModel, setTotalModel] = useState(0)

    const [allUserList, setAllUserList] = useState({error:false, data:{approvedUser:[],requestedUser:[]}});
    const [mapUrl, setMapUrl] = useState(process.env.REACT_APP_MAP_VIEW_URL)
    const getAllUser = () => {
        const uri = URL+"/user/get/all";
        const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
        axios.get(uri,header).then(res=> {
            if(res.status === 200 && res.data.success === true) {
                setTotalModel(res.data.data.totalModel)
                setAllUserList({error: false, data: {approvedUser:res.data.data.approvedUser,requestedUser:res.data.data.requestedUser}});
            }else{
                setAllUserList({error: true, data: []});
            }
        }).catch(error=> {
            setAllUserList({error: true, data: []});
        })
    }

    const handleOpenUserReqModal = () => {
        if(openUserReqModal===true) {
            setOpenUserReqModal(false)
        }else{
            setOpenUserReqModal(true)
        }
    }
    
    const handleUserAccModal = () => {
        if(openUserAccModal===true) {
            setOpenUserAccModal(false)
        }else{
            setOpenUserAccModal(true)
        }
    }

   

    const handleUserApprove = (id,mail) => {
        const uri = URL+"/user/approve"
        const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
        axios.put(uri,{data:{id:id,mail:mail}},header).then(res=>{
            if(res.status === 200 && res.data.success === true) {
                SuccessToast("User approved.")
                getAllUser()
            }else{
                ErrorToast("Failed to approve user!")
            }
        }).catch(err=>{
            ErrorToast("Failed to approve user!")
        })
    }
    const handleUserReqReject = (id) => {
        const uri = URL+`/user/delete/${id}`
        const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
        axios.delete(uri,header).then(res=>{
            if(res.status === 200 && res.data.success === true) {
                SuccessToast("User Request Rejected.")
                getAllUser()
            }else{
                ErrorToast("Failed to reject!")
            }
        }).catch(err=>{
            ErrorToast("Failed to reject!")
        })
    }


 useEffect(()=>{
    getAllUser()
 },[])

  return (
    <>
        <Modal
         show={openUserAccModal}
         onHide={handleUserAccModal}
         animation={false}
         size="lg"
         centered
        >
            <Modal.Header closeButton>
                <h5>User Account List</h5>
            </Modal.Header>
            <Modal.Body className="pb-0">
              <table className="table pb-0 mb-0 text-center">
                <thead className='bg-custom-secondary text-white'>
                    <tr>
                        <th>Name</th>
                        <th>Mail</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        allUserList.data.approvedUser.map((user,i)=>
                            <tr key={i}>
                                <td>{user.name}</td>
                                <td>{user.mail}</td>
                            </tr>
                        )
                    }
                </tbody>
              </table>
            </Modal.Body>
            <Modal.Footer>
                <button className='btn rounded-4px btn-secondary mx-1' onClick={handleUserAccModal}>Close</button>
            </Modal.Footer>
        </Modal>
        <Modal
         show={openUserReqModal}
         onHide={handleOpenUserReqModal}
         animation={false}
         centered
         size="lg"
        >
            <Modal.Header closeButton>
                <h5>User Account Request List</h5>
            </Modal.Header>
            <Modal.Body className="pb-0">
                {
                    allUserList.data.requestedUser.length>0?<table className="table pb-0 mb-0 text-center">
                    <thead className='bg-custom-secondary text-white'>
                        <tr>
                            <th>Name</th>
                            <th>Mail</th>
                            <th>Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            allUserList.data.requestedUser.map((user,i)=><tr key={i}>
                                <td>{user.name}{sessionStorage.getItem("_name")===user.name?"(me)":null}</td>
                                <td>{user.mail}</td>
                                <td className='d-flex justify-content-center'>
                                    <button className="btn btn-sm btn-success"  onClick={handleUserApprove.bind(this, user._id, user.mail)}>Approve</button>
                                    <button className="btn btn-sm btn-danger" onClick={handleUserReqReject.bind(this,user._id)}>Delete</button>
                                </td>
                            </tr>)
                        }
                    </tbody>
                  </table>:<h5 className="text-center my-3 text-muted">No request available</h5>
                }
              
            </Modal.Body>
            <Modal.Footer>
                <button className='btn rounded-4px btn-secondary mx-1' onClick={handleOpenUserReqModal}>Close</button>
            </Modal.Footer>
        </Modal>
        
        <Layot>
        <div style={{height:"84vh",width:"100%"}} className="bg-dark text-white">
                {/* <iframe src={mapUrl} width="100%" height="100%" id="ifr" ></iframe> */}
                <img src="/images/map.png" width="100%" height="100%" />
            </div>
            <Row className="px-1 my-1">
                <Col md={3} className="p-1">
                    <div style={{height: '120px'}} className="d-flex justify-content-center align-items-center fs-5 bg-white shadow-sm border">
                        <div className='text-center'>
                            <p className='mb-0'>Model registered</p>
                            <p className="font-weight-bold fs-3">{totalModel}</p>
                        </div>
                    </div>
                </Col>  
                <Col md={3} className="p-1">
                    <div style={{height: '120px'}} className="d-flex justify-content-center align-items-center fs-5 bg-white shadow-sm border">
                        <div className='text-center'>
                            <p className='mb-0'>Type registered</p>
                            <p className="font-weight-bold fs-3">{typeList.data.length}</p>
                        </div>
                            </div>
                </Col>
                <Col md={3} className="p-1">
                    <div style={{height: '120px'}} className="d-flex justify-content-center align-items-center fs-5 bg-white shadow-sm border">
                        <div className='text-center'>
                            <div className='text-center'>
                                <p className='mb-0'>Account registered</p>
                                <p className="font-weight-bold mb-0 fs-3">{allUserList.data.approvedUser.length}</p>
                            </div>
                            <button className='btn btn-sm btn-primary mt-0 bg-custom-secondary text-white' onClick={handleUserAccModal}>view</button>
                        </div>
                    </div>
                </Col>
                <Col md={3} className="p-1">
                    <div style={{height: '120px'}} className="d-flex justify-content-center align-items-center fs-5 bg-white shadow-sm border">
                        <div className='text-center'>
                            <div className='text-center'>
                                <p className='mb-0'>Account request</p>
                                <p className="font-weight-bold mb-0 fs-3">{allUserList.data.requestedUser.length}</p>
                            </div>
                            <button className='btn btn-sm btn-primary mt-0 bg-custom-secondary text-white' onClick={handleOpenUserReqModal}>view</button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Layot>
    </>
  )
}
