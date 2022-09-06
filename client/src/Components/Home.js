import axios from 'axios';
import defaultProfile from './profile.jpg';
import CreatePost from './CreatePost';
import loadingGif from './loading.gif';
import AddFriend from './AddFriend';
import SinglePost from './SinglePost';
import HomeChat from './HomeChat';
import MessageFriend from './MessageFriend';
import EditPost from './EditPost';
import React from 'react';
import loadingGif2 from './loading.gif';
import {Link,useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';

function Home({setMessageRead, selectedChat, setSelectedChat,logged, loading, profile, possibleFriends, currentUser, setUpdateCurrentUser, savedPost}){
    const [uploading2, setUploading2] = useState(false);
    const [homePosts, setHomePosts] = useState(null);
    const [homePart, setHomePart] = useState(1);
    const [messagedUser1, setMessagedUser1] = useState(null);
    const [messagedUser2, setMessagedUser2] = useState(null);
    const [selected, setSelected] = useState('feed');
    const [option, setOption] = useState(1);
    const [messagesOpen1, setMessagesOpen1] = useState(false);
    const [messagesOpen2, setMessagesOpen2] = useState(false);
    const redirect = useNavigate();

    function startAtTop(){
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
      }

    function recovePosts(){
        axios.get(`/api/homepage/${currentUser._id}`)
          .then(res => {
            if(res.data.posts){
              setHomePosts(res.data.posts)
            }
            else{
              redirect('/login');
            }
          })
    }

    function selectedPart(e){
        e.preventDefault();
        document.querySelector(`.selectedHomePart[id='${selected}']`).style.cssText='background-color: #f0f2f5;'
        if(e.target.id === 'feed'){
            setHomePart(1)
            setOption(1)
            setSelected('feed')
            document.querySelector('.homeContainer').style.cssText='grid-template-columns: 1fr 3fr 1fr;'
        }
        if(e.target.id === 'savedPost'){
            setHomePart(2)
            setOption(1)
            setSelected('savedPost')
            document.querySelector('.homeContainer').style.cssText='grid-template-columns: 1fr 3fr 1fr;'
        }
        if(e.target.id === 'findFriends'){
            setHomePart(3)
            setOption(2)
            setSelected('findFriends')
            document.querySelector('.homeContainer').style.cssText='grid-template-columns: 1fr 4fr;'
        }
        document.querySelector(`.selectedHomePart[id='${e.target.id}']`).style.cssText='background-color: #1877f2;'
        startAtTop()
    }

    function openMessages1(e){
        if(messagesOpen1 === false){
            document.querySelector(`.messageContainer[name='${messagedUser1.user_id._id}']`).style.cssText='display:flex';
            setMessagesOpen1(true);
            const messageDiv = document.getElementById("chat1");
            messageDiv.scrollTop = messageDiv.scrollHeight;
            readChat(messagedUser1.user_id._id)
        }
    }

    function openMessages2(e){
        if(messagesOpen2 === false){
            document.querySelector(`.messageContainer[name='${messagedUser2.user_id._id}']`).style.cssText='display:flex';
            setMessagesOpen2(true);
            const messageDiv = document.getElementById("chat2");
            messageDiv.scrollTop = messageDiv.scrollHeight;
            readChat(messagedUser2.user_id._id)
        }
    }

    function readChat(user_id){
        axios.post(`/api/message/${currentUser._id}/read`, {user_id})
        .then(res => {
            if(!res.data.errors){
                setMessageRead(true);
            }else{
                console.log(res.data.errors)
            }
        })
    }

    useEffect(()=>{
        if(uploading2 === false && currentUser){
            document.querySelector(`.selectedHomePart[id='${selected}']`).style.cssText='background-color: #1877f2;'
            recovePosts();
        }
    },[uploading2, currentUser])

    return (
        <div className="homeContainer">
            {logged === true && loading === false && profile &&
                <>
                    <div className='leftHome'>
                        <Link to={`/profile/${profile._id}`}  className='buttonHome'>
                            <img className='smallProfilePic' src={profile.profile_pic ? profile.profile_pic : defaultProfile} alt='profile pic'/> 
                            <p>{profile.name} {profile.surname}</p>
                        </Link>
                        <div className='buttonHome' id='feed' onClick={(e)=>selectedPart(e)}>
                            <div className='selectedHomePart' id='feed'/>
                            <img className='iconHome' id='feed' src='https://static.xx.fbcdn.net/rsrc.php/v3/yc/r/hTN47HVa4oS.png' alt='profile pic'/> 
                            <p id='feed'>Feed</p>
                        </div>
                        <div className='buttonHome' id='savedPost' onClick={(e)=>selectedPart(e)}>
                            <div className='selectedHomePart' id='savedPost'/>
                            <img className='iconHome' id='savedPost' src='https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/lVijPkTeN-r.png' alt='profile pic'/> 
                            <p id='savedPost'>Saved</p>
                        </div>
                        <div className='buttonHome' id='findFriends' onClick={(e)=>selectedPart(e)}>
                            <div className='selectedHomePart' id='findFriends'/>
                            <img className='iconHome' id='findFriends' src='https://static.xx.fbcdn.net/rsrc.php/v3/y8/r/S0U5ECzYUSu.png' alt='profile pic'/>
                            <p id='findFriends'>Find Friends</p>
                        </div>
                    </div>
                    <div className='home'>
                        {homePart === 1 &&
                        <>
                            <HomeChat
                                messagedUser1={messagedUser1}
                                setMessagedUser1={setMessagedUser1}
                                messagedUser2={messagedUser2}
                                setMessagedUser2={setMessagedUser2}
                                currentUser={currentUser}
                                openMessages1={openMessages1}
                                openMessages2={openMessages2}
                                setMessagesOpen1={setMessagesOpen1}
                                messagesOpen1={messagesOpen1}
                                setMessagesOpen2={setMessagesOpen2}
                                messagesOpen2={messagesOpen2}
                                setMessageRead={setMessageRead}
                            />
                            <CreatePost profile={profile} uploading={uploading2} setUploading={setUploading2}/>
                            {homePosts === null &&
                                <div className='loadContainer'>
                                    <img src={loadingGif2} className='mediumLoad' alt='Loading..'/>
                                </div>
                            }
                            {homePosts && homePosts.map((singlePost, index)=>(
                                <React.Fragment key={index} >
                                    <SinglePost setUpdateCurrentUser={setUpdateCurrentUser} singlePost={singlePost} currentUser={currentUser} setUploading={setUploading2}/>
                                    {currentUser._id === singlePost.creator._id &&
                                        <EditPost post={singlePost} profile={currentUser} setUploading={setUploading2} uploading={uploading2}/>
                                    }
                                </React.Fragment>
                            ))}
                        </>
                        }
                        {homePart === 2 &&
                        <>
                            {savedPost && savedPost.map((singlePost, index)=>(
                                <React.Fragment key={index} >
                                    <SinglePost setUpdateCurrentUser={setUpdateCurrentUser} singlePost={singlePost} currentUser={currentUser} setUploading={setUploading2}/>
                                    {currentUser._id === singlePost.creator._id &&
                                        <EditPost post={singlePost} profile={currentUser} setUploading={setUploading2} uploading={uploading2}/>
                                    }
                                </React.Fragment>
                            ))}
                        </>
                        }
                        {homePart === 3 &&
                        <>
                            <div className='sectionTitle'>People You May Know:</div>
                            <div className='possibleFriends'>
                                {possibleFriends.map((singleUser, index)=>(
                                    <AddFriend key={index} option={option} singleUser= {singleUser} currentUser={currentUser} setUpdateCurrentUser={setUpdateCurrentUser}/>
                                ))}
                            </div>
                        </>
                        }
                    </div>
                    {homePart !== 3 &&
                        <div className='rigthHome'>
                            {possibleFriends &&
                                <div className='profilePart' id='friendSuggContainer'>
                                    <div className='friendSuggestion'>People You May Know:</div>
                                    {possibleFriends.map((singleUser, index)=>(
                                        <React.Fragment key={index}>
                                            {index < 3 &&
                                                <AddFriend option={option} singleUser= {singleUser} currentUser={currentUser} setUpdateCurrentUser={setUpdateCurrentUser}/>
                                            }
                                        </React.Fragment>
                                    ))}
                                </div> 
                            }
                            {currentUser && currentUser.friends.length > 0 &&
                                <div className='profilePart' id='messageFriend'>
                                    <div className='friendSuggestion'>Message Friends:</div>
                                    <hr/>
                                    {currentUser.friends.map((singleUser, index)=>(
                                        <MessageFriend 
                                            key={index} 
                                            singleUser= {singleUser} 
                                            messagedUser1={messagedUser1}
                                            setMessagedUser1={setMessagedUser1}
                                            messagedUser2={messagedUser2}
                                            setMessagedUser2={setMessagedUser2}
                                            currentUser={currentUser}
                                            openMessages1={openMessages1}
                                            openMessages2={openMessages2}
                                            setSelectedChat={setSelectedChat}
                                        />
                                    ))}
                                </div> 
                            }
                        </div>
                    }
                </>
            }
            {logged === false && loading === true &&
                <div className="homeLoad">
                    <img src={loadingGif} alt='Loading...'/>
                </div>
            }
        </div>
            
    )
}
export default Home;