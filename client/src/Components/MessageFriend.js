import axios from 'axios';
import defaultProfile from './profile.jpg';
import {Link,useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faImages, faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faXmark, faImages);

function MessageFriend({setSelectedChat,openMessages1,openMessages2, currentUser, singleUser,messagedUser1,setMessagedUser1, setMessagedUser2, messagedUser2}){
    const redirect = useNavigate();

    function openMessage(e){
        e.preventDefault();
        if(messagedUser1 === null){
            setMessagedUser1(singleUser);
        }
        else if(messagedUser1.user_id._id !== singleUser.user_id._id && messagedUser2 === null){
            setMessagedUser2(singleUser)
        }
        else if(messagedUser1.user_id._id === singleUser.user_id._id){
            openMessages1()
        }
        else if(messagedUser2 !== null && messagedUser2.user_id._id === singleUser.user_id._id){
            openMessages2()
        }
        else if(messagedUser1 !== null && messagedUser2 !== null){
            setSelectedChat(singleUser.user_id)
            redirect(`/message/${currentUser._id}`)
        }
    }

    return (
        <>
            {singleUser._id && singleUser.confirmed === true &&
                <button className='messageFriend' onClick={openMessage}>
                    <img className='smallProfilePic' src={singleUser.user_id.profile_pic ? singleUser.user_id.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                    <div className='commentName'>{singleUser.user_id.name} {singleUser.user_id.surname} </div>
                </button>
            }
        </>    
    )
}
export default MessageFriend;