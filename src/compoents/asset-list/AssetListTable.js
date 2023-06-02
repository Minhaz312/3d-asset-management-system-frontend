import { Modal, Spinner } from 'react-bootstrap'
import React, {useEffect, useState} from 'react'
import {Form} from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { FaChevronLeft, FaChevronRight, FaLongArrowAltLeft, FaLongArrowAltRight, FaTrashAlt } from 'react-icons/fa'

import { Link } from 'react-router-dom'

import axios from 'axios'
import URL from '../../api/Routes'
import { ErrorToast, SuccessToast } from '../toast-alert/SuccessToast'
import ReactPaginate from 'react-paginate'
import { Alert } from 'react-bootstrap'
import Swal from 'sweetalert2'


export default function AssetListTable({defaultRowPerPage, rowDeletable,management, selectableRowsSingle, pageRangeDisplayed, marginPagesDisplayed, typeList,getSearchResult, searchKeyword,getAllAsset,data, setData, totalData, setTotalModel, setSelectedModelToPreview}) {
    const [selectedRows, setSelectedRows] = useState([])
    const [assetList, setAssetList] = useState({success:true, data:data.data})

    const [currentPage, setCurrentPage] = useState(0)
    const [rowPerPage, setRowPerPage] = useState(defaultRowPerPage)    
    const [currentType, setCurrentType] = useState("All")

    const [loadingDeletion, setLoadingDeletion] = useState(false)



    useEffect(()=>{
        getAllAsset(0,rowPerPage,currentType)
        if(searchKeyword!==""){
            getSearchResult(searchKeyword,0,rowPerPage,setData,setTotalModel)
        }
    },[rowPerPage])

    

   const handleDeleteModel = (id,filename,fileId) => {
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
                let uri = URL+`/asset/delete-model/single`
                const data = {id:id, filename:filename,fileId:fileId};
                const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
                axios.post(uri, {data: data},header).then(res=>{
                    if(res.status === 200 && res.data.success === true) {
                        getAllAsset(currentPage,rowPerPage,currentType)
                        SuccessToast("Successfully deleted")
                    }else{
                        ErrorToast("Failed to delete")
                    }
                }).catch(error=>{
        
                })
            }
        })
   }


   let columns;
   if(management){
       columns = [
           {
               name: "Type",
               selector: row=>row.modelType,
               width: '130px'
           },
           {
               name: "Name",
               selector: row=>row.modelNm,
               cell: row=>row.modelNm.join(", "),
               maxWidth: "320px" 
           },
           {
               name: "Date",
               selector: row=>row.createDt,
               cell: row=>{
                   let day = new Date(row.createDt).getDate();
                   let month = new Date(row.createDt).getMonth()+1;
                   if(month<10) month = "0"+month
                   let year = new Date(row.createDt).getFullYear();
                   return <span>{year+"-"+month+"-"+day}</span>
               }
           },
           {
               name: "Management",
               selector: row=>row.id,
               minWidth:"200px",
               cell: row=>
                   <div className='d-flex'>
                       <Link to={`/modify/${row._id}`} className='btn btn-sm btn-secondary bg-custom-secondary rounded-4px mx-1'>Modify</Link>
                       <button onClick={handleDeleteModel.bind(this, row._id, row.fileMeta.fileNm,row.fileMeta.fileId)} className='btn btn-sm btn-secondary rounded-4px mx-1'>Delete</button>
                   </div>
           },
       ]
    }else{
       columns = [
           {
               name: "Type",
               selector: row=>row.modelType,
               width: '130px'
           },
           {
               name: "Name",
               selector: row=>row.modelNm,
               cell: row=>row.modelNm.join(", "),
               minWidth: "320px" 
           },
           {
               name: "Date",
               selector: row=>row.createDt,
               cell: row=>{
                   let day = new Date(row.createDt).getDate();
                   let month = new Date(row.createDt).getMonth()+1;
                   if(month<10) month = "0"+month
                   let year = new Date(row.createDt).getFullYear();
                   return <span>{year+"-"+month+"-"+day}</span>
               }
           },
       ]
   }


    const customStyle = {
        headCells: {
            style: {
                fontSize: '20px',
                minHeight: '56px',
                paddingLeft: '16px',
                paddingRight: '8px',
            },
        },
    }

    



    const handleDeleteSelectedItems = () => {
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
                let deleteAbleRows = []
                selectedRows.map(item=> {
                    let data = {id:item._id};
                    deleteAbleRows.push({id:item._id,filename:item.fileMeta.fileNm,fileId:item.fileMeta.fileId});
                })
                let listOfModelToDelete = [];
                listOfModelToDelete.push(selectedRows[0].fileMeta.fileNm)
                selectedRows.map(item=> {
                    let available = false;
                    listOfModelToDelete.map(prev=>{
                        if(item.fileMeta.fileNm===prev){
                            available=true;
                        }
                    })
                    if(available!==true){
                        listOfModelToDelete.push(item.fileMeta.fileNm);
                    }
                })
                setLoadingDeletion(true)
                const uri = URL+"/asset/delete-model/multiple"
                const header = {headers:{"Authorization":sessionStorage.getItem("token")}}
                axios.post(uri,{deleteRows:deleteAbleRows},header).then(res=>{
                    if(res.status === 200 && res.data.success === true) {
                        setSelectedRows([])
                        getAllAsset(currentPage,rowPerPage,currentType);
                        if(searchKeyword!==""){
                            getSearchResult(searchKeyword,currentPage,rowPerPage,setData,setTotalModel);
                        }
                        setLoadingDeletion(false)
                        SuccessToast("Successfully Deleted")
                    }else{
                        ErrorToast("failed to delete models")
                    }
                }).catch(error=> {
                    ErrorToast("failed to delete models")
                })
            }
          })
    }

    const handleSelectRow = (row) => {
        if(management) {
            setSelectedModelToPreview({selected: true, data: row})
        }
    }

    const handleSelectType = e => {
        const type = e.target.value.trim();
        const formatedType = type.charAt(0).toUpperCase()+type.slice(1)
        setRowPerPage(defaultRowPerPage)
        setCurrentType(formatedType)
        getAllAsset(0,rowPerPage,formatedType)
    }


let totalPage = Math.ceil(totalData/rowPerPage)

const handleSelectedRows = e => {
    if(e.selectedCount>0){
        setSelectedRows(e.selectedRows)
        if(!management && e.selectedRows.length>0){
            setSelectedModelToPreview({selected: true, data: e.selectedRows})
        }
    }else{
        setSelectedRows([])
        setSelectedModelToPreview({selected: false, data: []})
    }
}

const previousPaginationButton = () => {
    return <div className='d-flex align-items-center py-0 my-0 fs-4'><FaChevronLeft className='d-inline' /></div>
}
const nextPaginationButton = () => {
    return <div className='d-flex align-items-center py-0 my-0 fs-4'><FaChevronRight /></div>
}


    // if(totalData===0){
    //     return <h5 className='text-center text-muted my-5'>No model registered!</h5>
    // }

  return (
    <div className="px-3 mt-1">
        <div className='d-flex justify-content-between mb-1'>
            <span className="d-flex">
                <Form.Select  onChange={e=>{
                    if(e.target.value>totalData){
                        alert(`Please select less than ${totalData}`)
                    }else{
                        setRowPerPage(e.target.value)
                    }
                }}>
                    <option disabled>Model per page</option>
                    <option value={defaultRowPerPage}>{defaultRowPerPage}(default)</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={300}>300</option>
                </Form.Select>
            </span>
            
            <div className='d-flex justify-content-between'>
                {
                    rowDeletable===true?<>
                    
                        {
                            loadingDeletion===false?<button 
                            className='btn bg-light mx-3 border-0' 
                            disabled={selectedRows.length>0?false:true}
                            onClick={handleDeleteSelectedItems}
                            ><FaTrashAlt /></button>:
                            <button 
                            className='btn bg-light mx-3 border-0'><Spinner size="sm" animation="border" /></button>
                        }
                    
                    </>:<span></span>
                }
                
                <Form.Select  onChange={handleSelectType}>
                    <option>Select type</option>
                    <option>All</option>
                    {typeList.data.map((item,i)=> <option key={i}>{item.name}</option>)}
                </Form.Select>
            </div>
        </div>
        {
            selectedRows.length>0?<span><Alert className='py-1' variant="success"><b>{selectedRows.length}</b> items selected</Alert></span>:null
        }
                {
                    totalData!==0?
                    <div style={{position:"relative"}}>
                        {
                            loadingDeletion===true?<div style={{position:"absolute",top:"0",left:"0",height:"100%",width:"100%",background:"rgb(0,0,0,0.001)",zIndex:"3"}} className="text-center pt-5">
                            </div>:null
                        }
                    <DataTable
                    columns={columns}
                    data={data.data}
                    customStyles={customStyle}
                    responsive={true}
                    selectableRowsSingle={selectableRowsSingle}
                    selectableRowsVisibleOnly={!selectableRowsSingle}
                    onSelectedRowsChange={handleSelectedRows}
                    onRowClicked={handleSelectRow}
                    highlightOnHover
                    selectableRowsHighlight
                    selectableRows
                />
                <div className='d-flex justify-content-md-center justify-content-start flex-start mt-3' style={{overflowX:"auto"}}>
        <div>
        <ReactPaginate  
            breakLabel="..."
            nextLabel={nextPaginationButton()}
            previousLabel={previousPaginationButton()}
            renderOnZeroPageCount={null}
            pageCount={totalPage}
            containerClassName="paginations"
            initialPage={0}
        
            pageClassName='page-item'
            pageLinkClassName='page-link'
            previousLinkClassName='page-link'
            nextLinkClassName='page-link'
            activeClassName='actives'
            disabledLinkClassName="paginate-next-previous-button"
            pageRangeDisplayed={pageRangeDisplayed}
            marginPagesDisplayed={marginPagesDisplayed}
        
            onPageChange={e=>{
                setCurrentPage(e.selected)
                if(searchKeyword!==""){
                    getSearchResult(searchKeyword,e.selected,rowPerPage,setData,setTotalModel)
                }else{
                    getAllAsset(e.selected,rowPerPage, currentType)
                }
            }}
            onPageActive={e=>{
                if(searchKeyword!==""){
                    getSearchResult(searchKeyword,e.selected,rowPerPage,setData,setTotalModel)
                }else{
                    getAllAsset(e.selected,rowPerPage, currentType)
                }
                setCurrentPage(e.selected)
            }}
            
            onClick={e=>{
                
            }}
            

            />
        </div>
        
        </div>
                
                </div>:<h5 className='text-center text-muted my-5'>No model registered!</h5>
                }
    
    </div>
  )
}
