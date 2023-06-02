import React, { useEffect, useState } from 'react'
import { Row, Col, Form, Spinner } from 'react-bootstrap'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { BsUpload } from 'react-icons/bs'
import Viewer from './../compoents/3d/3DViewer';
import Layot from '../compoents/Layot'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import URL from '../api/Routes';

import { SuccessToast, ErrorToast, WarningToast } from '../compoents/toast-alert/SuccessToast';
import Swal from 'sweetalert2';

export default function Modify() {


    const { modelId }  = useParams();
    const navigate = useNavigate();

    const [model, setModel] = useState({})
    const [typeList, setTypeList] = useState({error:false, data:[]})
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    const [userId,setUserId] = useState("")
    const [address, setAddress] = useState("");
    const [complexNumber, setComplexNumber] = useState("");
    const [modelNames, setModelNames] = useState([]);
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const [altitude, setAltitude] = useState("");
    const [height, setHeight] = useState("");
    const [heading, setHeading] = useState("");
    const [pitch, setPitch] = useState("");
    const [roll, setRoll] = useState("");
    const [scale, setScale] = useState("");
    const [type, setType] = useState("");
    const [resolution, setResolution] = useState("");
    const [unique, setUnique] = useState("");
    const [previousFilename, setPreviousFilename] = useState("")
    const [modelFileId, setModelFileId] = useState("")
    const [modelFile, setModelFile] = useState(null);
    const [modelFileUploadSuggestion, setModelFileUploadSuggestion] = useState(null)
    const [modelJsonDataFile, setModelJsonDataFile] = useState({filename:"",data:{}});

    const [modelFileFormData,setModelFileFormData] = useState(null)
    const [uploadedUpdatedModelFile, setUploadedUpdatedModelFile] = useState({name:null})

    const [fileId,setFileId] = useState(false);
    
    const [resolutionChanged,setResolutionChanged] = useState(false);

    const header = {headers:{"Authorization":sessionStorage.getItem("token")}}

    const getModel = () =>{
        const uri = URL+`/asset/get-single-model-by/${modelId}`;
        axios.get(uri).then(res=>{
            if(res.status === 200 && res.data.success === true) {
                const model = res.data.data[0]
                const modelNamesString = model.modelNm[0].join(", ");
                setUserId(model.userId)
                setModel(res.data.data[0]);
                setAddress(model.numberAddr)
                setComplexNumber(model.complex)
                setType(model.modelType)
                setResolution(model.resolution)
                setModelNames(modelNamesString)
                setAltitude(model.fileMeta.altitude)
                setLatitude(model.fileMeta.loc.coordinates[1])
                setLongitude(model.fileMeta.loc.coordinates[0])
                setHeading(model.fileMeta.orientation.heading)
                setPitch(model.fileMeta.orientation.pitch)
                setRoll(model.fileMeta.orientation.roll)
                setHeight(model.fileMeta.height)
                setScale(model.fileMeta.scale || 0)
                setUnique(model.unique)
                setPreviousFilename(model.fileMeta.fileNm)
                setFileId(model.fileMeta.fileId)
                setModelFileId(model.fileMeta.fileId)
                setLoading(false)
            }
        }).catch(err=>{
        })
    }

    const getAllType = async () => {
        const uri = URL+"/type/get/all";
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
        getModel()
        getAllType()
    },[])

    useEffect(()=>{

    },[resolution])



    const handleGoBack = () => {
        navigate(-1,{replace: true})
    }


    const handleUploadModelJsonDataFile = e => {
        const file = e.target.files[0];
        let filenameArr = file.name.split(".")
        const fileExtn = filenameArr[filenameArr.length-1];

        if(fileExtn.toLowerCase() === "json"){
            const reader = new FileReader();
    
            reader.onload = (e) => {
                const result = JSON.parse(e.target.result);
                if(result.length>1){
                    Swal.fire({
                        title: 'Want to use first model data?',
                        text: "May have multiple model data.",
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Delete'
                      }).then((result) => {
                        if (result.isConfirmed) {
                            let validateType = false;
        
                            typeList.data.map(item=>{
                                if(item.name === result[0].modelType){
                                    validateType = true;
                                }
                            })
        
                            if(validateType===true){
                                setModelJsonDataFile({filename:file.name, data: result});
                                const modelData = result[0];
                                const modelNames = modelData.modelNm.join(", ");
                                setAddress(modelData.numberAddr)
                                setComplexNumber(modelData.complex)
                                setType(modelData.modelType)
                                setResolution(modelData.resolution)
                                setModelNames(modelNames)
                                setAltitude(modelData.fileMeta.altitude)
                                setLatitude(modelData.fileMeta.loc.coordinates[0])
                                setLongitude(modelData.fileMeta.loc.coordinates[1])
                                setHeading(modelData.fileMeta.orientation.heading)
                                setPitch(modelData.fileMeta.orientation.pitch)
                                setRoll(modelData.fileMeta.orientation.roll)
                                setHeight(modelData.fileMeta.height)
                                setScale(modelData.fileMeta.scale || 0)
                                setModelFileUploadSuggestion(modelData.fileMeta.fileNm)
                            }else{
                                WarningToast('Model type is not valid!');
                            }    
                        }
                      })
                }else{
                    WarningToast('Your file has no data, please add your data file carefully!');
                }
            }
    
            reader.readAsText(file);
        }else{
            WarningToast("Please upload a JSON file!")
        }


    }


    const uploadModel = (e) => {
        const file = e.target.files[0];
        setModelFile(file);
        setUploadedUpdatedModelFile({name:file.name})

    }


    const handleUpdate = () => {
        setUpdating(true)
        const modelName = modelNames.trim().split(",")
        const data = {
            user:userId,
            modelId,
            modelFileId,
            complexNumber:complexNumber,
            address:address,
            latitude:latitude,
            longitude:longitude,
            height:height,
            heading: heading,
            pitch: pitch,
            roll: roll,
            modelNames: modelName,
            type: type,
            resolution:resolution,
            unique:unique,
            altitude: altitude,
            scale: scale,
            filename: modelFile!==null?modelFile.name:previousFilename,
            previousFilename:previousFilename
        }
        if(modelFile!==null){
        const uri = URL+"/asset/update-model-with-file/single";

        let glbMetadata = {
            "author" : sessionStorage.getItem("_name"),
            "blockName" : address,
            "complex" : complexNumber,
            "createdAt" : new Date(Date.now()).toISOString(),
            "firstTime" : new Date(Date.now()).toISOString(),
            "height" : height,
            "lastTime" : new Date(Date.now()).toISOString(),
            "modelType": type,
            "modelOwners": modelName,
            "orientation" : {
            "heading" : heading,
            "pitch" : pitch,
            "roll" : roll
            },
            "position" : {
            "latitude" : latitude,
            "longitude" : longitude,
            "altitude" : altitude
            },
            "filename":modelFile.name,
            "resolution" : resolution,
            "scale" : scale,
            "unique" : unique,
            "updatedAt" : new Date(Date.now()).toISOString(),
            "use" : true
            }


        const formData = new FormData();
            console.log('update with file')
        formData.append("data",JSON.stringify(data))
        // formData.append("previousFilename",previousFilename)
        // formData.append("glbMetadata",JSON.stringify(glbMetadata))
        formData.append("singleModel",modelFile);

        axios.post(uri,formData,{"Content-Type":"multipart/form-data",headers:{"Authorization":sessionStorage.getItem("token")}}).then(res=> {
            console.log('update res: ',res)
            if(res.status === 200 && res.data.success === true) {
                getModel()
                SuccessToast("Updated successfully!")
                setUpdating(false)
            }else if(res.status === 200 && res.data.success === false){
                WarningToast(res.data.message)
                setUpdating(false)
            }else{
                setUpdating(false)
                ErrorToast("Not updated!")
            }
        }).catch(error=>{
            setUpdating(false)
            ErrorToast("Not updated!")
        })
    }else{
        console.log('update with no file')
        const uri = URL+"/asset/update-model-with-nofile/single";
        axios.post(uri,{data: data},{headers:{"Authorization":sessionStorage.getItem("token")}}).then(res=> {
            if(res.status === 200 && res.data.success === true) {
                SuccessToast("Updated successfully!")
                getModel()
                setUpdating(false)
            }else if(res.status === 200 && res.data.success === false){
                WarningToast(res.data.message)
                setUpdating(false)
            }else{
                setUpdating(false)
                ErrorToast("Not updated!")
            }
        }).catch(error=>{
            setUpdating(false)
            ErrorToast("Not updated!")
        })
    }
    }

    const handleSetResolution = (e) => {
        const selectedItem = Number(e.target.value);
        setResolution(selectedItem)
        setResolutionChanged(true)
    }

if(loading===true) {
    return (
        <Layot>
            <div className='d-flex justify-content-center align-items-center' style={{height: '100vh'}}>
                <Spinner size='lg' animation="border" />
            </div>
        </Layot>
    )
}else{

    return (
      <Layot>
          <div className='d-flex justify-content-between mt-3'>
              <span className="btn btn-transparent mx-0 outline-0 border-0" onClick={handleGoBack}><AiOutlineArrowLeft style={{fontSize: '30px'}} /></span>
              <div className="px-3">
                  <button className='btn btn-secondary btn-sm rounded mx-1' onClick={handleGoBack}>Cancel</button>
                  <button className='btn btn-secondary btn-sm bg-custom-secondary rounded mx-1' disabled={updating} onClick={handleUpdate} >{updating===true?<Spinner size="sm" animation="border" />:"Save"}</button>
              </div>
          </div>
          <div className='border rounded mt-3'>
              <div className='border-bottom px-3 py-1'>
                  <h4>Modify</h4>
              </div>
              <div className='p-3'>
                  <Row>
                      <Col lg={6} md={12}>
                          <div  style={{height: '100%',width: '100%'}}>
                            {
                                modelFileFormData!==null?<Viewer height="100%" width="100%" filelocation={`${process.env.REACT_APP_API_URL}/3d-models/${uploadedUpdatedModelFile.name}`} />:<Viewer height="100%" width="100%" filelocation={`${process.env.REACT_APP_API_URL}/storage/3d-model/${ fileId}`} />
                            }
                          </div>
                      </Col>
                      {/* modelFileFormData */}
                      <Col lg={6} md={12}>
                      <table className='table text-center border'>
              <tbody>
                  <tr>
                      <td>Complex</td>
                      <td>
                        <Form.Select value={Number(complexNumber)} className="text-center" onChange={e=>{setComplexNumber(e.target.value)}}>
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
                    <td><input type="text" placeholder='Multiple model name separate by comma' value={modelNames} onChange={e=>setModelNames(e.target.value)} className='form-control form-control-sm text-center' /></td>
                  </tr>
                  <tr>
                    <td>Address</td>
                    <td><input type="text" value={address} placeholder='Address' onChange={e=>setAddress(e.target.value)} className='form-control form-control-sm text-center' /></td>
                  </tr>
                  <tr>
                      <td>Latitude</td>
                      <td>
                          <div className='d-flex'>
                              <input type="text" defaultValue={latitude} onChange={e=>setLatitude(e.target.value)} className='d-inline-block form-control form-control-sm text-center' />
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td>Longitude</td>
                      <td>
                          <div className='d-flex'>
                              <input type="text" defaultValue={longitude} onChange={e=>setLongitude(e.target.value)} className='d-inline-block form-control form-control-sm text-center' />
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td>Height</td>
                      <td><input type="text" defaultValue={height} onChange={e=>setHeight(e.target.value)} className='form-control text-center' /></td>
                  </tr>
                  <tr>
                      <td>Heading</td>
                      <td><input type="text" defaultValue={heading} onChange={e=>setHeading(e.target.value)} className='form-control text-center' /></td>
                  </tr>
                  <tr>
                      <td>Pitch</td>
                      <td><input type="text" defaultValue={pitch} onChange={e=>setPitch(e.target.value)} className='form-control text-center' /></td>
                  </tr>
                  <tr>
                      <td>Role</td>
                      <td><input type="text" defaultValue={roll} onChange={e=>setRoll(e.target.value)} className='form-control text-center' /></td>
                  </tr>
                  <tr>
                      <td>Scale</td>
                      <td><input type="text" defaultValue={scale} onChange={e=>setScale(e.target.value)} className='form-control text-center' /></td>
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
                                <button className={`btn btn-primary ${unique===false?"bg-custom-secondary":"bg-success"} text-white mx-1 border rounded`} onClick={()=>{setUnique(!unique)}}>{unique===false?"Unique":"Common"}</button>
                            </div>
                      </td>
                  </tr>
                  <tr className={`${resolutionChanged===true?"d-none":null}`}>
                      <td>Attach 3dAsset file</td>
                      <td>
                          <div className='d-flex'>
                              <input type="text" defaultValue={modelFileUploadSuggestion!==null?`Upload ${modelFileUploadSuggestion} model file`:"Attach new file"} onChange={e=>{}} className='d-inline-block form-control form-control-sm text-center d-md-block d-none' />
                              <label role="button">
                                <input hidden type="file" onChange={uploadModel} />
                                <span className='btn btn-primary btn-sm rounded-end bg-custom-secondary d-flex align-items-center'><div className='d-flex align-items-center' style={{height: '30px'}}>
                                        <BsUpload style={{height: '20px',width: 'auto'}} />
                                        <p  style={{width: '90px',margin: '0'}}>File Upload</p>
                                    </div>
                                </span>
                            </label>
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td>Filename</td>
                      <td><input type="text" defaultValue={previousFilename} className='form-control form-control-sm text-center' /></td>
                  </tr>
                  <tr className={`${modelFile===null?null:"d-none"}`}>
                    <td>Image Quality</td>
                    <td className="d-flex">
                        <div className='input-group rounded-0 bg-light input-group-text'>
                            <span className="px-3 fs-5 font-weight-bolder">512 px</span>
                            {
                                Number(resolution)===512?<input type="checkbox" name="512" className='form-check-input' onChange={handleSetResolution} checked={true} value={512}  style={{height: "25px",width: '25px'}}  />:
                                    <input type="checkbox" name="512" className='form-check-input' onChange={handleSetResolution} checked={false} value={512}  style={{height: "25px",width: '25px'}}  />
                            }
                        </div>
                        <div className='input-group rounded-0 bg-light input-group-text'>
                            <span className="px-3 fs-5 font-weight-bolder">1024 px</span>
                            {
                                Number(resolution)===1024?<input type="checkbox" name="1024" className='form-check-input' onChange={handleSetResolution} checked={true} value={1024}  style={{height: "25px",width: '25px'}}  />:
                                    <input type="checkbox" name="1024" className='form-check-input' onChange={handleSetResolution} checked={false} value={1024}  style={{height: "25px",width: '25px'}}  />
                            }
                        </div>
                        <div className='input-group rounded-0 bg-light input-group-text'>
                            <span className="px-3 fs-5 font-weight-bolder">2048 px</span>
                            {
                                Number(resolution)===2048?<input type="checkbox" name="2048" className='form-check-input' onChange={handleSetResolution} checked={true} value={2048}  style={{height: "25px",width: '25px'}}  />:
                                    <input type="checkbox" name="2048" className='form-check-input' onChange={handleSetResolution} checked={false} value={2048}  style={{height: "25px",width: '25px'}}  />
                            }
                        </div>
                    </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td className={``}><span className='text-muted text-italic'>Don't update resolution and glb file in one time</span></td>
                        <td></td>
                    </tr>
              </tbody>
          </table>
                      </Col>
                  </Row>
              </div>
              <div className="p-3">
                  <div className="styeld-left-border">
                      <div className='p-2 d-flex align-items-center border-bottom'>
                          <h6 className="px-3 text-bold">Attach File</h6>
                          <div className="d-flex mx-3">
                              <input type="text" placeholder='Upload the json file' disabled={true} onChange={e=>{}} className="fileupload-btn form-control d-md-block d-none rounded-end-0" />
                              <label role="button">
                                <input hidden type="file" onChange={handleUploadModelJsonDataFile} />
                                <span className='btn btn-primary btn-sm rounded-end bg-custom-secondary d-flex align-items-center'><div className='d-flex align-items-center' style={{height: '30px'}}>
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
                              table.json
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </Layot>
    )

}

}
