import React, { useEffect, useState,useContext } from 'react'
import { Col, Row, Modal, Spinner } from 'react-bootstrap'
import { AiOutlineUnorderedList, AiOutlineSearch, AiOutlineClose } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import AssetListTable from '../compoents/asset-list/AssetListTable'
import Layot from '../compoents/Layot'
import DetailInfo from '../compoents/asset-list/DetailInfo'


import axios from 'axios'
import URL from '../api/Routes'
import { MdDone } from 'react-icons/md'
import { ErrorToast, WarningToast } from '../compoents/toast-alert/SuccessToast'
import Swal from 'sweetalert2'
import { TypeContext } from '../contexts/typeContext'

export default function AssetList() {
    const [registrationModalOpen, setRegistrationModalOpen] = useState(false)
    const [typeListModalOpen, setTypeListModalOpen] = useState(false)
    const [selectedModelToPreview, setSelectedModelToPreview] = useState({selected: false, data: {}});

    const [registerTypeName, setRegisterTypeName] = useState("");
    const [typeDeleteMessage, setTypeDeleteMessage] = useState(null);
    const {typeList, setUpdatedTypeList} = useContext(TypeContext)
    const [typeDeleteLoading, setTypeDeleteLoading] = useState(false)

    const [typeUpdateAble, setTypeUpdateAble] = useState({name: "",id:null, open: false});
    const [updatedType, setUpdatedType] = useState("")

    const [searchKeyword, setSearchKeyword] = useState("")


    const [totalModel, setTotalModel] = useState(0)
    const [data, setData] = useState({success:false,dataLoading:true, data:[]});


    const updateType = () => {
        const uri = URL+`/type/update/${typeUpdateAble.id}`
        if(updatedType.trim()!=="" && typeUpdateAble.name!==updatedType.trim()){
            const typeName = updatedType.charAt(0).toUpperCase()+updatedType.slice(1);
            let available = false
            typeList.data.map(prevItem=>{
                if(prevItem.name === typeName){
                    available = true
                }
            })
            if(available===true){
                WarningToast(`${typeName} is already exist!`)
            }else{
                const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
                axios.put(uri,{newType:typeName,previousType:typeUpdateAble.name},header).then(res=> {
                    if(res.status === 200 && res.data.success === true) {
                        setUpdatedTypeList({error:false,data:res.data.data})
                        getAllAsset(0,10,"All")
                        setTypeUpdateAble({name:"",id:null,open:false})
                    }
                }).catch(error=>{
                    ErrorToast("Failed to update!")
                })
            }

        }else{
            alert("please update the type")
        }
    }

    const getAllAsset = async (currentPage,rowPerPage,currentType) => {
        const uri = URL+`/asset/get-model-by/${currentPage}/${rowPerPage}/${currentType}`;
        await axios.get(uri).then(res=> {
            if(res.status === 200 && res.data.success === true && res.data.data.length>0) {
                setData({success: true,dataLoading:false, data: res.data.data});
                setTotalModel(res.data.totalModel)
            }else{
                setData({success: false,dataLoading:false, data: []});
            }
        }).catch(error=> {
            setData({success: false,dataLoading:false, data: []});
        })
    }





   

    const getSearchResult = (searchKeyword,page,rowPerPage,setResult,setTotal) => {
        if(searchKeyword!==""){
            axios.get(URL+`/asset/search-by-keyword/${searchKeyword}/${page}/${rowPerPage}`).then(res=>{
                console.log("search response: ",res.data)
                if(res.status === 200 && res.data.success === true) {
                    setResult({success:true, data:res.data.data})
                    setTotal(res.data.totalModel)
                }

            }).catch(err=>{
                console.log('search error: ',err)
            })
        }else{
        }
    }
    const handleSearchModel =  () => {
        if(searchKeyword!==""){
            getSearchResult(searchKeyword,0,10,setData,setTotalModel);
        }
    }
    
    useEffect(() => {
        getAllAsset(0,10,"All")
    }, [])

    useEffect(()=>{

    },[data])

    const handleOpenTypeRegistrationModal = () => {
        setRegistrationModalOpen(true)
    }
    
    const handleTypeListModalOpen = () => {
        setTypeListModalOpen(true)
    }

    
    const handleOpenTypeRegistrationModalClose = () => {
        setRegistrationModalOpen(false)
    }


    const handleTypeListModalClose = () => {
        setTypeListModalOpen(false)
    }
    const addNewType = async (e) => {
        if(registerTypeName!==undefined && registerTypeName!==null && registerTypeName!==""){
            const uri = URL+"/type/register"

            const typeName = registerTypeName.charAt(0).toUpperCase()+registerTypeName.slice(1);

            let available = false
            typeList.data.map(prev=>{
                if(prev.name===typeName){
                    available = true
                }
            })

            if(available===false){
                const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
                await axios.post(uri,{type:[{name: typeName}]},header).then(res=>{
                    if(res.status === 200 && res.data.success === true) {
                        setUpdatedTypeList({error:false,data:res.data.data})
                        setTypeListModalOpen(true)
                        setRegistrationModalOpen(false)
                    }else{
                        ErrorToast("Failed to register the type!")
                    }
                }).catch(error=>{
                    ErrorToast("Failed to register the type!")
                    setRegistrationModalOpen(false)
                })
            }else{
                WarningToast(`${typeName} is already registered!`)
            }
        }else{
            ErrorToast("Please enter the type name!")
        }
    }

    const handleDeletType = (id,type) =>  {
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
                setTypeDeleteLoading(true)
                const uri = URL+`/type/delete/${type}/${id}`;
                const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
                axios.delete(uri,header).then(res=>{
                    setTypeDeleteLoading(false)
                    if(res.status === 200 && res.data.success === true) {
                        setTypeDeleteMessage({success: true,  message:"Type deleted successfully"});
                        setUpdatedTypeList({error:false,data:res.data.data})
                        getAllAsset(0,10,"All");
                        setTimeout(() => {
                            setTypeDeleteMessage({success: false,  message:""});
                        }, 2000);
                    }else{
                        setTypeDeleteMessage({success: false, message: "Failed to delete"});
                        setTimeout(() => {
                            setTypeDeleteMessage({success: false,  message:""});
                        }, 2000);
                    }
                }).catch(error=> {
                    setTypeDeleteMessage({success: false, message: "Failed to delete"});
                    setTimeout(() => {
                        setTypeDeleteMessage({success: false,  message:""});
                    }, 2000);
                })
            }
          })
    }
    
    

  
    if(data.dataLoading===true) {
        return <Layot>
            <div className='d-flex justify-content-center align-items-center' style={{height: '100vh'}}>
                <Spinner size="lg" animation="border" />
            </div>
        </Layot>
    }
    else if(data.dataLoading===true && data.success === false) {
        return <Layot>
            <div className='d-flex justify-content-center pt-5 text-danger' style={{height: '100vh'}}>
            <div className='text-center'>
                <img src='/images/no-data-found.PNG' style={{height: '300px'}} />
                <h4 style={{color: '#969696'}}>Please check your connection!</h4>
            </div>
            </div>
        </Layot>
    }

  return (
    <>
       <Modal
         show={registrationModalOpen}
         onHide={handleOpenTypeRegistrationModalClose}
         animation={false}
         centered
        >
            <Modal.Header closeButton>
                <h5>Type Info Registration</h5>
            </Modal.Header>
            <Modal.Body>
              <input type="text" onChange={e=>setRegisterTypeName(e.target.value.trim())} className='w-100 form-control' />
            </Modal.Body>
            <Modal.Footer>
                <div className='d-flex justify-content-center w-100'>
                    <div className='d-inline'>
                        <button className='btn rounded-4px btn-secondary mx-1' onClick={handleOpenTypeRegistrationModalClose}>Cancel</button>
                        <button 
                        className='btn rounded-4px btn-secondary bg-custom-secondary text-white mx-1'
                        onClick={addNewType}
                        disabled={registerTypeName.trim()===""?true:false}
                        style={{cursor:registerTypeName.trim()===""?"no-drop":"default"}}
                        >Registration</button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
        {/* Type list modal */}
        <Modal
         show={typeListModalOpen}
         onHide={handleTypeListModalClose}
         animation={false}
         centered
        >
            <Modal.Header closeButton>
                <h5>Type List</h5>
            </Modal.Header>
            <Modal.Body className="px-0 pb-0 mb-0">
              <div style={{position:"relative"}}>
                {
                    typeDeleteLoading===true?<div style={{background:"rgb(0,0,0,0.1)",height:"100%",width:"100%",position:"absolute",left:"0",top:"0",textAlign:"center",paddingTop:"50px"}}>
                    <Spinner size="md" animation="border" />
                </div>:null
                }
                <table className='table text-center pb-b mb-0'>
                    <thead className='bg-light border-bottom'>
                        <tr>
                            <th className="py-2">No</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Management</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            typeList.data.length>0 && typeList.error!==true?<>{typeList.data.map((item,i)=><tr key={i}>
                                <td style={{width:'20%'}}>{i+1}</td>
                                <td style={{width: '50%', textAlign: 'center'}}>
                                    {typeUpdateAble.open===true && typeUpdateAble.name === item.name?<div className="d-flex"><input type="text" defaultValue={item.name} className="form-control text-center form-control-sm" onChange={e=>{setUpdatedType(e.target.value)}} />                                        
                                    <div className='d-flex'>
                                        <button className='btn btn-sm btn-transparent bg-ligght border-0 outline-0 text-success' onClick={updateType}><MdDone /></button>
                                        <button className='btn btn-sm btn-transparent bg-ligght border-0 outline-0 text-danger' onClick={()=>setTypeUpdateAble({name:"",id:null, open:false})}><AiOutlineClose /></button>
                                    </div></div>:<><span>{item.name}</span><button className='border-0 bg-transparent px-3' onClick={()=>setTypeUpdateAble({name:item.name,id:item._id, open:true})}>
                                        <FiEdit />
                                    </button></>}
                                </td>
                                <td  style={{width:'30%'}}><button className="btn btn-secondary rounded-4px py-1" onClick={handleDeletType.bind(this, item._id,item.name)}>delete</button></td>
                            </tr>)}</>:<>{typeList.error === true ? <div className='text-center text-danger'>Network error</div>:<tr>
                                <td></td>
                                <td>No type is registered</td>
                                <td></td>
                            </tr>}</>
                        }
                    </tbody>
                </table>
              </div>
            </Modal.Body>
            <Modal.Footer>
            {typeDeleteMessage!==null?
                    <span className={`text-${typeDeleteMessage.success === true?"success":"danger"}`}>{typeDeleteMessage.message}</span>
            :null}
            <span className='my-1 text-italic w-100 text-center' style={{color: '#969696'}}>Deleting a type will delete all corresponding models</span>
            </Modal.Footer>
        </Modal>
    <Layot>
        <Row  style={{margin: '0',padding: '0'}}>
            <Col lg={data.data.length>0?7:12} style={{margin: '0',padding:'0'}}>
                <div className='border rounded'>
                    <div className='border-bottom p-3'>
                        <h4>Asset List</h4>
                    </div>
                    <div className="p-3">
                        <div className="styeld-left-border">
                            <div className='p-2 d-flex align-items-center border-bottom'>
                                <h6 className="px-3 text-bold d-md-block d-none">Type</h6>
                                <button className='border-0 rounded-4px bg-custom-secondary text-white py-1 px-3' onClick={handleOpenTypeRegistrationModal}>Type Registration</button>
                                <button onClick={handleTypeListModalOpen} className='border-0 rounded-4px bg-custom-secondary text-white py-1 px-3 mx-3'>
                                    <AiOutlineUnorderedList />
                                      <span className='mx-1'>Type List</span>
                                    </button>
                            </div>
                            { 
                                data.data.length>0?<div className='p-2 d-flex align-items-center border-bottom'>
                                <h6 className="d-md-block d-none px-3 text-bold">Search</h6>
                                <div className="d-flex mx-3">
                                    <input type="text" onChange={e=>{setSearchKeyword(e.target.value.trim())}} placeholder="search..." className="search-box form-control form-control-sm" />
                                    <button className='btn btn-sm btn-primary bg-custom-secondary text-white rounded-end' onClick={handleSearchModel}><AiOutlineSearch /></button>
                                </div>
                            </div>:null
                            }
                        </div>
                    </div>
                    <AssetListTable defaultRowPerPage={10} rowDeletable={true} management={true} selectableRowsSingle={false} pageRangeDisplayed={5} marginPagesDisplayed={5} typeList={typeList} getSearchResult={getSearchResult} searchKeyword={searchKeyword} getAllAsset={getAllAsset} data={data} setData={setData} totalData={totalModel} setTotalModel={setTotalModel} setSelectedModelToPreview={setSelectedModelToPreview} />
                </div>
            </Col>
            <Col lg={data.data.length>0?5:0} className={`p-0 ${data.data.length>0?"d-block":"d-none"}`}>
                {
                    selectedModelToPreview.selected===true?<div>
                        {<DetailInfo defaultModel={selectedModelToPreview.data} />}
                    </div>:<div>
                        {data.data.length>0?<DetailInfo defaultModel={data.data[0]} />:<div className='text-center py-5'>No model registered</div>}
                    </div>
                    
                }
            </Col>
        </Row>
    </Layot>
    </>
  )
}
