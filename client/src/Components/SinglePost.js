import axios from 'axios';
import defaultProfile from './profile.jpg';
import moment from 'moment';
import SingleComment from './SingleComment';
import Snackbar from './Snackbar';
import {Link,useNavigate} from 'react-router-dom';
import React from 'react';
import {useEffect, useState,useRef} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faEllipsis, faPencil, faShare, faTrashCan} from '@fortawesome/free-solid-svg-icons';
import {faBookmark, faMessage, faPaperPlane, faThumbsUp} from '@fortawesome/free-regular-svg-icons';
library.add(faEllipsis, faThumbsUp,faMessage,faShare,faPaperPlane, faPencil,faTrashCan,faBookmark);

function SinglePost({singlePost,currentUser,setUploading, setUpdateCurrentUser}){
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);
    const [open,setOpen] = useState(false);
    const [currentUserLiked, setCurrentUserLiked] = useState(false);
    const [currentUserSaved, setCurrentUserSaved] = useState(false);
    const [message, setMessage] = useState("");
    const snackbarRef = useRef(null);

    function addComment(e,idPost){
        e.preventDefault();
        setUploading(true);
        setUpdateCurrentUser(false)
        const comment = document.querySelector(`.commentAdd[name="${idPost}"]`).value;
        const user = localStorage.getItem('user');
        const creator = singlePost.creator._id;
        axios.post(`/api/comment/${idPost}/create`, {comment,user,creator})
            .then(res => {
                if(!res.data.errors){
                    document.querySelector(`.commentAdd[name="${idPost}"]`).value ='';
                    setUploading(false)
                    setUpdateCurrentUser(true)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function deletePost(e){
        e.preventDefault();
        document.querySelector(`.postMenu[name="${singlePost._id}"]`).style.cssText="display:none !important;";
        setOpen(false)
        setUploading(true);
        axios.delete(`/api/post/${singlePost._id}/delete`)
            .then(res => {
                if(!res.data.errors){
                    setUploading(false)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function openPostMenu(e){
        e.preventDefault();
        if(open === false){
            if(currentUser._id === singlePost.creator._id){
                document.querySelector(`.postMenu[name="${singlePost._id}"]`).style.cssText="display:flex !important;";
            }
            else{
                document.querySelector(`.postMenu[name="${singlePost._id}"]`).style.cssText="display:flex !important;margin-top:65px;";
            }
            setOpen(true)
        }
        else{
            document.querySelector(`.postMenu[name="${singlePost._id}"]`).style.cssText="display:none !important;";
            setOpen(false)
        }
    }

    function userLiked(e){
        e.preventDefault(e);
        setUploading(true);
        setUpdateCurrentUser(false);
        const user_id = currentUser._id;
        const creator = singlePost.creator._id;
        axios.put(`/api/post/${singlePost._id}/like` , {user_id, creator})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                    setUploading(false)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function userNotLiked(e){
        e.preventDefault(e);
        setUploading(true);
        setUpdateCurrentUser(false);
        const user_id = currentUser._id;
        axios.put(`/api/post/${singlePost._id}/removeLike` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUploading(false)
                    setUpdateCurrentUser(true)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function postSaved(e){
        e.preventDefault(e);
        setUpdateCurrentUser(false)
        const user_id = currentUser._id;
        axios.put(`/api/post/${singlePost._id}/saved` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                    openPostMenu(e)
                    setMessage('Post saved successfully!')
                    snackbarRef.current.show();
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function postRemovedSaved(e){
        e.preventDefault(e);
        setUpdateCurrentUser(false)
        const user_id = currentUser._id;
        axios.put(`/api/post/${singlePost._id}/removeSaved` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                    openPostMenu(e)
                    setMessage('Post saved successfully!')
                    snackbarRef.current.show();
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function currentUserSave(){
        let isIn = 0;
        for(let i=0; i < currentUser.saved_post.length; i++){
            if(singlePost._id === currentUser.saved_post[i]){
                setCurrentUserSaved(true);
                isIn=1;
            }
        }
        if(isIn === 0){
            setCurrentUserSaved(false)
        }
    }

    function currentUserLike(){
        let isIn = 0;
        for(let i=0; i < singlePost.likes.length; i++){
            if(currentUser._id === singlePost.likes[i]){
                setCurrentUserLiked(true);
                isIn=1;
            }
        }
        if(isIn === 0){
            setCurrentUserLiked(false)
        }
    }

    function copyUrl(){
        navigator.clipboard.writeText(`http://localhost:3000/#/post/${singlePost._id}`);
        setMessage('Post link copied in the clipboard!')
        snackbarRef.current.show();
    }

    function openPostEditForm(e){
        e.preventDefault();
        const y=window.scrollY;
        document.querySelector(`.createPost[name="${singlePost._id}"]`).style.cssText = `display:flex; top:${y}px`;
        document.querySelector('.postText').focus();
        document.body.style.overflow = "hidden";
    }

    function commentButtonClick(e){
        e.preventDefault(e);
        document.querySelector(`.commentAdd[name="${singlePost._id}"]`).focus();
    }

    function useOutsideAlerter(ref) {
        useEffect(() => {
          function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                document.querySelector(`.postMenu[name="${singlePost._id}"]`).style.cssText="display:none !important;";
                setOpen(false)
            }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref]);
      }

    useEffect(()=>{
        if(SinglePost){
          currentUserLike()
          currentUserSave()
        }
      },[singlePost])
    
    return (
        <div className='profilePart' id='singlePost'>
            <div className='postTop'>
                <Link to={`/profile/${singlePost.creator._id}`} className='standard'>
                    <img className='smallProfilePic' src={singlePost.creator.profile_pic ? singlePost.creator.profile_pic : defaultProfile} alt='profile pic'/>
                    <div className='postBasicDetail'>
                        <div className='profileFullName'>{singlePost.creator.name} {singlePost.creator.surname}</div>
                        <div className='smallDesc'>{moment(singlePost.date_of_creation).fromNow()}</div>
                    </div> 
                </Link>
                <div ref={wrapperRef} className='menuContainer'>
                    <FontAwesomeIcon className='dropMenu' icon="fa-solid fa-ellipsis" onClick={(e) => openPostMenu(e)}/>
                    <div className='postMenu' name={singlePost._id} >
                        {currentUserSaved === false &&
                            <button className='dropButton2' onClick={(e)=> postSaved(e)}>
                                <FontAwesomeIcon className='circleSave' icon="fa-regular fa-bookmark" />
                                <div>Save Post</div>
                            </button>
                        }
                        {currentUserSaved === true &&
                            <button className='dropButton2' onClick={(e)=> postRemovedSaved(e)}>
                                <FontAwesomeIcon className='circleSave' id='saved' icon="fa-regular fa-bookmark" />
                                <div>Post Saved</div>
                            </button>
                        }
                        {currentUser._id === singlePost.creator._id &&
                        <>
                            <button className='dropButton2' onClick={(e) => openPostEditForm(e)}>
                                <FontAwesomeIcon className='circleLogOut' icon="fa-solid fa-pencil" />
                                <div>Edit Post</div>
                            </button>
                            <button className='dropButton2' onClick={(e)=>deletePost(e)}>
                                <FontAwesomeIcon className='circleLogOut' icon="fa-solid fa-trash-can" />
                                <div>Delete Post</div>
                            </button>
                        </>}
                    </div>
                </div>
            </div>
            <div className='actualPost'>
                <div className='postCaption'>{singlePost.post}</div>
                {singlePost.image_url.map((singleImage, index)=>(
                    <Link key={index} to={`/post/${singlePost._id}`}>
                        <div className='sameHeigthContainer'>
                            <img className='postPic'  src={singleImage} alt=''/>
                        </div>
                    </Link>
                ))}
            </div>
            {singlePost.likes.length > 0 &&
                <div className='likeNumberContainer'>
                    <div className='standard'>
                    {singlePost.likes.length > 0 &&
                        <>
                            <div className='smallLike'>
                                <FontAwesomeIcon icon="fa-regular fa-thumbs-up" />
                            </div>
                            {currentUserLiked === true && singlePost.likes.length > 1 &&
                                <div className='greyText'>You and {singlePost.likes.length -1} others</div>
                            }
                            {currentUserLiked === true && singlePost.likes.length === 1 &&
                                <div className='greyText'>You liked this</div>
                            }
                            {currentUserLiked === false &&
                                <div className='greyText'>{singlePost.likes.length}</div>
                            }
                        </>
                    }
                    </div>
                    {singlePost.comments.length === 1 &&
                        <Link to={`/post/${singlePost._id}`} className='greyText'>{singlePost.comments.length} comment</Link>
                    }
                    {singlePost.comments.length > 1 &&
                        <Link to={`/post/${singlePost._id}`} className='greyText'>{singlePost.comments.length} comments</Link>
                    }
                </div>  
            }
            {singlePost.comments.length > 0 && singlePost.likes.length === 0 &&
                <div className='likeNumberContainer'>
                    <div className='standard'>
                    </div>
                    {singlePost.comments.length === 1 &&
                        <Link to={`/post/${singlePost._id}`} className='greyText'>{singlePost.comments.length} comment</Link>
                    }
                    {singlePost.comments.length > 1 &&
                        <Link to={`/post/${singlePost._id}`} className='greyText'>{singlePost.comments.length} comments</Link>
                    }
                </div>  
            }
            <hr className='hrPost'/>
            <div>
                <div className='postButton'>
                    {currentUserLiked === false &&
                        <div className='buttonPost' onClick={(e)=>userLiked(e)}><FontAwesomeIcon icon="fa-regular fa-thumbs-up" /> Like</div>
                    }
                    {currentUserLiked === true &&
                        <div className='buttonPost' id='liked' onClick={(e)=>userNotLiked(e)}><FontAwesomeIcon icon="fa-regular fa-thumbs-up" /> Like</div>
                    }
                    <div className='buttonPost' onClick={(e)=> commentButtonClick(e)}><FontAwesomeIcon icon="fa-regular fa-message" /> Comment</div>
                    <div className='buttonPost' onClick={copyUrl}><FontAwesomeIcon icon="fa-solid fa-share" /> Share</div>
                </div><hr className='hrPost'/>
            </div>
            {singlePost.comments.length > 3 &&
                <Link to={`/post/${singlePost._id}`} className='smallDescLink'>See all the {singlePost.comments.length} comments</Link>
            }
            {singlePost.comments.map((comment,index)=>(
                <React.Fragment key={index} >
                    {index < 3 &&
                        <SingleComment comment={comment} currentUser={currentUser} setUploading={setUploading} setUpdateCurrentUser={setUpdateCurrentUser} singlePost={singlePost}/> 
                    }
                </React.Fragment>
            ))}
            <div className='addComment'>
                <img className='smallProfilePic' src={currentUser.profile_pic ? currentUser.profile_pic : defaultProfile} alt='profile pic'/>
                <input type='text' className='commentAdd' name={singlePost._id} placeholder='Write a comment...' onKeyPress={(e) => e.key === 'Enter' && addComment(e,singlePost._id)}/>
                <FontAwesomeIcon className="sendIcon" icon="fa-regular fa-paper-plane" onClick={(e)=>addComment(e,singlePost._id)}/>
            </div>
            <Snackbar ref={snackbarRef} message={message}/>
        </div> 
    )
}
export default SinglePost;