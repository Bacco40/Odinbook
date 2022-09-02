import axios from 'axios';
import defaultProfile from './profile.jpg';
import loadingGif2 from './loading2.gif';
import {useEffect, useState} from 'react';
import {getStorage,ref,uploadBytesResumable,getDownloadURL} from 'firebase/storage';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faImages, faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faXmark, faImages);

function EditPost({profile,uploading, setUploading, post}){
    const [image,setImage] = useState(null);
    const [imageUrl,setImageUrl] = useState(null);

    function closePostForm(e){
        e.preventDefault();
        document.querySelector(`.createPost[name="${post._id}"]`).style.cssText = 'display:none;';
        setImage(null);
        setImageUrl(post.image_url[0]);
        document.body.style.overflow = ``;
    }

    function addImage(e){
        e.preventDefault();
        document.querySelector(`.uploadPostImg[name="${post._id}"]`).click();
    }

    function uploadImage(e){
        const file = e.target.files[0];
        if (file.type.match('image.*')){
          setImageUrl(URL.createObjectURL(file));
          setImage(file)
          document.querySelector(`.postPicContainer[name="${post._id}"]`).style.cssText = 'display:flex;';
        }
      }

    function removePic(e){
        e.preventDefault();
        document.querySelector(`.postPicContainer[name="${post._id}"]`).style.cssText = 'display:none;';
        setImage(null);
        setImageUrl(null);
    }      

    async function savePost(e){
        e.preventDefault();
        setUploading(true);
        const postContent= document.querySelector(`.postText[name="${post._id}"]`).value;
        const user = localStorage.getItem('user');
        const likes = post.likes;
        const comments = post.comments;
        const date_of_creation = post.date_of_creation;
        let image_url=null;
        try {
            if(image !== null){
                const filePath = `${profile._id}/posts/${image.name}`;
                const newImageRef = ref(getStorage(), filePath);
                const fileSnapshot = await uploadBytesResumable(newImageRef, image);
                image_url = await getDownloadURL(newImageRef);
                axios.put(`/api/post/${post._id}/update`, {image_url,postContent,user,comments,likes,date_of_creation})
                    .then(res => {
                        if(!res.data.errors){
                            closePostForm(e);
                            setUploading(false)
                        }else{
                            console.log(res.data.errors)
                        }
                    }) 
            }
            else if(image === null && imageUrl !== null){
                image_url=imageUrl;
                axios.put(`/api/post/${post._id}/update`, {image_url,postContent,user,comments,likes,date_of_creation})
                    .then(res => {
                        if(!res.data.errors){
                            closePostForm(e);
                            setUploading(false)
                        }else{
                            console.log(res.data.errors)
                        }
                    }) 
            }
            else{
                axios.put(`/api/post/${post._id}/update`, {postContent,user,comments,likes,date_of_creation})
                    .then(res => {
                        if(!res.data.errors){
                            closePostForm(e);
                            setUploading(false);
                        }else{
                            console.log(res.data.errors)
                        }
                    }) 
            }
        }
        catch(error) {
            console.error('Error uploading the image to Firebase Database', error);
        }
    }

    useEffect(()=>{
        if(uploading === true && post){
            document.querySelector(`.buttonMenu[name="${post._id}"]`).innerHTML = `<img src=${loadingGif2} class='smallLoad' alt='Loading..'/>`
            document.querySelector(`.buttonMenu[name="${post._id}"]`).style.cssText = 'padding:8.5px; cursor: not-allowed;';
        }
        if(uploading === false && post){
            document.querySelector(`.buttonMenu[name="${post._id}"]`).innerHTML = 'Post';
            document.querySelector(`.buttonMenu[name="${post._id}"]`).style.cssText = 'padding:15px;';
        }
    },[uploading,post])

    useEffect(()=>{
        if(post && post.image_url[0]){
            setImageUrl(post.image_url[0]);
            document.querySelector(`.postPicContainer[name="${post._id}"]`).style.cssText = 'display:flex;';
        }
        else{
            document.querySelector(`.postPicContainer[name="${post._id}"]`).style.cssText = 'display:none;';
        }
    },[post])
    
    return (
        <>
        { post &&
            <div className='createPost' name={post._id}>
                <form className='formUpdate' id='formPost'>
                    <div className='formTitle'>
                        <div></div>
                        <div>
                            <h2 className='updateTitle'>Edit Post</h2>
                        </div>
                        <div className='closeForm' id='circleClose' onClick={(e)=> closePostForm(e)}>
                            <FontAwesomeIcon icon="fa-solid fa-xmark" />
                        </div>
                    </div>
                    <div className="formContent">
                        <hr/>
                        <div className='userDetailContainer'>
                            <img className='smallProfilePic' src={profile.profile_pic ? profile.profile_pic : defaultProfile} alt='profile pic'/>
                            <div className='profileFullName'>{profile.name} {profile.surname}</div>
                        </div>
                        <textarea className="postText" name={post._id} minLength="3" defaultValue={post.post} placeholder={`What's on your mind, ${profile.name} ?`} />
                        <div className='postPicContainer' name={post._id}>
                            {imageUrl !== null &&
                            <div className='postPrev'>
                                <img className='postPicSmall' src={imageUrl} alt='uploaded pic'/>
                                <div className='closeForm' id='removePic' onClick={(e)=> removePic(e)}>
                                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                                </div>
                            </div>
                            }
                        </div>
                        <button className='attachImage' onClick={(e)=>addImage(e)}>
                            <div>Add picture to your post</div> 
                            <FontAwesomeIcon icon="fa-solid fa-images" />
                        </button>
                        <div className='errorReg'></div>
                        <input className='uploadPostImg' name={post._id} type="file" onChange={(e)=>uploadImage(e)}></input>
                        <button className="buttonMenu" id="postPost" name={post._id} onClick={(e) => savePost(e)}>Post</button>
                    </div>
                </form>
            </div>
        }
        </>
    )
}
export default EditPost;