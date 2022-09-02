import axios from 'axios';
import defaultProfile from './profile.jpg';
import {Link,useNavigate, useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faImages, faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faXmark, faImages);

function UserMessages({currentUser,selectedChat, setSelectedChat, setMessageRead}){
    const redirect = useNavigate();
    const {id} = useParams();
    const [userMessaged, setUserMessaged] = useState(null);
    const [tempMessaged, setTempMessaged] = useState(null);
    const [toRead, setToRead] = useState(false);
    const [noChat, setNoChat] = useState(false);
    const [chat, setChat] = useState(null);

    function changeSelected(e, user){
        e.preventDefault();
        setChat(null);
        recoveChat(user._id) 
        setSelectedChat(user);
    }

    function sendMessage(e, user_id){
        e.preventDefault();
        const message =  document.querySelector(`.inputMessage`).value;
        axios.post(`/api/message/${currentUser._id}/send`, {message,user_id})
            .then(res => {
                if(!res.data.errors){
                    document.querySelector(`.inputMessage`).value = '';
                    recoveChat(user_id);
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function recoveChat(user_id){
        axios.post(`/api/message/${currentUser._id}/recove`, {user_id})
        .then(res => {
            if(!res.data.errors){
                setChat(res.data.messages);
            }else{
                console.log(res.data.errors)
            }
        })
    }

    function recoveUserMessaged(){
        axios.get(`/api/message/user/${id}`)
        .then(res => {
            if(res.data.messages){
                setTempMessaged(res.data.messages)
            }
            else{
                setNoChat(true)
            }
        })
    }

    function readChat(user_id){
        axios.post(`/api/message/${currentUser._id}/read`, {user_id})
        .then(res => {
            if(!res.data.errors){
                recoveUserMessaged();
                setMessageRead(true);
            }else{
                console.log(res.data.errors)
            }
        })
    }

    useEffect(()=>{
        if(currentUser && currentUser._id !== id){
            redirect('/');
        }
        else if(currentUser && id){
            recoveUserMessaged()
        }
      },[id, currentUser])

      useEffect(()=>{
        if(tempMessaged && selectedChat === null){
            setUserMessaged(tempMessaged)
            if(tempMessaged[0]._doc && tempMessaged[0]._doc._id !== currentUser._id){
                setSelectedChat(tempMessaged[0]._doc);
                setToRead(true);
            }
            else if(tempMessaged[0]._id !== currentUser._id){
                setSelectedChat(tempMessaged[0]);
            }
            else{
                if(tempMessaged[1]._doc){
                    setSelectedChat(tempMessaged[1]._doc);
                    setToRead(true);
                }
                else{
                    setSelectedChat(tempMessaged[1]);
                }
            }
        }
        if(tempMessaged && selectedChat){
            let userArray = tempMessaged;
            let isIn = false;
            for(let i=0; i<tempMessaged.length; i++){
                if(tempMessaged[i]._doc && tempMessaged[i]._doc._id === selectedChat._id){
                    isIn = true;
                }
                else if(tempMessaged[i]._id === selectedChat._id){
                    isIn = true;
                }
            }
            if(isIn === false){
                userArray.push(selectedChat);
            }
            setUserMessaged(userArray);
        }
      },[tempMessaged]) 
      
      useEffect(()=>{
        if(chat){
            const messageDiv = document.getElementById("chatBig");
            messageDiv.scrollTop = messageDiv.scrollHeight;
            document.querySelector('.inputMessage').focus();
        }
      },[chat])   

      useEffect(()=>{
        if(selectedChat){
           recoveChat(selectedChat._id) 
        }
      },[selectedChat])    
      
      useEffect(()=>{
        if(toRead === true && selectedChat){
           readChat(selectedChat._id)
           setToRead(false)
        }
      },[toRead, selectedChat])    

    return (
        <div className='messageHome'>
            <div className='leftSideMessage'>
                <div className='sectionTitle' id='chatTitle'>Chats:</div><hr/>
                {selectedChat && userMessaged && userMessaged.map((singleUser, index)=>(
                    <React.Fragment key={index}>
                        {singleUser._id !== currentUser._id && !singleUser._doc &&
                            <button className='messageFriend2' id={singleUser._id === selectedChat._id ? 'selectedChat' : ''} onClick={(e) =>changeSelected(e, singleUser) } >
                                <img className='mediumProfilePic' src={singleUser.profile_pic ? singleUser.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                                <div className='commentNameBig'>{singleUser.name} {singleUser.surname} </div>
                            </button>
                        }
                        {singleUser._id !== currentUser._id && singleUser._doc  &&
                            <button className='messageFriend3' id={singleUser._doc._id === selectedChat._id ? 'selectedChat' : ''} onClick={(e) =>{changeSelected(e, singleUser._doc); setToRead(true)} } >
                                <div className='standard'>
                                    <img className='mediumProfilePic' src={singleUser._doc.profile_pic ? singleUser._doc.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                                    <div className='commentNameBig'>{singleUser._doc.name} {singleUser._doc.surname} </div>
                                </div>
                                <div className='messageDot'></div>
                            </button>
                        }
                    </React.Fragment>
                ))}
                {noChat === true &&
                    <div className='smallDesc' id='noRequest'>You don't have any chat at the moment.</div>
                }
            </div>
            <div className='rightSideMessage'>
                {selectedChat === null &&
                    <img className='mediumProfilePic' src={defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                }
                {selectedChat &&
                    <Link to={`/profile/${selectedChat._id}`}  className='messageFriend2'>
                        <img className='mediumProfilePic' src={selectedChat.profile_pic ? selectedChat.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                        <div className='commentNameBig'>{selectedChat.name} {selectedChat.surname} </div>
                    </Link>
                }
                <hr/>
                < div className='messageContainerBig' id='chatBig'>
                    {chat && chat.map((singleMessage, index)=>(
                        <div className={singleMessage.from_user._id === currentUser._id ? "rightMessage" : "leftMessage"} key={index}>
                        {singleMessage.message} 
                        </div>
                    ))
                    }
                </div>
                {currentUser &&
                    <div className='addComment' id='sendMessageBig'>
                        <input type='text' className='inputMessage' placeholder='send message' onKeyPress={(e) => e.key === 'Enter' && sendMessage(e,selectedChat._id)}/>
                        <img className='smallProfilePic' src={currentUser.profile_pic ? currentUser.profile_pic : defaultProfile} alt='profile pic'/>
                    </div> 
                }
            </div>
        </div>  
    )
}
export default UserMessages;