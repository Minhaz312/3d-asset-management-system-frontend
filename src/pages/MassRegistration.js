import React, { useContext, useState } from 'react'
import Layot from '../compoents/Layot'
import { BsUpload } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import URL from '../api/Routes'
import axios from 'axios'
import { Accordion, Alert, Spinner } from 'react-bootstrap'
import { ErrorToast, SuccessToast, WarningToast } from '../compoents/toast-alert/SuccessToast'
import * as cptable from 'xlsx/dist/cpexcel.full.mjs';
import { read, utils, set_cptable } from 'xlsx'
import { TypeContext } from '../contexts/typeContext'
import { UserContext } from '../contexts/userContext'
set_cptable(cptable);

export default function MassRegistration() {

    const {typeList, setUpdatedTypeList} = useContext(TypeContext)
    const {user} = useContext(UserContext)

    const [showModelSuggestionAlert, setShowModelSuggestionAlert] = useState(true)

    const [selectedFile, setSelectedFile] = useState(null);
    const [templateName, setTemplateName] = useState(null);
    const [selectedFileDetails, setSelectedFileDetails] = useState(null)
    const [correspondingFileUploadSuggestion, setCorrespondingFileUploadSuggestion] = useState([])
    const [correspondingMetadata, setCorrespondingMetadata] = useState([])
    const [selectedSuggestedFile, setSelectedSuggestedFile] = useState({selected:[],notSelected:[]})
    const [correspondingGlbFiles, setCorrespondingGlbFiles] = useState([])
    const [notRegisteredTypes, setNotRegisterdTypes] = useState([]);
    const [multipleTypeRegistrationStatus, setMultipleTypeRegistraitonStatus] = useState({loading:false, success:false})
    const [registrationStarted, setRegistrationStarted] = useState(false)

    const [fileAlreadyExist, setFileAlreadyExist] = useState(null)
    const [uploadedExcelFile, setUploadedExcelFile] = useState(null);


    let filteredItems;

    const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
    const multipartHeader = {headers:{"Content-Type":"multipart/form-data","Authorization":sessionStorage.getItem("token")}}




    const handleFilter = (e) => {
        if(selectedFile!==null){
            filteredItems = selectedFile.filter(
                item => {
                    
                }
            );
        }
    }


    const handleSelectExcelFile = e => {
        const file = e.target.files[0];
        const fileSize = (file.size/1024/1024);
        const uploadedFilename = file.name.split(".")
        const extension = uploadedFilename[uploadedFilename.length-1].toLowerCase();
        if(extension!=="csv" && extension!=="xlsx" && extension!=="xls"){
            WarningToast("Please select an excel file")
        }else if(fileSize>30){
            WarningToast("Your file is too big, you can upload maximum 30MB file")
        }else{       
            setUploadedExcelFile(file);

            const reader = new FileReader();
            const readerAsDataUrl = new FileReader();
            reader.addEventListener("load",e=> {
                const wb = read(e.target.result,{type: 'buffer'});
                const ws = wb.Sheets[wb.SheetNames[0]];
        
                const json = utils.sheet_to_json(ws, {header: 1});

                if(ws['!merges']!==undefined){
                    setSelectedFileDetails({name:file.name,size:file.size,rows:json.length,numberOfMerges:ws['!merges'].length})
                }else{
                    setSelectedFileDetails({name:file.name,size:file.size,rows:json.length,numberOfMerges:0})
                }


                let data = [];
                let glbMetadataList = [];
    
    
                let modelNameArray = []

                let notRegisteredTypeListInExcell = []

                
                json.map((item,id)=> {
                    if(item.length===18){
                        if(String(item[0]).toLowerCase()!=="complex"){
                            let resolution = 0
                            let resolutionCheckList = [item[15],item[16],item[17]]
                            let modelFileFormatedName = `${item[3]}.${item[13]}`

                            if(item[15].toLowerCase()==="o"){
                                resolution=512
                            }
                            if(item[16].toLowerCase()==="o"){
                                resolution=1024
                            }
                            if(item[17].toLowerCase()==="o"){
                                resolution=2048
                            }

                        if(modelNameArray.length===0){
                            modelNameArray.push({filename:modelFileFormatedName})
                        }else{
                            let available=false;
                            modelNameArray.map(prev=>{
                                if(modelFileFormatedName===prev){
                                    available=true;
                                }
                            })
                            if(available===false){
                                modelNameArray.push({filename:modelFileFormatedName})
                            }
                        }
                        let typeRegistered = false;
                        typeList.data.map(type=>{
                            if(type.name.toLowerCase()===item[12].toLowerCase()){
                                typeRegistered = true;
                            }
                        })
                        let typeDuplicate = false;
                        if(notRegisteredTypeListInExcell.length===0){
                            typeDuplicate=false;   
                        }else{
                            notRegisteredTypeListInExcell.map(type=>{
                                if(type.name.toLowerCase()===item[12].toLowerCase()){
                                    typeDuplicate=true;
                                }
                            })
                        }
                        if(typeRegistered===false && typeDuplicate===false){
                            notRegisteredTypeListInExcell.push({name:item[12].charAt(0).toUpperCase()+item[12].slice(1)})
                        }

                       

                        let glbMetadata = {
                            "author" : sessionStorage.getItem("_name"),
                            "blockName" : item[1],
                            "complex" : item[0],
                            "createdAt" : new Date(Date.now()).toISOString(),
                            "firstTime" : new Date(Date.now()).toISOString(),
                            "height" : item[7],
                            "lastTime" : new Date(Date.now()).toISOString(),
                            "modelType": item[12],
                            "modelOwners": item[2],
                            "orientation" : {
                            "heading" : item[8],
                            "pitch" : item[9],
                            "roll" : item[10]
                            },
                            "position" : {
                            "latitude" : item[4],
                            "longitude" : item[5],
                            "altitude" : item[6]
                            },
                            "filename":item[3]+"."+item[13],
                            "resolution" : resolution,
                            "scale" : item[11],
                            "unique" : item[14].toLowerCase()==="o"?true:false,
                            "updatedAt" : new Date(Date.now()).toISOString(),
                            "use" : true
                            }

                            console.log('item: ',item)
                        let tmpObj = {user:user.id,complex:item[0],address:item[1],modelNm:item[2].split(","),fileNm:item[3]+"."+item[13],latitude:item[5],longitude:item[6], altitude:item[4],height:item[7],heading: item[8],pitch:item[9], roll:item[10],scale: item[11],type: item[12].charAt(0).toUpperCase()+item[12].slice(1),fileType:item[13],unique:item[14].toLowerCase()==="o"?true:false,resulationList:resolution,resolutionCheckList:resolutionCheckList};
                        data.push(tmpObj);
                        
                        glbMetadataList.push(glbMetadata);
                        }
                        
                    }
                })

                setCorrespondingMetadata(glbMetadataList)
                setCorrespondingFileUploadSuggestion(modelNameArray);
  
                setNotRegisterdTypes(notRegisteredTypeListInExcell);



                setSelectedFile(data);

                console.log('data: ',data)
                
            })
            reader.readAsArrayBuffer(e.target.files[0]);


            readerAsDataUrl.readAsDataURL(e.target.files[0]);
        }


    }

    const handleSelectMultipleModel = async e =>{
        let files = e.target.files;
        const uri = URL+"/asset/upload-model/multiple";

        const formData = new FormData();

        let ignoredFile = []
        let uploaded = correspondingGlbFiles
        let preUploaded = correspondingGlbFiles
        let uploadedFilenames= selectedSuggestedFile.selected
        let notUploaded = []

        let acceptableFiles = []

        correspondingFileUploadSuggestion.map(item=>{
            acceptableFiles.push(item.filename)
        })

        console.log("acceptable files: ",acceptableFiles)
        console.log("preuploaded files: ",preUploaded)

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if(acceptableFiles.includes(file.name) && preUploaded.filter(item=>item.name===file.name?false:true)){
                formData.append("multipleModel", file);
                uploaded.push(file)
                uploadedFilenames.push(file.name)
            }else{
                ignoredFile.push(file.name);
            }
        }

        setCorrespondingGlbFiles(uploaded)

        formData.append("metadataList",correspondingMetadata)
        acceptableFiles.map(item=>{
            if(!uploadedFilenames.includes(item)){
                notUploaded.push(item)
            }
        })
        setSelectedSuggestedFile({selected:uploadedFilenames, notSelected:notUploaded})
    
    }


    const handleRegisterNotRegisteredTypes = async () => {
        setMultipleTypeRegistraitonStatus({loading:true, success:false})
        const uri = URL+"/type/register";
        let typeList = []
        notRegisteredTypes.map(item=>{
            typeList.push({name: item.name.charAt(0).toUpperCase()+item.name.slice(1)})
        })
        await axios.post(uri, {type:typeList},header).then(res=>{
            if(res.status === 200 && res.data.success === true) {
                setMultipleTypeRegistraitonStatus({loading:false, success:true})
                setUpdatedTypeList({error:false,data:res.data.data})
                SuccessToast("Registration success!")
            }else{
                setMultipleTypeRegistraitonStatus({loading:false, success:false})
                ErrorToast("Registration failed!")
            }
        }).catch(error=>{
            setMultipleTypeRegistraitonStatus({loading:false, success:false})
            ErrorToast("Registration failed!")
        })
    }

    const handleMassRegistration = async () => {
        
        if(correspondingGlbFiles.length===correspondingFileUploadSuggestion.length && selectedFile!==null){
            setRegistrationStarted(true)
            const uri = URL+"/asset/register-multiple-model"
    
            const formData = new FormData()
            const templateFormData = new FormData()
            formData.append("data",JSON.stringify(selectedFile))
    
            correspondingGlbFiles.map(item=>{
                formData.append("multipleModel",item)
            })
    
            templateFormData.append("templatefile",uploadedExcelFile)
    
    
            await axios.post(uri,formData,multipartHeader).then(res=>{
                if(res.status === 200 && res.data.success === true){
                    SuccessToast("Registration success")
                    setTemplateName(uploadedExcelFile.name)
                    setSelectedFile(null)
                    setSelectedFileDetails(null)
                    setCorrespondingFileUploadSuggestion([])
                    setNotRegisterdTypes([])
                    setMultipleTypeRegistraitonStatus({loading:false,success:false})
                    setRegistrationStarted(false)
                    setShowModelSuggestionAlert(false)
                    setTemplateName(uploadedExcelFile.name);
                }else if(res.status===200 && res.data.success===false){
                    setTemplateName(uploadedExcelFile.name)
                    setSelectedFile(null)
                    setSelectedFileDetails(null)
                    setCorrespondingFileUploadSuggestion([])
                    setNotRegisterdTypes([])
                    setMultipleTypeRegistraitonStatus({loading:false,success:false})
                    setRegistrationStarted(false)
                    setShowModelSuggestionAlert(false)
                    setFileAlreadyExist(res.data.existFile)
                }else{
                    ErrorToast("Registration faile!")
                    setRegistrationStarted(false)
                }
            }).catch(error=>{
                setRegistrationStarted(false)
                ErrorToast("Registration faile!")
            })
        }else{
            WarningToast("Please select the all 3d files")
        }

    }

   

    const selectedFileComponent = selectedSuggestedFile.selected.map((item,i)=>{
            return <span key={i} className="m-1 p-1 text-bold bg-light rounded d-inline-block">{i+1+") "+item}</span>
        })
    const notSelectedFileComponent = selectedSuggestedFile.notSelected.map((item,i)=>{
            return <span key={i} className="m-1 p-1 text-bold bg-light rounded d-inline-block">{i+1+") "+item}</span>
        })

  return (
    <Layot>
        <div>

        
        <div className='d-flex justify-content-between mb-3 pr-3'>
                <Link to="/registration/individual" className='btn btn-secondary btn-sm bg-custom-secondary rounded-4px'>Individual Registration</Link>
            <button disabled={selectedFile===null?true:false} style={{cursor:selectedFile===null?"no-drop":"pointer"}} className='btn btn-secondary btn-sm bg-custom-secondary rounded-4px mx-1' onClick={handleMassRegistration} >{registrationStarted===true?<Spinner size="sm" animation="border" />:"Save"}</button>
        </div>
        <div className='border rounded'>
            <div className="p-3">
                <div className="styeld-left-border">
                    <div className='p-2 d-flex align-items-center justify-content-between border-bottom'>
                        <div className='d-flex align-items-center'>
                            <h6 className="sm-h6 px-3 text-bold">Attach File</h6>
                            <div className="d-flex mx-3">
                                <input type="text" disabled value={
                                    selectedFileDetails===null?`Please select a file`:
                                    `Excel has ${selectedFile.length} rows and ${selectedFileDetails.numberOfMerges} rows merged`
                                    } className="d-lg-block d-none form-control" style={{minWidth:'200px',width:'300px'}} />
                                <label role="button">
                                    <input hidden type="file" onChange={handleSelectExcelFile} />
                                    <span className='btn btn-primary btn-sm rounded-end bg-custom-secondary d-flex align-items-center'><div className='d-flex align-items-center' style={{height: '30px'}}>
                                            <BsUpload style={{height: '20px',width: 'auto'}} />
                                            <p  style={{width: '90px',margin: '0'}}>File Upload</p>
                                        </div>
                                    </span>
                                </label>
                            </div>
                        </div>
                        <a download="mass-registration.xlsx" href={`/templates/mass-registration.xlsx`} className={`btn d-flex align-items-center gap-3`}>
                            <p className="my-0">template file</p>
                            <img src="/images/template-file-icon.png" height="35px" />
                        </a>
                    </div>
                    {selectedFile!==null && correspondingFileUploadSuggestion.length>0?<div className='p-2 d-flex align-items-center border-bottom'>
                        <h6 className="sm-h6 px-3 text-bold">Attach Corresponding Model Files</h6>
                        <div className="d-flex mx-3">
                            <form method='post' className='d-flex' encType='multipart/form-data'>
                            <input type="text" disabled style={{minWidth: '200px',maxWidth: '650px'}} className="form-control d-md-block d-none" />
                            <label role="button">
                                <input hidden type="file" multiple onChange={handleSelectMultipleModel} />
                                <span className='btn btn-primary btn-sm rounded-end bg-custom-secondary d-flex align-items-center'><div className='d-flex align-items-center' style={{height: '30px'}}>
                                        <BsUpload style={{height: '20px',width: 'auto'}} />
                                        <p  style={{width: '90px',margin: '0'}}>File Upload</p>
                                    </div>
                                </span>
                            </label>
                            </form>
                        </div>
                    </div>:null}
                    
                    <div className='p-2 d-flex align-items-center border-bottom'>
                        <h6 className="px-3 text-bold">Table Name</h6>
                        <div className="d-flex mx-3">
                            {selectedFileDetails===null?"table.xlsx":selectedFileDetails.name}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            {
                correspondingFileUploadSuggestion.length>0?<div className="border-rounded my-3">
                    <Alert variant='danger' show={showModelSuggestionAlert} onClose={e=>setShowModelSuggestionAlert(false)} dismissible >
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header className="py-0">
                                <div>
                                    <h4>3D model file upload Suggesiton{`(${correspondingFileUploadSuggestion.length})`}</h4>
                                    <p style={{fontSize:"14px"}}>Select all glb file in one time(all glb file must be uploaded before saving)</p>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className='my-3'>
                                    {
                                        selectedSuggestedFile.selected.length>0?<>
                                            <div className='border my-1'>
                                                <h5>Selected Files</h5>
                                                {selectedFileComponent}
                                            </div>
                                            <div className='border my-1'>
                                                <h5>Not Selected Files</h5>
                                                {notSelectedFileComponent}
                                            </div>
                                        </>:<>
                                            {
                                            correspondingFileUploadSuggestion.map((item,i)=><span key={i} className="m-1 p-1 text-bold bg-light rounded d-inline-block">{i+1+") "+item.filename}</span>)
                                            }
                                        </>
                                    }
                                    
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    </Alert>
                </div>:null
            }
            {
                multipleTypeRegistrationStatus.success===true?<>
                    <Alert variant='success' dismissible >All types registered successfully</Alert>
                </>:<div className='border-rounded'>
                {
                    notRegisteredTypes.length>0?<div className='my-1'>
                        <Alert variant='danger'>
                            <Alert.Heading>Types not registered{`(${notRegisteredTypes.length})`}</Alert.Heading>
                            <div className='my-3'>
                                {
                                    notRegisteredTypes.map((item,i)=><span key={i} className="mx-1 p-1 text-bold bg-light rounded d-inline-block">{i+1+") "+item.name}</span>)
                                }
                                <button className='btn btn-sm btn-primary bg-custom-secondary mx-3' onClick={handleRegisterNotRegisteredTypes}>
                                    {multipleTypeRegistrationStatus.loading===true?<Spinner size='sm' animation='border' />:<>
                                        {
                                            multipleTypeRegistrationStatus.loading===true?<>{multipleTypeRegistrationStatus.success===true?"Registration succeed":"Failed to register"}</>:"Register all type"
                                        }
                                    </>}
                                </button>
                            </div>
                        </Alert>
                    </div>:null
                }
        </div>
            }
            <div className='border rounded my-3'>
            {
                selectedFileDetails===null?null:
                
            <DataTable

                columns={
                    [
                        {name: "Complex Name",selector: row=>row.complex},
                        {name: "Address",selector: row=>row.address},
                        {name: "Model Name",selector: row=>row.modelNm},
                        {name: "File Name",selector: row=>row.fileNm,width: '150px'},
                        {name: "Latitude",selector: row=>row.latitude},
                        {name: "Longitude",selector: row=>row.longitude},
                        {name: "Altitude",selector: row=>row.altitude},
                        {name: "Height",selector: row=>row.height,width:'90px'},
                        {name: "Heading",selector: row=>row.heading,width:'90px'},
                        {name: "Pitch",selector: row=>row.pitch,width:'90px'},
                        {name: "Roll",selector: row=>row.roll,width:'90px'},
                        {name: "Scale",selector: row=>row.scale,width:'90px'},
                        {name: "Type",selector: row=>row.type},
                        {name: "FileType",selector: row=>row.fileType,width:'90px'},
                        {name: "Unique",selector: row=>row.unique===true?"o":"x",width:'90px'},
                        {name: "512",selector: row=>row.resolutionCheckList[0],width:'90px'},
                        {name: "1024",selector: row=>row.resolutionCheckList[1],width:'90px'},
                        {name: "2048",selector: row=>row.resolutionCheckList[2],width:'90px'}
                    ]
                }

                customStyles={{
                    headCells:{
                        style:{
                            fontSize: '15px',
                            fontWeight: 'bold',
                            backgroundColor:'#002060',
                            color: "#ffffff"
                        }
                    }
                }}
                data={selectedFile}
                paginationPerPage={15}
                paginationComponentOptions={
                    {
                        rowsPerPageText:"Total model per page",
                    }
                }
                pagination
            />
            }
            </div>
            {
                fileAlreadyExist!==null?<div className='table-responsive p-3 border rounded shadow-sm bg-white'>
                <table className='table table-hover caption-top'>
                    <caption>Not registered, file already exist({fileAlreadyExist.length})</caption>
                    <thead className="table-danger">
                        <tr>
                            <td className='fw-bold'>Filename</td>
                            <td className='fw-bold'>Resolution</td>
                            <td className='fw-bold'>Address</td>
                            <td className='fw-bold'>Latitude</td>
                            <td className='fw-bold'>Longitude</td>
                            <td className='fw-bold'>Altitude</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            fileAlreadyExist.map((item,id)=><tr key={id}>
                                <td>{item.fileMeta.fileNm}</td>
                                <td>{item.resolution}</td>
                                <td>{item.numberAddr}</td>
                                <td>{item.fileMeta.loc.coordinates[1]}</td>
                                <td>{item.fileMeta.loc.coordinates[0]}</td>
                                <td>{item.fileMeta.altitude}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>:null
            }
        </div>
        </div>
    </Layot>
  )
}
