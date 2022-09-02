import axios from 'axios';
import defaultProfile from './profile.jpg';
import loadingGif2 from './loading2.gif';
import {useEffect, useState} from 'react';
import {getStorage,ref,uploadBytesResumable,getDownloadURL} from 'firebase/storage';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faImages, faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faXmark, faImages);

function CreatePost({profile,uploading, setUploading}){
    const [image,setImage] = useState(null);
    const [imageUrl,setImageUrl] = useState(null);

    function closePostForm(e){
        e.preventDefault();
        document.querySelector('.createPost').style.cssText = 'display:none;';
        setImage(null);
        setImageUrl(null);
        document.body.style.overflow = ``;
    }

    function openPostForm(e){
        e.preventDefault();
        const y=window.scrollY;
        document.querySelector('.postPicContainer').style.cssText = 'display:none;';
        document.querySelector('.createPost').style.cssText = `display:flex; top:${y}px`;
        document.querySelector('.postText').focus();
        document.body.style.overflow = "hidden";
    }

    function addImage(e){
        e.preventDefault();
        document.querySelector('.uploadPostImg').click();
    }

    function uploadImage(e){
        const file = e.target.files[0];
        if (file.type.match('image.*')){
          setImageUrl(URL.createObjectURL(file));
          setImage(file)
          document.querySelector('.postPicContainer').style.cssText = 'display:flex;';
        }
      }

    function removePic(e){
        e.preventDefault();
        document.querySelector('.postPicContainer').style.cssText = 'display:none;';
        setImage(null);
        setImageUrl(null);
    }      

    async function savePost(e){
        e.preventDefault();
        setUploading(true);
        const postContent= document.querySelector('.postText').value;
        const user = localStorage.getItem('user');
        let image_url=null;
        try {
            if(imageUrl!==null){
                const filePath = `${profile._id}/posts/${image.name}`;
                const newImageRef = ref(getStorage(), filePath);
                const fileSnapshot = await uploadBytesResumable(newImageRef, image);
                image_url = await getDownloadURL(newImageRef);
                axios.post(`/api/post/create`, {image_url,postContent,user})
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
                axios.post(`/api/post/create`, {postContent,user})
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
        if(uploading === true){
            document.querySelector('#postPost').innerHTML = `<img src=${loadingGif2} class='smallLoad' alt='Loading..'/>`
            document.querySelector('#postPost').style.cssText = 'padding:8.5px; cursor: not-allowed;';
        }
        if(uploading === false){
            document.querySelector('#postPost').innerHTML = 'Post';
            document.querySelector('#postPost').style.cssText = 'padding:15px;';
        }
    },[uploading])
    
    return (
        <>
            <div className='profilePart' id='createPost'>
                <img className='smallProfilePic' src={profile.profile_pic ? profile.profile_pic : defaultProfile} alt='profile pic'/>
                <button className='fakeInput' onClick={(e)=>openPostForm(e)}>What's on your mind, {profile.name} ?</button>
            </div> 
            <div className='createPost'>
                <form className='formUpdate' id='formPost'>
                    <div className='formTitle'>
                        <div></div>
                        <div>
                            <h2 className='updateTitle'>Create Post</h2>
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
                        <textarea className="postText" minLength="3" placeholder={`What's on your mind, ${profile.name} ?`} />
                        <div className='postPicContainer'>
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
                        <input className='uploadPostImg' type="file" onChange={(e)=>uploadImage(e)}></input>
                        <button className="buttonMenu" id="postPost" onClick={(e) => savePost(e)}>Post</button>
                    </div>
                </form>
            </div>
        </>
    )
}
export default CreatePost;