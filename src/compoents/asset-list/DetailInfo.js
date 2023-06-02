import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap';
import { BsUpload } from 'react-icons/bs';
import URL from '../../api/Routes';
import Viewer from '../3d/3DViewer';

export default function DetailInfo({defaultModel}) {
    let complex = defaultModel.complex
    let address = defaultModel.numberAddr
    let filename = defaultModel.fileMeta.fileNm
    let fileId = defaultModel.fileMeta.fileId
    let latitude = defaultModel.fileMeta.loc.coordinates[1]
    let longitude = defaultModel.fileMeta.loc.coordinates[0]
    let altitude = defaultModel.fileMeta.altitude
    let {heading,pitch,roll} = defaultModel.fileMeta.orientation
    let height = defaultModel.fileMeta.height
    let type = defaultModel.modelType
    let resolutions = defaultModel.resolution
    let unique = defaultModel.unique
    let scale = defaultModel.fileMeta.scale
    let modelNames = defaultModel.modelNm


    const [exist, setExist] = useState(null)
    const [singleModelUploaded, setSingleModelUploaded] = useState({success:false,filename:null, message:null})



    useEffect(()=>{
        const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
         axios.get(URL+`/asset/check-single-model-exist/${fileId}`,header).then(res=>{
            if(res.status===200 && res.data.existFile===true) {
                setExist(true)
            }else{
                setExist(true)
            }
        }).catch(error=>{
            setExist(false)
        })
    },[defaultModel])



    const uploadModel = async (e) => {
        const file = e.target.files[0];
        const uri = URL+"/asset/upload-model/single"
        

        const formData = new FormData();

        formData.append("singleModel",file);

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




  return (
    <div className='border rounded p-3'>
        <h4>Detail Info</h4>
        <div className='bg-dark text-white' style={{position:"relative",height: '400px'}}>
           {
            exist!==null?<>{exist===true?<Viewer height="400px" width="auto" filelocation={`${process.env.REACT_APP_API_URL}/storage/3d-model/${fileId}`} />:<div className='d-flex justify-content-center align-items-center' style={{height: '100%',flexDirection:"column"}}>
                <h5 className='text-white'>Model is not uploaded</h5>
                <label role="button">
                    <input hidden type="file" onChange={uploadModel} />
                    <span className='btn btn-primary btn-sm rounded-0 bg-custom-secondary d-flex align-items-center'><div className='d-flex align-items-center' style={{height: '30px'}}>
                            <BsUpload style={{height: '20px',width: 'auto'}} />
                            <p  style={{width: '90px',margin: '0'}}>File Upload</p>
                        </div>
                    </span>
                </label>
            </div>}</>:<h3 className='text-white' style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}>Loading...</h3>
           }
        </div>
        <table className='table text-center'>
            <tbody>
                <tr>
                    <td>Industrial Park</td>
                    <td>{complex}</td>
                </tr>
                <tr>
                    <td>Address</td>
                    <td>{address}</td>
                </tr>
                <tr>
                    <td>Latitude</td>
                    <td>{latitude}</td>
                </tr>
                <tr>
                    <td>Longitude</td>
                    <td>{longitude}</td>
                </tr>
                <tr>
                    <td>Altitude</td>
                    <td>{altitude}</td>
                </tr>
                <tr>
                    <td>Height</td>
                    <td>{height}</td>
                </tr>
                <tr>
                    <td>Heading</td>
                    <td>{heading}</td>
                </tr>
                <tr>
                    <td>Pitch</td>
                    <td>{pitch}</td>
                </tr>
                <tr>
                    <td>Role</td>
                    <td>{roll}</td>
                </tr>
                <tr>
                    <td>Scale</td>
                    <td>{scale}</td>
                </tr>
                <tr>
                    <td>Type</td>
                    <td>{type}</td>
                </tr>
                <tr>
                    <td>Filename</td>
                    <td>{filename}</td>
                </tr>
                <tr>
                    <td>Image Resolution</td>
                    <td>{resolutions}</td>
                </tr>
                <tr>
                    <td>Unique</td>
                    <td>{`${unique}`}</td>
                </tr>
            </tbody>
        </table>
    </div>
  )
}
