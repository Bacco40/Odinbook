import axios from 'axios';
import {useState, useEffect} from 'react';
import React from 'react';
import defaultProfile from './profile.jpg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faMinus, faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faXmark, faMinus);

function HomeChat({ messagesOpen1,setMessagesOpen1,messagesOpen2,setMessagesOpen2,openMessages1,openMessages2, currentUser,messagedUser1,setMessagedUser1, setMessagedUser2, messagedUser2}){
    const [chat1, setChat1] =useState(null);
    const [chat2, setChat2] =useState(null);

    function reduceMessage1(e){
        if(messagesOpen1 === true){
            document.querySelector(`.messageContainer[name='${messagedUser1.user_id._id}']`).style.cssText='display:none';
            setMessagesOpen1(false)
        }
    }

    function closeMessages1(e){
        setMessagesOpen1(false);
        setMessagedUser1(null);
        setChat1(null)
    }

    function reduceMessage2(e){
        if(messagesOpen2 === true){
            document.querySelector(`.messageContainer[name='${messagedUser2.user_id._id}']`).style.cssText='display:none';
            setMessagesOpen2(false)
        }
    }

    function closeMessages2(e){
        setMessagesOpen2(false);
        setMessagedUser2(null);
        setChat2(null)
    }

    function sendMessage(e, user_id){
        e.preventDefault();
        const message =  document.querySelector(`.inputMessage[name='${user_id}']`).value;
        axios.post(`/api/message/${currentUser._id}/send`, {message,user_id})
            .then(res => {
                if(!res.data.errors){
                    document.querySelector(`.inputMessage[name='${user_id}']`).value = '';
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
                if(messagedUser1.user_id._id === user_id){
                    setChat1(res.data.messages)
                }
                if(messagedUser2 && messagedUser2.user_id._id === user_id){
                    setChat2(res.data.messages)
                }
            }else{
                console.log(res.data.errors)
            }
        })
    }

    useEffect(()=>{
        if(messagedUser1){
            recoveChat(messagedUser1.user_id._id)
        }
    },[messagedUser1])

    useEffect(()=>{
        if(messagedUser2){
            recoveChat(messagedUser2.user_id._id)
        }
    },[messagedUser2])

    useEffect(()=>{
        if(chat1){
            const messageDiv = document.querySelector(`.messages[name='${messagedUser1.user_id._id}']`);
            messageDiv.scrollTop = messageDiv.scrollHeight;
            document.querySelector(`.inputMessage[name='${messagedUser1.user_id._id}']`).focus();
        }
      },[chat1])   

      useEffect(()=>{
        if(chat2){
            const messageDiv = document.querySelector(`.messages[name='${messagedUser2.user_id._id}']`);
            messageDiv.scrollTop = messageDiv.scrollHeight;
            document.querySelector(`.inputMessage[name='${messagedUser2.user_id._id}']`).focus();
        }
      },[chat2]) 

    return (
        <div className='chatsContainer'>
            {messagedUser1 !== null &&
                <div className='profilePart' id='messagedFriend'>
                    <div className='topMessagePart'>
                        <button className='userMessageClick' onClick={(e) => openMessages1(e)}>
                            <img className='smallProfilePic' src={messagedUser1.user_id.profile_pic ? messagedUser1.user_id.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                            <div className='commentName'>{messagedUser1.user_id.name} {messagedUser1.user_id.surname} </div>
                        </button>
                        <FontAwesomeIcon className='closeMessage' icon="fa-solid fa-minus"  onClick={(e) => reduceMessage1(e)}/>
                        <FontAwesomeIcon className='closeMessage' icon="fa-solid fa-xmark" onClick={(e) => closeMessages1(e)}/>
                    </div>
                    <div className='messageContainer' name={messagedUser1.user_id._id}>
                        <hr className='hrMessage'/>
                        <div className='messages' id='chat1' name={messagedUser1.user_id._id}>
                            {chat1 && chat1.map((singleMessage, index)=>(
                                <div className={singleMessage.from_user._id === currentUser._id ? "rightMessage" : "leftMessage"} key={index}>
                                {singleMessage.message} 
                                </div>
                            ))
                            }
                        </div>
                        <div className='addComment' id='sendMessage'>
                            <img className='smallProfilePic' src={currentUser.profile_pic ? currentUser.profile_pic : defaultProfile} alt='profile pic'/>
                            <input type='text' className='inputMessage' name={messagedUser1.user_id._id} placeholder='send message' onKeyPress={(e) => e.key === 'Enter' && sendMessage(e,messagedUser1.user_id._id)}/>
                        </div>   
                    </div>
                </div>
            }
            {messagedUser2!== null  &&
                <div className='profilePart' id='messagedFriend1'>
                    <div className='topMessagePart'>
                        <button className='userMessageClick' onClick={(e) => openMessages2(e)}>
                            <img className='smallProfilePic' src={messagedUser2.user_id.profile_pic ? messagedUser2.user_id.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                            <div className='commentName'>{messagedUser2.user_id.name} {messagedUser2.user_id.surname} </div>
                        </button>
                        <FontAwesomeIcon className='closeMessage' icon="fa-solid fa-minus"  onClick={(e) => reduceMessage2(e)}/>
                        <FontAwesomeIcon className='closeMessage' icon="fa-solid fa-xmark" onClick={(e) => closeMessages2(e)}/>
                    </div>
                    <div className='messageContainer' name={messagedUser2.user_id._id}>
                        <hr className='hrMessage'/>
                        <div className='messages' id='chat2' name={messagedUser2.user_id._id}>
                            {chat2 && chat2.map((singleMessage, index)=>(
                                <div className={singleMessage.from_user._id === currentUser._id ? "rightMessage" : "leftMessage"} key={index}>
                                {singleMessage.message} 
                                </div>
                            ))
                            }
                        </div>
                        <div className='addComment' id='sendMessage'>
                            <img className='smallProfilePic' src={currentUser.profile_pic ? currentUser.profile_pic : defaultProfile} alt='profile pic'/>
                            <input type='text' className='inputMessage' name={messagedUser2.user_id._id} placeholder='send message' onKeyPress={(e) => e.key === 'Enter' && sendMessage(e,messagedUser2.user_id._id)}/>
                        </div>   
                    </div>
                </div>
            }
        </div>
    )
}

export default HomeChat;