import axios from 'axios';
import defaultProfile from './profile.jpg';
import moment from 'moment';
import {Link,useNavigate} from 'react-router-dom';
import {useEffect, useState,useRef} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faEllipsis} from '@fortawesome/free-solid-svg-icons';
library.add(faEllipsis);

function SingleComment({comment,currentUser, setUploading, setUpdateCurrentUser, singlePost}){
    let wrapperRefComment = useRef(null);
    useOutsideAlerterComment(wrapperRefComment);
    const [edit, setEdit] = useState(false);
    const [open,setOpen] = useState(false);
    const [currentUserLiked, setCurrentUserLiked] =useState(false)

    function userLiked(e){
        e.preventDefault(e);
        setUploading(true)
        setUpdateCurrentUser(false);
        const user_id = currentUser._id;
        const creator = comment.creator;
        const post_ref = singlePost._id;
        axios.put(`/api/comment/${comment._id}/like` , {user_id, creator, post_ref})
            .then(res => {
                if(!res.data.errors){
                    setUploading(false)
                    setUpdateCurrentUser(true);
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function userNotLiked(e){
        e.preventDefault(e);
        setUploading(true)
        setUpdateCurrentUser(false);
        const user_id = currentUser._id;
        axios.put(`/api/comment/${comment._id}/removeLike` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUploading(false)
                    setUpdateCurrentUser(true);
                    setCurrentUserLiked(false)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function currentUserLike(){
        for(let i=0; i < comment.likes.length; i++){
            if(currentUser._id === comment.likes[i]){
                setCurrentUserLiked(true)
            }
        }
    }

    function openCommentMenu(e){
        e.preventDefault();
        if(open === false){
            document.querySelector(`.commentMenu[name="${comment._id}"]`).style.cssText="display:flex !important;";
            setOpen(true)
        }
        else{
            document.querySelector(`.commentMenu[name="${comment._id}"]`).style.cssText="display:none !important;";
            setOpen(false)
        }
    }

    function useOutsideAlerterComment(ref) {
        useEffect(() => {
          function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                document.querySelector(`.commentMenu[name="${comment._id}"]`).style.cssText="display:none !important;";
                setOpen(false)
            }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref]);
    }

    function deleteComment(e){
        e.preventDefault();
        document.querySelector(`.commentMenu[name="${comment._id}"]`).style.cssText="display:none !important;";
        setOpen(false)
        setUploading(true);
        setUpdateCurrentUser(false)
        const user = singlePost.creator;
        axios.put(`/api/comment/${comment._id}/delete`, {user})
            .then(res => {
                if(!res.data.errors){
                    setUploading(false); 
                    setUpdateCurrentUser(true)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }      

    function updateComment(e){
        e.preventDefault();
        setOpen(false);
        setUploading(true);
        const commentEdited = document.querySelector(`.commentAdd[name="${comment._id}"]`).value;
        const user = comment.creator;
        const ref = comment.post_ref;
        const date = comment.date_of_creation;
        const likes = comment.likes;
        axios.put(`/api/comment/${comment._id}/update`, {commentEdited,user,ref,date,likes})
            .then(res => {
                if(!res.data.errors){
                    setEdit(false)
                    setUploading(false)
                }else{
                    console.log(res.data.errors)
                }
        }) 
    }

    function openEdit(e){
        e.preventDefault();
        setEdit(true)
        setOpen(false)
    }

    function closeEdit(e){
        e.preventDefault();
        setEdit(false);
    }

    useEffect(()=>{
        if(comment){
          currentUserLike()
        }
      },[comment])
    
    return (
        <div className='singleComment'>
            <img className='smallProfilePic' src={comment.creator.profile_pic ? comment.creator.profile_pic : defaultProfile} alt='profile pic'/>
            {edit  === false &&
                <div>
                    <div className='editComment'>
                        <div className='commentContainer'>
                            <div className='commentName'>{comment.creator.name} {comment.creator.surname}</div>
                            <div className='actualComment'>{comment.comment}</div>
                        </div>
                        {comment.likes.length > 0 &&
                            <div className='likeComment'>
                                <div className='smallLike'>
                                    <FontAwesomeIcon icon="fa-regular fa-thumbs-up" />
                                </div>
                                {comment.likes.length > 1 &&
                                    <div className='greyText'>{comment.likes.length}&nbsp;</div> 
                                }
                            </div>
                        }
                        {currentUser._id === comment.creator._id &&
                            <div ref={wrapperRefComment}>
                                <FontAwesomeIcon className='editMenu' icon="fa-solid fa-ellipsis" onClick={(e)=> openCommentMenu(e)}/>
                                <div className='commentMenu' name={comment._id} >
                                    <button className='dropButton2' onClick={(e)=>openEdit(e)}>Edit Comment</button>
                                    <button className='dropButton2' onClick={(e) => deleteComment(e)}>Delete Comment</button>
                                </div>
                            </div>
                        }
                    </div>    
                    <div className='likeContainer'>
                        {currentUserLiked === false &&
                            <div className='likeComm' onClick={(e)=>userLiked(e)}>Like</div>
                        }
                        {currentUserLiked === true &&
                            <div className='likeComm' id='liked' onClick={(e)=>userNotLiked(e)}>Like</div>
                        }
                        <div className='smallDesc'>{moment(comment.date_of_creation).fromNow()}</div>
                    </div>
                </div>
            }
            {edit === true &&
                <div className='modifyComment'>
                    <input type='text' className='commentAdd' id='commentEdit' name={comment._id} defaultValue={comment.comment} onKeyPress={(e) => e.key === 'Enter' && updateComment(e)}/>
                    <FontAwesomeIcon className="sendIcon" icon="fa-regular fa-paper-plane" onClick={(e)=>updateComment(e)}/>
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className='exitEdit' onClick={(e) => closeEdit(e)}/>
                </div>
            }
        </div>
    )
}
export default SingleComment;