import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Alert, Col, Row, Spinner } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { BsUpload } from 'react-icons/bs'
import URL from '../api/Routes'
import Layot from '../compoents/Layot'

import * as cptable from 'xlsx/dist/cpexcel.full.mjs';
import { read, utils, set_cptable } from 'xlsx'
import { ErrorToast, SuccessToast } from '../compoents/toast-alert/SuccessToast'
import AssetListTable from '../compoents/asset-list/AssetListTable'
import { UserContext } from '../contexts/userContext'
set_cptable(cptable);

export default function CreateModel() {


  const {user} = useContext(UserContext)

  const [assetList, setAssetList] = useState({success:false,loading:true, data:[]});
  const [totalModel, setTotalModel] = useState(0)
  const [typeList, setTypeList] = useState({error:false,loading:true, data:[]});

  const [selectedRow, setSelectedRow] = useState({selected:false, data:[]});
  const [selectedFromLocationList, setSelectedFromLocationList] = useState([])
  const [clearSelectedRow, setClearSelectedRow] = useState(false);
  const [numberOfCreate, setNumberOfCreate] = useState(null)
  const [previewFinalData, setPreviewFinalData] = useState(false)

  const [registrationStarted,setRegistrationStarted] = useState(false)

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null)
  const [templateName, setTemplateName] = useState(null)
  const [uploadedExcelFileDataUrl, setUploadedExcelFileDataUrl] = useState(null);
  const [selectedFileDetails, setSelectedFileDetails] = useState(null)
  const [notRegisteredTypes, setNotRegisterdTypes] = useState([]);





  const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
  const getAllType = async () => {
    const uri = URL+"/type/get/all";
    await axios.get(uri,header).then(res=> {
        if(res.status === 200 && res.data.success === true) {
            setTypeList({error: false,loading:false, data: res.data.data});
          }else{
            setTypeList({error: true,loading:false, data: []});
          }
        }).catch(error=> {
          setTypeList({error: true,loading:false, data: []});
    })
  }
  
  const getAllAsset = async (currentPage,rowPerPage,currentType) => {
    const uri = URL+`/asset/created/get-model-by/${currentPage}/${rowPerPage}/${currentType}`;
    await axios.get(uri,header).then(res=> {
      if(res.status === 200 && res.data.success === true) {
              setTotalModel(res.data.totalModel)
              setAssetList({success: true,loading:false, data: res.data.data});
          }else{
              setAssetList({success: false,loading:false, data: []});
          }
      }).catch(error=> {
          setAssetList({success: true,loading:false, data: []});
      })
  }


  useEffect(()=>{
    getAllAsset(0,15,"All")
    getAllType();
  },[])

 
  const handleSelectExcelFile = e => {
    const file = e.target.files[0];
    const fileSize = (file.size/1024/1024);
    setSelectedFileDetails({name:file.name,size:fileSize})
    if(fileSize>30){
        alert("Your file is too big, you can upload maximum 30MB file")
    }else{
        setSelectedExcelFile(file)
        const reader = new FileReader();
        const readerAsDataUrl = new FileReader();
        reader.addEventListener("load",e=> {
            const wb = read(e.target.result,{type: 'buffer'});
            const ws = wb.Sheets[wb.SheetNames[0]];
    
            const json = utils.sheet_to_json(ws, {header: 1});

            let excelFileJsonData = [];
            let notRegisteredTypeListInExcell = []


            json.map((item,id)=> {
                if(item.length===10){
                  if(item[0].toLowerCase()!=="address"){
                    
                    let tmpObj = {address:item[0],modelNm:item[1].trim().split(","),altitude:item[2],latitude:item[3],longitude:item[4],height:item[5],heading: item[6],pitch:item[7], roll:item[8],scale: item[9],unique:true};
                    excelFileJsonData.push(tmpObj);
                  }
                }
            })

            setNotRegisterdTypes(notRegisteredTypeListInExcell);
            setSelectedFile(excelFileJsonData);
            
        })
        reader.readAsArrayBuffer(e.target.files[0]);
        readerAsDataUrl.onload = e => {
          setUploadedExcelFileDataUrl(e.target.result)
        }
        readerAsDataUrl.readAsDataURL(e.target.files[0]);
        
    }


}


const handleCreateFromUploadedLocationList = () => {
  let finalSelection = []
  if(numberOfCreate>selectedFile.length){
    alert("Please Enter valid value")
  }else{
    for (let i = 0; i < numberOfCreate; i++) {
      finalSelection.push(selectedFile[i]);
    }
    setSelectedFile(finalSelection)
    setSelectedFromLocationList(finalSelection)
  }

}



const handleCreateModel = () => {

  if(selectedFile!==null) {
    const referenceModel = selectedRow.data[0]
    selectedFile.map(item=>{
      item.user = user.id
      item.complex = referenceModel.complex
      item.fileNm = referenceModel.fileMeta.fileNm
      item.type = referenceModel.modelType
      item.resulationList = referenceModel.resolution
      item.fileId = referenceModel.fileMeta.fileId
    })
    
        setRegistrationStarted(true)
        const uri = URL+"/asset/create-model"
        const formData = new FormData();
        const templateFormData = new FormData();
        console.log("selectedExcelFile: ",selectedExcelFile)
        console.log("selectedFile data: ",JSON.stringify(selectedFile))
        const config = {headers:{"Content-Type":"multipart/form-data","Authorization":sessionStorage.getItem("token")}}
        templateFormData.append("templatefile",selectedExcelFile)
        axios.post(uri,{data:JSON.stringify(selectedFile)},header).then(res=>{
            if(res.status === 200 && res.data.success === true){
                setTemplateName(selectedExcelFile.name)
                SuccessToast("Registration success")
                setRegistrationStarted(false)
                setSelectedRow({selected:false,data:[]})
                setSelectedFromLocationList([])
                setClearSelectedRow(true)
                setNumberOfCreate(null)
                setPreviewFinalData(false)
                setSelectedFile(null)
                setSelectedFileDetails(null)
                setNotRegisterdTypes([])
            }else{
                ErrorToast("Registration faile!")
                setRegistrationStarted(false)
            }
        }).catch(error=>{
            setRegistrationStarted(false)
            ErrorToast("Registration faile!")
        })
  }
}

const uploadedDataTableCustomStyle = {
  headCells: {
    style:{
      fontSize: '14px',
      backgroundColor:"#002060",
      color: "#ffffff"
    }
  }
}
const uploadedDataTableColumn = [
  {name: "Complex",width: '100px',center:true,selector: row=>selectedRow.data[0].complex},
  {name: "Address",center:true,selector: row=>row.address},
  {name: "Model Names",center:true,selector:row=>row.modelNm},
  {name: "File Name",center:true,selector:row=>`${selectedRow.data[0].fileMeta.fileNm}(inherited)`},
  {name: "Altitude",center:true,selector:row=>row.altitude},
  {name: 'Latitude',center:true,selector:row=>row.latitude},
  {name: 'Longitude',center:true,selector:row=>row.longitude},
  {name: 'Height',width: '70px',center:true,selector:row=>row.height},
  {name: 'Heading',width: '70px',center:true,selector:row=>row.heading},
  {name: 'Pitch',width: '70px',center:true,selector:row=>row.pitch},
  {name: 'Roll',width: '70px',center:true,selector:row=>row.roll},
  {name: 'Scale',width: '70px',center:true,selector:row=>row.scale}
]

  if(assetList.loading===true) {
    return <Layot>
      <div className='d-flex justify-content-center align-items-center' style={{height: '100vh'}}><Spinner size="lg" animation='border' /></div>
    </Layot>
  }else if(assetList.data.length===0 && Number(totalModel)>0){
    return <Layot>
    <div className='d-flex justify-content-center align-items-center text-danger' style={{height: '100vh'}}>
      <div className='text-center'>
        <img src='/images/no-data-found.PNG' alt="no data found" style={{height: '300px'}} />
        <h4 style={{color: '#969696'}}>Please register model first</h4>
      </div>
    </div>
  </Layot>
  }


  return (
    <Layot>
        <div className="border rounded">
          <div className='border-bottom mb-3 d-flex justify-content-between align-items-center p-3'>
            <h4 className=''>Create Model</h4>
            <a download="model-create.xlsx" href={`/templates/model-create.xlsx`} className={`btn d-flex align-items-center gap-3`}>
                <p className="my-0">template file</p>
                <img src="/images/template-file-icon.png" height="35px" />
            </a>
          </div>
            <Row className="p-0 m-0">
              <Col lg={5} md={12} className="p-0 m-0">
                <div className='border'>

                  <AssetListTable defaultRowPerPage={15} rowDeletable={false} management={false} selectableRowsSingle={true} pageRangeDisplayed={3} marginPagesDisplayed={3} typeList={typeList} getSearchResult={null} searchKeyword="" getAllAsset={getAllAsset} data={assetList} setData={null} totalData={totalModel} setTotalModel={null} setSelectedModelToPreview={setSelectedRow} />
                  
                </div>
              </Col>
              <Col lg={7} md={12} className="p-0 m-0">
              <div className="px-1">
                  <div className="styeld-left-border">
                    <table className="w-100">
                      <tbody>
                        <tr className="d-flex align-items-center py-1 border-bottom w-100">
                              <td style={{width:"15%"}} className="d-md-block d-none"><h6 className="px-3 text-bold">Location File</h6></td>
                              <td><div className="d-flex mx-3" >
                                  <input type="text" disabled value={`${selectedFileDetails!==null?selectedFileDetails.name:"Select excel file"}`} style={{minWidth: '300px',width: '400px'}} className="form-control d-md-block d-none" />
                                  <label role="button">
                                      <input hidden type="file" disabled={selectedRow.selected===false?true:false} onChange={handleSelectExcelFile} />
                                      <span className='btn btn-primary btn-sm rounded-end bg-custom-secondary d-flex align-items-center' style={{cursor: `${selectedRow.selected===false?"no-drop":"pointer"}`}}  disabled={selectedRow.selected===false?true:false}><div className='d-flex align-items-center' style={{height: '30px'}}>
                                              <BsUpload style={{height: '20px',width: 'auto'}} />
                                              <p  style={{width: '90px',margin: '0'}}>File Upload</p>
                                          </div>
                                      </span>
                                  </label>
                              </div></td>
                        </tr>
                        <tr className="d-flex align-items-center py-1 border-bottom w-100">
                            <td style={{width:"15%"}} className="d-md-block d-none"><h6 className="px-3 text-bold">Table Name</h6></td>
                            <td>
                              <div className="d-flex mx-3">
                                  {selectedFileDetails!==null?selectedFileDetails.name:"table.xlsx"}
                              </div>
                            </td>
                        </tr>
                        <tr className="d-flex align-items-center py-1 border-bottom w-100">
                          <td style={{width:"15%"}} className="d-md-block d-none">
                            <h6 className="px-3 text-bold">Quantity</h6>
                          </td>
                          <td>
                            <div className="d-flex mx-3" style={{width: '250px'}}>
                                <input type="number" placeholder='Enter Quantity' onChange={e=>setNumberOfCreate(e.target.value.trim())} min={1} className='form-control form-control-sm search-box' />
                                <button className='btn btn-sm btn-primary rounded-end bg-custom-secondary text-white' onClick={handleCreateFromUploadedLocationList}>Create</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {
                      notRegisteredTypes.length>0?<div className='my-1'>
                          <Alert variant='danger'>
                              <Alert.Heading>Types not registered{`(${notRegisteredTypes.length})`}</Alert.Heading>
                              <div className='my-3'>
                                  {
                                      notRegisteredTypes.map((item,i)=><span key={i} className="mx-1 p-1 text-bold bg-light rounded d-inline-block" style={{fontSize: '10px '}}>{i+1+") "+item.name}</span>)
                                  }
                              </div>
                          </Alert>
                      </div>:null
                    }
                    {
                      selectedFromLocationList.length>0?<div>
                      <Alert variant='success'>
                        <h6>{selectedFromLocationList.length} model will be created</h6>
                      </Alert>
                    </div>:null
                    }
                  
                    {
                      selectedFile!==null && selectedRow!==null?<div className='border mt-3 p-3'>
                      <DataTable 
                      columns={uploadedDataTableColumn}
  

                      data={selectedFile}
                      // selectableRowSelected={finalSelectionToSave.length>0?true:false}
                      customStyles={uploadedDataTableCustomStyle}
                      dense
                      highlightOnHover
                      selectableRows
                      selectableRowsNoSelectAll={false}
                      onSelectedRowsChange={e=>{
                        setSelectedFromLocationList(e.selectedRows)
                        if(e.selectedRows.length>0){
                          if(e.selectedCount===selectedFile.length){
                            setPreviewFinalData(false)
                          }else{
                            setPreviewFinalData(true)
                          }
                        }
                      }}
                      pagination
                      paginationPerPage={15}
                      paginationRowsPerPageOptions={[15,50,100,selectedFile.length]}
                      selectableRowsVisibleOnly={true}
                      selectableRowsHighlight
                      clearSelectedRows={clearSelectedRow}
                    />
                    {
                      selectedFile!==null?<div className='w-100 d-flex justify-content-center mt-3'>
                        <button className='btn btn-secondary rounded mx-1'>Cancel</button>
                        {
                          previewFinalData===true?<button className='btn btn-primary bg-custom-secondary rounded-0 text-white mx-1' onClick={()=>{
                            setSelectedFile(selectedFromLocationList)
                            setPreviewFinalData(false)
                          }}>Preview</button>:
                           <button className='btn btn-primary bg-custom-secondary rounded text-white mx-1' onClick={handleCreateModel}>{registrationStarted===true?<Spinner size="sm" animation="border" />:"save"}</button>
                        }
                        
                      </div>:null
                    }
                    </div>:null
                  }
              </div>
              </Col>
            </Row>
        </div>
    </Layot>
  )
}
