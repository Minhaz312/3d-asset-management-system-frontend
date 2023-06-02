import { toast } from 'react-toastify'

function SuccessToast(msg) {
  toast.success(msg,{
    position: 'top-center',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  })
}

function ErrorToast(msg){
    toast.error(msg,{
        position: 'top-center',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    })
}
function WarningToast(msg){
    toast.warning(msg,{
        position: 'top-center',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
}

export {SuccessToast, ErrorToast, WarningToast}
