import axios from 'axios';
import defaultProfile from './profile.jpg';
import loadingGif from './loading.gif';
import React from 'react';
import moment from 'moment';
import SingleComment from './SingleComment';
import Snackbar from './Snackbar';
import EditPost from './EditPost';
import {Link,useNavigate, useParams} from 'react-router-dom';
import {useEffect, useState, useRef} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faFacebook} from "@fortawesome/free-brands-svg-icons";
library.add(faFacebook);


function PostDetail({logged,currentUser, setUpdateCurrentUser}){
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [currentUserLiked,setCurrentUserLiked ] = useState(false);
    const [currentUserSaved, setCurrentUserSaved] = useState(false);
    const wrapperRefPost = useRef(null);
    useOutsideAlerter(wrapperRefPost);
    const redirect = useNavigate();
    const {id} = useParams();
    const snackbarRef = useRef(null);
    const [message, setMessage] = useState("");

    function addComment(e,idPost){
        e.preventDefault();
        setUploading(true);
        setUpdateCurrentUser(false)
        const comment = document.querySelector(`.commentAdd[name="${idPost}"]`).value;
        const user = localStorage.getItem('user');
        const creator = post.creator._id;
        axios.post(`/api/comment/${idPost}/create`, {comment,user,creator})
            .then(res => {
                if(!res.data.errors){
                    document.querySelector(`.commentAdd[name="${idPost}"]`).value ='';
                    setUploading(false);
                    setUpdateCurrentUser(true);
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function deletePost(e){
        e.preventDefault();
        document.querySelector(`.postMenuDetail[name="${post._id}"]`).style.cssText="display:none !important;";
        setOpen(false)
        setUploading(true);
        axios.delete(`/api/post/${post._id}/delete`)
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
            if(currentUser._id === post.creator._id){
                document.querySelector(`.postMenuDetail[name="${post._id}"]`).style.cssText="display:flex !important;";
            }
            else{
                document.querySelector(`.postMenuDetail[name="${post._id}"]`).style.cssText="display:flex !important;margin-top:65px;";
            }
            setOpen(true)
        }
        else{
            document.querySelector(`.postMenuDetail[name="${post._id}"]`).style.cssText="display:none !important;";
            setOpen(false)
        }
    }

    function userLiked(e){
        e.preventDefault(e);
        setUploading(true);
        setUpdateCurrentUser(false);
        const user_id = currentUser._id;
        const creator = post.creator._id;
        axios.put(`/api/post/${id}/like` , {user_id, creator})
            .then(res => {
                if(!res.data.errors){
                    setUploading(false)
                    setUpdateCurrentUser(true)
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
        axios.put(`/api/post/${id}/removeLike` , {user_id})
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
        axios.put(`/api/post/${post._id}/saved` , {user_id})
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
        axios.put(`/api/post/${post._id}/removeSaved` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                    openPostMenu(e)
                    setMessage('Post removed from saved!')
                    snackbarRef.current.show();
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function currentUserSave(){
        let isIn = 0;
        for(let i=0; i < currentUser.saved_post.length; i++){
            if(post._id === currentUser.saved_post[i]){
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
        for(let i=0; i < post.likes.length; i++){
            if(currentUser._id === post.likes[i]){
                setCurrentUserLiked(true);
                isIn=1;
            }
        }
        if(isIn === 0){
            setCurrentUserLiked(false)
        }
    }

    function recovePost(){
        axios.get(`/api/post/${id}`)
          .then(res => {
            if(res.data.post){
              setPost(res.data.post)
            }
            else{
              redirect('/login');
            }
          })
    }

    function closePost(e){
        e.preventDefault();
        redirect(-1);
        document.body.style.overflow = "";
    }

    function copyUrl(){
        navigator.clipboard.writeText(window.location.href);
        setMessage('Post link copied in the clipboard!')
        snackbarRef.current.show();
    }

    function openPostEditForm(e){
        e.preventDefault();
        const y=window.scrollY;
        document.querySelector(`.createPost[name="${post._id}"]`).style.cssText = `display:flex; top:${y}px`;
        document.querySelector('.postText').focus();
        document.body.style.overflow = "hidden";
    }

    function commentButtonClick(e){
        e.preventDefault(e);
        document.querySelector(`.commentAdd[name="${id}"]`).focus();
    }

    function useOutsideAlerter(ref) {
        useEffect(() => {
            function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                document.querySelector(`.postMenuDetail[name="${id}"]`).style.cssText="display:none !important;";
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
        if(post){
            currentUserLike();
            currentUserSave();
            setLoading(false);
        }
    },[post])  

    useEffect(()=>{
        if(logged && currentUser && uploading === false){
            recovePost();
        }
    },[logged, currentUser,uploading, id])

    return (
        <>
            {logged === true && loading === false && post && post.image_url[0] &&
                <div className='bigPostContainer'>
                    <div className='postImageContainer'>
                        <div>
                            <div className='buttonEffect'>
                                <FontAwesomeIcon icon="fa-solid fa-xmark" className='xMark' onClick={(e)=>closePost(e)} />
                            </div>
                            <img className='bigAssImage' src={post.image_url[0]} alt={post.post}/>
                        </div>
                    </div>
                    <div className='postDetailBig'>
                        <div className='postTop'>
                            <div>
                                <img className='smallProfilePic' src={post.creator.profile_pic ? post.creator.profile_pic : defaultProfile} alt='profile pic'/>
                                <div className='postBasicDetail'>
                                    <div className='profileFullName'>{post.creator.name} {post.creator.surname}</div>
                                    <div className='smallDesc'>{moment(post.date_of_creation).fromNow()}</div>
                                </div> 
                            </div>
                            <div ref={wrapperRefPost} className='menuContainer'>
                                <FontAwesomeIcon className='dropMenu' icon="fa-solid fa-ellipsis" onClick={(e) => openPostMenu(e)}/>
                                <div className='postMenuDetail' name={post._id} >
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
                                    {currentUser._id === post.creator._id &&
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
                        <div className='postCaption'>{post.post}</div>
                        {post.likes.length > 0 &&
                            <div className='likeNumberContainer'>
                                <div className='standard'>
                                {post.likes.length > 0 &&
                                    <>
                                        <div className='smallLike'>
                                            <FontAwesomeIcon icon="fa-regular fa-thumbs-up" />
                                        </div>
                                        {currentUserLiked === true && post.likes.length > 1 &&
                                            <div className='greyText'>You and {post.likes.length} others</div>
                                        }
                                        {currentUserLiked === true && post.likes.length === 1 &&
                                            <div className='greyText'>You liked this</div>
                                        }
                                        {currentUserLiked === false &&
                                            <div className='greyText'>{post.likes.length}</div>
                                        }
                                    </>
                                }
                                </div>
                                {post.comments.length === 1 &&
                                    <div className='greyText'>{post.comments.length} comment</div>
                                }
                                {post.comments.length > 1 &&
                                    <div className='greyText'>{post.comments.length} comments</div>
                                }
                            </div>  
                        }
                        {post.comments.length > 0 && post.likes.length === 0 &&
                            <div className='likeNumberContainer'>
                                <div className='standard'>
                                </div>
                                {post.comments.length === 1 &&
                                    <div className='greyText'>{post.comments.length} comment</div>
                                }
                                {post.comments.length > 1 &&
                                    <div className='greyText'>{post.comments.length} comments</div>
                                }
                            </div>  
                        }
                        <hr className='hrPost'/>
                        <div>
                            <div className='postButton2'>
                                {currentUserLiked === false &&
                                    <div className='buttonPost' onClick={(e)=>userLiked(e)}><FontAwesomeIcon icon="fa-regular fa-thumbs-up" /> Like</div>
                                }
                                {currentUserLiked === true &&
                                    <div className='buttonPost' id='liked' onClick={(e)=>userNotLiked(e)}><FontAwesomeIcon icon="fa-regular fa-thumbs-up" /> Like</div>
                                }
                                <div className='buttonPost' onClick={(e) => commentButtonClick(e)}><FontAwesomeIcon icon="fa-regular fa-message" /> Comment</div>
                                <div className='buttonPost' onClick={copyUrl}><FontAwesomeIcon icon="fa-solid fa-share" /> Share</div>
                            </div><hr className='hrPost'/>
                        </div>
                        <div className='bigPostComment'>
                            {post.comments.map((comment,index)=>(
                                <SingleComment key={index} comment={comment} currentUser={currentUser} setUploading={setUploading} setUpdateCurrentUser={setUpdateCurrentUser} singlePost={post}/> 
                            ))}
                        </div>
                        <div className='addComment' id='bigPostComment'>
                            <img className='smallProfilePic' src={currentUser.profile_pic ? currentUser.profile_pic : defaultProfile} alt='profile pic'/>
                            <input type='text' className='commentAdd' name={post._id} placeholder='Write a comment...' onKeyPress={(e) => e.key === 'Enter' && addComment(e,post._id)}/>
                            <FontAwesomeIcon className="sendIcon" icon="fa-regular fa-paper-plane" onClick={(e)=>addComment(e,post._id)}/>
                        </div>
                    </div>
                    <Snackbar ref={snackbarRef} message={message}/>
                    {currentUser._id === post.creator._id &&
                        <EditPost post={post} profile={currentUser} setUploading={setUploading} uploading={uploading}/>
                    }
                </div>
            }
            {logged === true && loading === false && post && !post.image_url[0] &&
                <div className='singlePostContainer'>
                    <div className='profilePart' id='singlePost'>
                        <div className='postTop'>
                            <div>
                                <img className='smallProfilePic' src={post.creator.profile_pic ? post.creator.profile_pic : defaultProfile} alt='profile pic'/>
                                <div className='postBasicDetail'>
                                    <div className='profileFullName'>{post.creator.name} {post.creator.surname}</div>
                                    <div className='smallDesc'>{moment(post.date_of_creation).fromNow()}</div>
                                </div> 
                            </div>
                            <div ref={wrapperRefPost} className='menuContainer'>
                                <FontAwesomeIcon className='dropMenu' icon="fa-solid fa-ellipsis" onClick={(e) => openPostMenu(e)}/>
                                <div className='postMenuDetail' name={post._id} id='noImagePost'>
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
                                    {currentUser._id === post.creator._id &&
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
                            <div className='postCaption'>{post.post}</div>
                            {post.image_url.map((singleImage, index)=>(
                                <Link key={index} to={`/post/${post._id}`}>
                                    <img className='postPic'  src={singleImage} alt=''/>
                                </Link>
                            ))}
                        </div>
                        {post.likes.length > 0 &&
                            <div className='likeNumberContainer'>
                                <div className='standard'>
                                {post.likes.length > 0 &&
                                    <>
                                        <div className='smallLike'>
                                            <FontAwesomeIcon icon="fa-regular fa-thumbs-up" />
                                        </div>
                                        {currentUserLiked === true && post.likes.length > 1 &&
                                            <div className='greyText'>You and {post.likes.length} others</div>
                                        }
                                        {currentUserLiked === true && post.likes.length === 1 &&
                                            <div className='greyText'>You liked this</div>
                                        }
                                        {currentUserLiked === false &&
                                            <div className='greyText'>{post.likes.length}</div>
                                        }
                                    </>
                                }
                                </div>
                                {post.comments.length === 1 &&
                                    <Link to={`/post/${post._id}`} className='greyText'>{post.comments.length} comment</Link>
                                }
                                {post.comments.length > 1 &&
                                    <Link to={`/post/${post._id}`} className='greyText'>{post.comments.length} comments</Link>
                                }
                            </div>  
                        }
                        {post.comments.length > 0 && post.likes.length === 0 &&
                            <div className='likeNumberContainer'>
                                <div className='standard'>
                                </div>
                                {post.comments.length === 1 &&
                                    <Link to={`/post/${post._id}`} className='greyText'>{post.comments.length} comment</Link>
                                }
                                {post.comments.length > 1 &&
                                    <Link to={`/post/${post._id}`} className='greyText'>{post.comments.length} comments</Link>
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
                                <div className='buttonPost' onClick={(e) => commentButtonClick(e)}><FontAwesomeIcon icon="fa-regular fa-message" /> Comment</div>
                                <div className='buttonPost' onClick={copyUrl}><FontAwesomeIcon icon="fa-solid fa-share" /> Share</div>
                            </div><hr className='hrPost'/>
                        </div>
                        <div className='bigPostComment'>
                            {post.comments.map((comment,index)=>(
                                <SingleComment key={index} comment={comment} currentUser={currentUser} setUploading={setUploading} setUpdateCurrentUser={setUpdateCurrentUser} singlePost={post}/> 
                            ))}
                        </div>
                        <div className='addComment'>
                            <img className='smallProfilePic' src={currentUser.profile_pic ? currentUser.profile_pic : defaultProfile} alt='profile pic'/>
                            <input type='text' className='commentAdd' name={post._id} placeholder='Write a comment...' onKeyPress={(e) => e.key === 'Enter' && addComment(e,post._id)}/>
                            <FontAwesomeIcon className="sendIcon" icon="fa-regular fa-paper-plane" onClick={(e)=>addComment(e,post._id)}/>
                        </div>
                    </div>
                    <Snackbar ref={snackbarRef} message={message}/>
                    {currentUser._id === post.creator._id &&
                        <EditPost post={post} profile={currentUser} setUploading={setUploading} uploading={uploading}/>
                    }
                </div>
            }
            {logged === false && loading === true &&
                <div className="homeLoad">
                    <img src={loadingGif} alt='Loading...'/>
                </div>
            }
        </>
            
    )
}
export default PostDetail;