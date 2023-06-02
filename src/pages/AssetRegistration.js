import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Form, Spinner } from 'react-bootstrap';
import { BsUpload } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import Layot from '../compoents/Layot'
import axios from 'axios'
import URL from '../api/Routes';
import Viewer from '../compoents/3d/3DViewer';
import { ErrorToast, SuccessToast, WarningToast } from '../compoents/toast-alert/SuccessToast';
import Swal from 'sweetalert2';
import { UserContext } from '../contexts/userContext';

export default function AssetRegistration() {

    const navigate = useNavigate()

    const [typeList, setTypeList] = useState(null)

    const {user} = useContext(UserContext)

    const [address, setAddress] = useState("");
    const [complexNumber, setComplexNumber] = useState("");
    const [modelNames, setModelNames] = useState([]);
    const [longitude, setLongitude] = useState("128.0");
    const [latitude, setLatitude] = useState("37.0");
    const [altitude, setAltitude] = useState("0");
    const [height, setHeight] = useState("0");
    const [heading, setHeading] = useState("90");
    const [pitch, setPitch] = useState("0");
    const [roll, setRoll] = useState("0");
    const [scale, setScale] = useState("1");
    const [type, setType] = useState("");
    const [resolution, setResolution] = useState("");
    const [unique,setUnique] = useState(false)
    const [filename, setFilename] = useState("")
    const [modelFile, setModelFile] = useState(null);
    const [modelFileFormData, setModelFileFormData] = useState(null);
    const [modelJsonDataFile, setModelJsonDataFile] = useState(null);
    const [uploadedJsonFileDataUrl, setUploadedJsonFileDataUrl] = useState(null)
    const [templateName, setTemplateName] = useState(null)

    const [singleModelUploaded, setSingleModelUploaded] = useState({success:false,filename:null, message:null})

    const [registerStarted, setRegisterStarted] = useState(false)

    const [modelExist, setModelExist] = useState(false)





    const getAllType = async () => {
        const uri = URL+"/type/get/all";
        const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
        await axios.get(uri,header).then(res=> {
            if(res.status === 200 && res.data.success === true) {
                setTypeList({error: false, data: res.data.data});
            }else{
                setTypeList({error: true, data: []});
            }
        }).catch(error=> {
            setTypeList({error: true, data: []});
        })
    }

    useEffect(()=>{
        getAllType()
    },[])

    useEffect(()=>{

    },[modelExist,resolution])



    const handleRegisterNewModel = async () => {

        if(address!=="" && complexNumber!=="" && latitude!=="" && longitude!=="" && altitude!=="" && heading!=="" && pitch!=="" && roll!=="" && height!=="" && scale!=="" && type!=="" && modelNames.length>0 && resolution!=="" && modelFileFormData!==null){
    
            if(modelFile===null) {
                WarningToast("Please upload the model glb file")
            }else{
                
                const data = {
                    user:user.id,
                    address,
                    complexNumber,
                    latitude,
                    longitude,
                    altitude,
                    heading,
                    pitch,
                    roll,
                    height,
                    scale,
                    type,
                    resolution:resolution,
                    unique,
                    modelNames,
                }
                const uri = URL+"/asset/register/single"
                const header = {headers:{"Content-Type":"multipart/form-data","Authorization":sessionStorage.getItem("token")}}
                setRegisterStarted(true)

                const formData = new FormData()
                const templateFormData = new FormData()

                formData.append("data",JSON.stringify(data))
                formData.append("singleModel",modelFile)
                
                templateFormData.append("templatefile",modelJsonDataFile)

                await axios.post(uri, formData,header).then(res=> {
                    setRegisterStarted(false)
                    console.log(res)
                    if(res.status === 200 && res.data.success === true) {
                        SuccessToast("Successfully registered!")
                            setAddress("");
                            setAltitude("")
                            setComplexNumber("")
                            setHeading("")
                            setPitch("")
                            setRoll("")
                            setLongitude("")
                            setLatitude("")
                            setScale("")
                            setHeight("")
                            setType("")
                            setFilename("")
                            setModelNames([])
                            setModelFile(null)
                            setModelFileFormData(null)
                            setModelJsonDataFile(null)
                            setTemplateName(modelJsonDataFile.name);
                            navigate("/registration/individual")
    
                        }else{
                            ErrorToast(res.data.message)
                        }
                }).catch(error=> {
                    console.log("error: ",error)
                    const errorMsg = error.response.data.message;
                    setRegisterStarted(false)
                    if(errorMsg){
                        ErrorToast(errorMsg)
                    }else{
                        ErrorToast("Failed to register!")
                    }
                })
    
            }

        }else{
            WarningToast("Please give all information!")
        }


    }

    const uploadModel = async (e) => {
        const file = e.target.files[0];
        const uri = URL+"/asset/upload-model/single"
        // const uri = URL+"/asset/store-model-in-db"


        const reader = new FileReader()

        reader.onload = e => {
        }

        reader.readAsBinaryString(file)
        
        
        setModelFile(file);
        
        const formData = new FormData();
        
        formData.append("singleModel",file);
        
        
        setModelFileFormData(formData)
        
        const header = {headers:{"Content-Type":"multipart/form-data","Authorization":sessionStorage.getItem("token")}}

        await axios.post(uri,formData,header).then(res=> {
            if(res.status === 200 && res.data.success === true) {
                setSingleModelUploaded({success:true, filename:file.name, message: res.data.message});
            }else{
                setSingleModelUploaded({success:false, filename:null, message: res.data.message})
            }
        }).catch(err=> {
            setSingleModelUploaded({success:false, filename:null, message: "Failed to upload model"})
        })

    }


    const checkModelExist = filename =>{
        axios.get(URL+`/asset/check-single-model-exist/${filename}`).then(res=>{
            if(res.status === 200 && res.data.success === true){
                setModelExist(res.data.exist);
            }
        }).catch(error=> {
        })
    }
    

    const uploadModelJsonData = e => {
        const file = e.target.files[0];

        let filenameArr = file.name.split(".")

        const fileExtn = filenameArr[filenameArr.length-1];


        if(fileExtn.toLowerCase() === "json"){
            setModelJsonDataFile(file)
    
            const reader = new FileReader();
            const readerAsDataUrl = new FileReader();
    
            reader.addEventListener("load",e=>{
                const uploadedData = JSON.parse(e.target.result)
    
                
                if(uploadedData.length>0){
                    let data = null;
    
                    if(uploadedData.length>1){
                        Swal.fire({
                            title: 'Want to use the first one?',
                            text: "May have multiple model data",
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Delete'
                          }).then((result) => {
                            if (result.isConfirmed) {
                                data = uploadedData[0]
                            }
                          })
                    }else{
                        data = uploadedData[0]
                    }
                        let validateType = false;
        
                        typeList.data.map(item=>{
                            if(item.name === data.modelType){
                                validateType = true;
                            }
                        })
                        let unique = null;
                        if(typeof data.unique === "string"){
                            if(data.unique.toLowerCase()==="y"){
                                unique = true;
                            }else{
                                unique = false;
                            }
                        }else {
                            unique = data.unique
                        }
            
                        if(validateType === true) {
            
                        setAddress(data.numberAddr);
                        setAltitude(data.fileMeta.altitude)
                        setComplexNumber(data.complex)
                        setHeading(data.fileMeta.orientation.heading)
                        setPitch(data.fileMeta.orientation.pitch)
                        setRoll(data.fileMeta.orientation.roll)
                        setLongitude(data.fileMeta.loc.coordinates[0])
                        setLatitude(data.fileMeta.loc.coordinates[1])
                        setScale(data.fileMeta.scale)
                        setHeight(data.fileMeta.height)
                        setType(data.modelType)
                        setResolution(data.resolution)
                        setFilename(data.fileMeta.fileNm)
                        setUnique(unique)
                        
                        checkModelExist(data.fileMeta.fileNm)
                        
                        
                        setModelNames(data.modelNm)
                        }else{
                            Swal.fire({
                                title: 'Do you want to register the type?',
                                text: `${data.modelType} is not registered`,
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Register'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                    const uri = URL+"/type/register"
                                    const typeName = data.modelType.charAt(0).toUpperCase()+data.modelType.slice(1);
                                    const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
                                    axios.post(uri,{type:[{name: typeName}]},header).then(res=>{
                                        if(res.status === 200 && res.data.success === true) {
                                            setFilename(data.fileMeta.fileNm)
                                            setAddress(data.numberAddr);
                                            setAltitude(data.fileMeta.altitude)
                                            setComplexNumber(data.complex)
                                            setHeading(data.fileMeta.orientation.heading)
                                            setPitch(data.fileMeta.orientation.pitch)
                                            setRoll(data.fileMeta.orientation.roll)
                                            setLongitude(data.fileMeta.loc.coordinates[0])
                                            setLatitude(data.fileMeta.loc.coordinates[1])
                                            setScale(data.fileMeta.scale)
                                            setHeight(data.fileMeta.height)
                                            setType(data.modelType)
                                            setResolution(data.resolution)
                                            setUnique(unique)
                                            
                                            checkModelExist(data.fileMeta.fileNm)
                                            getAllType()
                
                                            setModelNames(data.modelNm)
                                        }else{
                                            ErrorToast("failed to register the type")
                                        }
                                    }).catch(error=>{
                                        ErrorToast("failed to register the type")
                                    })
                                }
                              })
                        }
                    }else{
                        WarningToast("There is no data in uploaded file")
                    }
                // setCreateId(data.createId)
                // setUpdateId(data.updateId)
            })
            reader.readAsText(file)
            readerAsDataUrl.onload = e => {
                setUploadedJsonFileDataUrl(e.target.result)
            }
            readerAsDataUrl.readAsDataURL(file);
        }else{
            WarningToast("Upload a json file")
        }

    }


    const handleSetResolution = (e) => {
        let selectedItem = Number(e.target.value)
        setResolution(selectedItem)
    }
    const handleSetModelNames = (e) => {
        let value = e.target.value.trim();
        setModelNames(value.split(","))
    }
    return (
        <Layot>
            <div className='d-flex px-1 justify-content-between pr-3'>
                <Link to="/registration/mass" className='btn btn-secondary btn-sm bg-custom-secondary rounded-4px'>Mass Registration</Link>
                <div>
                    <button disabled={modelExist!==true && modelFileFormData===null?true:false} className='btn btn-secondary btn-sm bg-custom-secondary rounded-4px mx-1' onClick={handleRegisterNewModel}>{registerStarted===true?<Spinner size="sm" animation="border" />:"Save"}</button>
                </div>
            </div>
            <div className='border rounded mt-3'>
                <div className='border-bottom px-3 py-1 d-flex justify-content-between align-items-center'>
                    <h4>Registration</h4>
                    <a download="single-model-data.json" href={`/templates/single-model-data.json`} className={`btn d-flex align-items-center gap-3 border-0`}>
                        <p className="my-0">template file</p>
                        <img src="/images/template-file-icon.png" height="35px" />
                    </a>
                </div>
                <div className='mt-3 p-3 p-sm-0'>
                    <Row style={{margin: '0',padding: '0'}}>
                        <Col lg={6} md={12}>
                            <div className='bg-dark' style={{height: '100%',width: '100%',minHeight:"500px"}}>
                                
                                {
                                    modelFile!==null?<>
                                        <Viewer height="100%" width="100%" filelocation={`${process.env.REACT_APP_API_URL}/3d-models/${modelFile.name}`} />
                                    </>:<>
                                        <div style={{height:'100%',width:"100%",}} className="d-flex justify-content-center align-items-center">
                                        <h5 className={`text-${modelFile!==null?"danger":"light"} text-center mp-5`}>Upload the model file</h5>
                                        </div>
                                    </>
                                }

                            </div>
                        </Col>
                        <Col lg={6} mdm={12}>
                            <form encType='multipart/form-data' onSubmit={e=>e.preventDefault()}>
                        <table className='table text-center border'>
                <tbody>
                    <tr>
                        <td>Complex</td>
                        <td>
                            <Form.Select value={Number(complexNumber)} className="text-center" onChange={e=>setComplexNumber(Number(e.target.value))}>
                                <option>Select Complex</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </Form.Select>
                        </td>
                    </tr>
                    <tr>
                        <td>Model Name</td>
                        <td><input type="text" placeholder='Multiple model name separate by comma' value={modelNames} onChange={handleSetModelNames} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Address</td>
                        <td><input type="text" value={address} placeholder='Address' onChange={e=>setAddress(e.target.value)} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Latitude</td>
                        <td>
                            <div className='d-flex'>
                                <input type="number" value={latitude} onChange={e=>setLatitude(Number(e.target.value.trim()))} className='d-inline-block form-control form-control-sm text-center' />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Longitude</td>
                        <td>
                            <div className='d-flex'>
                                <input type="number" value={longitude} onChange={e=>setLongitude(Number(e.target.value.trim()))} className='d-inline-block form-control form-control-sm text-center' />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Altitude</td>
                        <td><input type="number" value={altitude} onChange={e=>setAltitude(Number(e.target.value.trim()))} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Height</td>
                        <td><input type="number" value={height} onChange={e=>setHeight(Number(e.target.value))} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Heading</td>
                        <td><input type="number" value={heading} onChange={e=>setHeading(Number(e.target.value))} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Pitch</td>
                        <td><input type="number" value={pitch} onChange={e=>setPitch(Number(e.target.value))} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Roll</td>
                        <td><input type="number" value={roll} onChange={e=>setRoll(Number(e.target.value))} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Scale</td>
                        <td><input type="number" value={scale} onChange={e=>setScale(Number(e.target.value))} className='form-control form-control-sm text-center' /></td>
                    </tr>
                    <tr>
                        <td>Type</td>
                        <td className='input-group'>
                            <Form.Select className="text-center" value={type} onChange={e=>setType(e.target.value)}>
                                <option>Select type</option>
                                {
                                    typeList!==null?typeList.data.map((item,i)=> <option key={i} value={item.name}>{item.name}</option>):null
                                }
                            </Form.Select>
                            <div className='mx-1'>
                                <button className={`btn btn-primary ${unique===true?"bg-success":"bg-custom-secondary"} text-white mx-1 rounded`} onClick={()=>{setUnique(!unique)}}>{unique===true?"Common":"Unique"}</button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Attach 3dAsset file</td>
                        <td>
                            <div className='d-flex'>
                                <span className={`d-inline-block form-control form-control-sm text-center pt-1 bg-light border-${modelFile===null && filename!==""?"danger":"light"} d-md-block d-none`}>{modelFile!==null?modelFile.name:`Attach ${filename!==""?filename:"3dAsset"} file`}</span>
                                <label role="button">
                                    <input type="file" className='d-none' value="" onChange={uploadModel} />
                                    <span className='btn btn-primary btn-sm rounded-4px bg-custom-secondary d-flex align-items-center'><div className='d-flex align-items-center' style={{height: '30px'}}>
                                            <BsUpload style={{height: '20px',width: 'auto'}} />
                                            <p  style={{width: '90px',margin: '0'}}>File Upload</p>
                                        </div>
                                    </span>
                                </label>
                            </div>
                                {
                                    modelFile===null && filename!==""?<span className='text-danger'>Upload the glb file</span>:null
                                }
                        </td>
                    </tr>
                    <tr>
                        <td>Image Quality</td>
                        <td className="d-flex">
                            <div className='input-group rounded-0 bg-light input-group-text'>
                                <span className="px-3 fs-5 font-weight-bolder">512 px</span>
                                {
                                    resolution===512?<input type="checkbox" name="512" className='form-check-input' checked value={512} onChange={handleSetResolution} style={{height: "25px",width: '25px'}}  />:
                                        <input type="checkbox" name="512" className='form-check-input' value={512} checked={false} onChange={handleSetResolution} style={{height: "25px",width: '25px'}}  />
                                }
                            </div>
                            <div className='input-group rounded-0 bg-light input-group-text'>
                                <span className="px-3 fs-5 font-weight-bolder">1024 px</span>
                                {
                                    resolution===1024?<input type="checkbox" name="1024" className='form-check-input' checked value={1024} onChange={handleSetResolution} style={{height: "25px",width: '25px'}}  />:
                                        <input type="checkbox" name="1024" className='form-check-input' value={1024} checked={false} onChange={handleSetResolution} style={{height: "25px",width: '25px'}}  />
                                }
                            </div>
                            <div className='input-group rounded-0 bg-light input-group-text'>
                                <span className="px-3 fs-5 font-weight-bolder">2048 px</span>
                                {
                                    resolution===2048?<input type="checkbox" name="2048" className='form-check-input' checked value={2048} onChange={handleSetResolution} style={{height: "25px",width: '25px'}}  />:
                                        <input type="checkbox" name="2048" className='form-check-input' checked={false} value={2048} onChange={handleSetResolution} style={{height: "25px",width: '25px'}}  />
                                }
                                
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            </form>
                        </Col>
                    </Row>
                </div>
                <div className="p-3">
                            <div className="styeld-left-border">
                                <div className='p-2 d-flex align-items-center border-bottom'>
                                    <h6 className="px-3 text-bold">Attach File</h6>
                                    <div className='d-flex'>
                                        <span className='fileupload-btn d-inline-block form-control form-control-sm text-center pt-1 bg-light d-md-block d-none'>Attach file</span>
                                        <label role="button">
                                            <input type="file" className='d-none' onChange={uploadModelJsonData} />
                                            <span className='btn btn-primary btn-sm rounded-4px bg-custom-secondary d-flex align-items-center'>
                                                <div className='d-flex align-items-center' style={{height: '30px'}}>
                                                    <BsUpload style={{height: '20px',width: 'auto'}} />
                                                    <p  style={{width: '90px',margin: '0'}}>File Upload</p>
                                                </div>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className='p-2 d-flex align-items-center border-bottom'>
                                    <h6 className="px-3 text-bold">Table Name</h6>
                                    <div className="d-flex mx-3">
                                        {modelJsonDataFile!==null?modelJsonDataFile.name:"upload the json file"}
                                    </div>
                                </div>
                            </div>
                        </div>
            </div>
        </Layot>
      );
    
}
