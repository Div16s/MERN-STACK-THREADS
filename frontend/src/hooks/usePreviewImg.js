import {useState} from 'react'
import useShowToast from './useShowToast';

const usePreviewImg = () => {
    const [imgUrl, setImgUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        //console.log("File: ",file);

        if(file && file.type.startsWith('image/')){
            const reader = new FileReader();

            reader.onloadend = () => {
                setImgUrl(reader.result);
            }

            reader.readAsDataURL(file);
        }
        else{
            showToast("Invalid Image","Please select a valid image file","error");
            setImgUrl(null);
        }
    };

    //console.log("ImgUrl: ",imgUrl);
    return {handleImageChange, imgUrl, setImgUrl};
}

export default usePreviewImg