import {Link,useNavigate} from 'react-router-dom';
import defaultProfile from './profile.jpg';
import axios from 'axios';
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from 'moment';
import loadingGif2 from './loading.gif';
import { library } from "@fortawesome/fontawesome-svg-core";
import{faFacebook, faFacebookMessenger} from "@fortawesome/free-brands-svg-icons";
import { faBell, faMagnifyingGlass, faRightFromBracket, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef} from 'react';
library.add(faFacebook, faMagnifyingGlass,faFacebookMessenger,faBell,faUserGroup,faRightFromBracket);

function Navbar ({setSelectedChat,setLogged, profile, setFriendRequests, setUpdateCurrentUser, messageRead, setMessageRead}){
    const redirect = useNavigate();
    const [open,setOpen] = useState(false);
    const [open2,setOpen2] = useState(false);
    const [open3,setOpen3] = useState(false);
    const [friendsNumber, setFriendsNumber] = useState(0)
    const [newFriendRequests, setNewFriendRequests] = useState(null);
    const [oldFriendRequests, setOldFriendRequests] = useState(null);
    const [notificationNumber, setNotificationNumber] = useState(0)
    const [newNotifications, setNewNotifications] = useState(null);
    const [oldNotifications, setOldNotifications] = useState(null);
    const [numMessage, setNumMessage] = useState(0);
    const [foundUser,setFoundUser] = useState(null);
    const [openSearch, setOpenSearch] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(true);
    const wrapperRef = useRef(null);
    const wrapperRef2 = useRef(null);
    const wrapperRef3 = useRef(null);
    useOutsideAlerter(wrapperRef);
    useOutsideAlerter2(wrapperRef2);
    useOutsideAlerter3(wrapperRef3);

    function recoveNotifications(){
        axios.get(`/api/notification/user/${profile._id}` )
            .then(res => {
                if(!res.data.errors){
                    setNewFriendRequests(res.data.new_friend_requests);
                    setFriendsNumber(res.data.new_friend_requests.length);
                    setOldFriendRequests(res.data.old_friend_requests);
                    setFriendRequests(res.data.friend_requests);
                    setNewNotifications(res.data.new_post_notification);
                    setNotificationNumber(res.data.new_post_notification.length)
                    setOldNotifications(res.data.old_post_notification);
                    setNumMessage(res.data.number_of_message);
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function logOutUser(e){
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        document.querySelector('.profileMenu').style.cssText = 'display:none;'; 
        setLogged(false);
        setSelectedChat(null)
    }

    function goToProfile(e){
        openProfileOption(e);
        redirect(`/profile/${profile._id}`);
    }

    function goFriendProfile(e,id){
        openFriendsOption(e);
        redirect(`/profile/${id}`);
    }

    function openProfileOption(e){
        e.preventDefault();
        if(open === false){
            document.querySelector('.profileMenu').style.cssText = 'display:flex;';
            setOpen(true)
        }
        else{
            document.querySelector('.profileMenu').style.cssText = 'display:none;'; 
            setOpen(false)
        }
    }

    function confirmFriend(e){
        e.preventDefault();
        const user_id = e.target.name;
        axios.put(`/api/confirmFriend/${profile._id}` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function openFriendsOption(e){
        e.preventDefault();
        setFriendsNumber(0);
        if(open2 === false){
            document.querySelector('.friendsMenu').style.cssText = 'display:flex;';
            setOpen2(true);
            const type = 0;
            axios.put(`/api/notification/opened/${profile._id}` , {type})
            .then(res => {
                if(!res.data.errors){
                    setTimeout(setUpdateCurrentUser(true), 5000);
                }else{
                    console.log(res.data.errors)
                }
            })
        }
        else{
            document.querySelector('.friendsMenu').style.cssText = 'display:none;'; 
            setOpen2(false)
        }
    }

    function openNotificationsOption(e){
        e.preventDefault();
        setNotificationNumber(0);
        if(open3 === false){
            document.querySelector('.notificationMenu').style.cssText = 'display:flex;';
            setOpen3(true);
            const type = 1;
            axios.put(`/api/notification/opened/${profile._id}` , {type})
            .then(res => {
                if(!res.data.errors){
                    setTimeout(setUpdateCurrentUser(true), 5000);
                }else{
                    console.log(res.data.errors)
                }
            }) 
        }
        else{
            document.querySelector('.notificationMenu').style.cssText = 'display:none;'; 
            setOpen3(false)
        }
    }

    function searchUser(e){
        e.preventDefault();
        const name = document.querySelector('#searchUser').value;
        if(name.length > 0){
            setOpenSearch(true);
            setLoadingSearch(true);
            axios.get(`/api/search/${name}` )
            .then(res => {
                if(!res.data.errors){
                    let accounts = [];
                    for(let i=0; i<res.data.user_by_name.length ; i++){
                        accounts.push(res.data.user_by_name[i])
                    }
                    for(let a=0; a<res.data.user_by_surname.length; a++){
                        let isIn=0;
                        for(let b=0; b<accounts.length;b++){
                            if(accounts[b]._id === res.data.user_by_surname[a]._id){
                                isIn=1
                            }
                        }
                        if(isIn !== 1){
                            accounts.push(res.data.user_by_surname[a])
                        }
                    }
                    setFoundUser(accounts);
                    setLoadingSearch(false)
                }else{
                    console.log(res.data.errors)
                }
            }) 
        }
        else{
            setOpenSearch(false);
            setFoundUser(null);
            setLoadingSearch(true);
        }
    }

    function goToUserProfile(e){
        e.preventDefault();
        redirect(`/profile/${e.target.name}`);
        setOpenSearch(false);
        setFoundUser(null);
        setLoadingSearch(true);
        document.querySelector('#searchUser').value='';
    }

    function goPost(e,id){
        openNotificationsOption(e);
        redirect(`/post/${id}`);
    }

    function useOutsideAlerter3(ref) {
        useEffect(() => {
          function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                document.querySelector('.notificationMenu').style.cssText="display:none;";
                setOpen3(false);
            }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref]);
      }


    function useOutsideAlerter2(ref) {
        useEffect(() => {
          function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                document.querySelector('.friendsMenu').style.cssText="display:none;";
                setOpen2(false);
            }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref]);
      }

    function useOutsideAlerter(ref) {
        useEffect(() => {
          function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                document.querySelector('.profileMenu').style.cssText="display:none;";
                setOpen(false);
            }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref]);
      }

      useEffect(()=>{
        if(openSearch === true){
            document.querySelector('.searchMenu').style.cssText='display:flex';
        }
        else{
            document.querySelector('.searchMenu').style.cssText='display:none';
        }
      },[openSearch])

      useEffect(()=>{
        if(messageRead === true){
            recoveNotifications();
            setMessageRead(false);
        }
      },[messageRead])

      useEffect(()=>{
        if(profile){
            recoveNotifications();
        }
      },[profile])

    return (
        <nav>
            <div className='leftSideNav'>
                <Link to={'/'} className='logoContainer'><FontAwesomeIcon icon="fa-brands fa-facebook" /></Link>
                <div className='navSearch'>
                    <FontAwesomeIcon className='searchIcon' icon="fa-solid fa-magnifying-glass" />
                    <div>
                        <input className='search' id='searchUser' type='text' placeholder='Search on Facebook' onChange={(e) => searchUser(e)}/>
                        <div className='searchMenu'>
                            {loadingSearch === true &&
                                <img src={loadingGif2} className='smallLoad' alt='Loading..'/>
                            }
                            {foundUser && foundUser.map((singleUser,index)=>(
                                <button name={singleUser._id} key={index} className='messageFriend' onClick={(e)=>goToUserProfile(e)}>
                                    <img className='smallProfilePic' name={singleUser._id} src={singleUser.profile_pic ? singleUser.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                                    <div className='commentName' name={singleUser._id}>{singleUser.name} {singleUser.surname} </div>
                                </button>
                            ))}
                            {loadingSearch === false && foundUser.length === 0 &&
                                <div className='smallDesc' id='noRequest'>Sorry, no user found.</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className='rightSideNav'>
                <Link to={`/message/${profile._id}`} className='iconNav'>
                    <FontAwesomeIcon icon="fa-brands fa-facebook-messenger" />
                    {numMessage > 0 &&
                        <div className='circleNotificationMessage'>{numMessage}</div>
                    }
                </Link>
                <div ref={wrapperRef3}>
                    <button className='iconNav' onClick={(e)=>openNotificationsOption(e)}>
                        <FontAwesomeIcon icon="fa-solid fa-bell" />
                    </button>
                    {newNotifications && oldNotifications &&
                    <>
                        {notificationNumber > 0 &&
                            <div className='circleNotification2'>{newNotifications.length}</div>
                        }
                        <div className='notificationMenu' >
                            <div className='friendSuggestion' id='friendsTitle'>Notifications:</div>
                            <hr/>
                            {newNotifications.length === 0 && oldNotifications.length === 0 &&
                                <div className='smallDesc' id='noRequest'>You don't have any notification at the moment.</div>
                            }
                            {newNotifications.map((singleRequest,index)=>(
                                <React.Fragment key={index}>
                                    <div className='dropButton3'name='notOpened'>
                                        <Link className='standard' to={`/post/${singleRequest.notification.post_ref._id}`} onClick={(e)=>goPost(e, singleRequest.notification.post_ref._id)}>
                                            <div className='standard'>
                                                <img className='smallProfilePic' src={singleRequest.notification.user_ref.profile_pic ? singleRequest.notification.user_ref.profile_pic : defaultProfile} alt='profile pic'/>
                                                <div className='postBasicDetail'>
                                                    <div className='profileFullName'>{singleRequest.notification.user_ref.name} {singleRequest.notification.user_ref.surname}</div>
                                                    {singleRequest.notification.content === 'liked' &&
                                                        <div className='smallText'>{singleRequest.notification.content} your post</div>
                                                    }
                                                    {singleRequest.notification.content === 'commented' &&
                                                        <div className='smallText'>{singleRequest.notification.content} your post</div>
                                                    }
                                                    {singleRequest.notification.content === 'liked your' &&
                                                        <div className='smallText'>{singleRequest.notification.content} comment under this post</div>
                                                    }
                                                    <div className='smallDesc'>{moment(singleRequest.notification.date).fromNow()}</div>
                                                </div>
                                            </div>
                                        </Link>
                                        {singleRequest.notification.post_ref.image_url[0] &&
                                            <Link to={`/post/${singleRequest.notification.post_ref._id}`} onClick={(e)=>goPost(e, singleRequest.notification.post_ref._id)}>
                                                <img className='reallySmallPic' src={singleRequest.notification.post_ref.image_url[0]} alt=''/>
                                            </Link>
                                        }
                                    </div>
                                </React.Fragment>
                            ))}
                            {oldNotifications.map((singleRequest,index)=>(
                                <React.Fragment key={index}>
                                    <div className='dropButton3' name='opened'>
                                        <Link className='standard' to={`/post/${singleRequest.notification.post_ref._id}`} onClick={(e)=>goPost(e, singleRequest.notification.post_ref._id)}>
                                            <img className='smallProfilePic' src={singleRequest.notification.user_ref.profile_pic ? singleRequest.notification.user_ref.profile_pic : defaultProfile} alt='profile pic'/>
                                            <div className='postBasicDetail'>
                                                <div className='profileFullName'>{singleRequest.notification.user_ref.name} {singleRequest.notification.user_ref.surname}</div>
                                                {singleRequest.notification.content === 'liked' &&
                                                    <div className='smallText'>{singleRequest.notification.content} your post</div>
                                                }
                                                {singleRequest.notification.content === 'commented' &&
                                                    <div className='smallText'>{singleRequest.notification.content} your post</div>
                                                }
                                                {singleRequest.notification.content === 'liked your' &&
                                                    <div className='smallText'>{singleRequest.notification.content} comment under this post</div>
                                                }
                                                <div className='smallDesc'>{moment(singleRequest.notification.date).fromNow()}</div>
                                            </div>
                                        </Link>
                                        {singleRequest.notification.post_ref.image_url[0] &&
                                            <Link to={`/post/${singleRequest.notification.post_ref._id}`} onClick={(e)=>goPost(e, singleRequest.notification.post_ref._id)}>
                                                <img className='reallySmallPic' src={singleRequest.notification.post_ref.image_url[0]} alt=''/>
                                            </Link>
                                        }
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </>}
                </div>
                <div ref={wrapperRef2}>
                    <button className='iconNav' onClick={(e)=>openFriendsOption(e)}>
                        <FontAwesomeIcon icon="fa-solid fa-user-group" />
                    </button>
                    {newFriendRequests && oldFriendRequests &&
                    <>
                        {friendsNumber > 0 &&
                            <div className='circleNotification'>{newFriendRequests.length}</div>
                        }
                        <div className='friendsMenu' >
                            <div className='friendSuggestion' id='friendsTitle'>Friend requests:</div>
                            <hr/>
                            {newFriendRequests.length === 0 && oldFriendRequests.length === 0 &&
                                <div className='smallDesc' id='noRequest'>You don't have any friend request at the moment.</div>
                            }
                            {newFriendRequests.map((singleRequest,index)=>(
                                <React.Fragment key={index}>
                                    {singleRequest.notification.opened === false &&
                                        <div className='dropButton3'name='notOpened'>
                                            <Link className='standard' to={`/profile/${singleRequest.friend_request._id}`} onClick={(e)=>goFriendProfile(e, singleRequest.friend_request._id)}>
                                                <img className='smallProfilePic' src={singleRequest.friend_request.profile_pic ? singleRequest.friend_request.profile_pic : defaultProfile} alt='profile pic'/>
                                                <div className='postBasicDetail'>
                                                    <div className='profileFullName'>{singleRequest.friend_request.name} {singleRequest.friend_request.surname}</div>
                                                    <div className='smallDesc'>{moment(singleRequest.notification.date).fromNow()}</div>
                                                </div>
                                            </Link> 
                                            <button className='addFriend' id='acceptRequest' name={singleRequest.friend_request._id} onClick={(e)=>confirmFriend(e)}>Confirm</button>
                                        </div>
                                    }
                                </React.Fragment>
                            ))}
                            {oldFriendRequests.map((singleRequest,index)=>(
                                <React.Fragment key={index}>
                                    <div className='dropButton3' name='opened'>
                                        <Link className='standard' to={`/profile/${singleRequest.friend_request._id}`} onClick={(e)=>goFriendProfile(e, singleRequest.friend_request._id)}>
                                            <img className='smallProfilePic' src={singleRequest.friend_request.profile_pic ? singleRequest.friend_request.profile_pic : defaultProfile} alt='profile pic'/>
                                            <div className='postBasicDetail'>
                                                <div className='profileFullName'>{singleRequest.friend_request.name} {singleRequest.friend_request.surname}</div>
                                                <div className='smallDesc'>{moment(singleRequest.notification.date).fromNow()}</div>
                                            </div>
                                        </Link>
                                        <button className='addFriend' id='acceptOldRequest' name={singleRequest.friend_request._id} onClick={(e)=>confirmFriend(e)}>Confirm</button>
                                    </div> 
                                </React.Fragment>
                            ))}
                        </div>
                    </>}
                </div>
                <div ref={wrapperRef}>
                    <button className='iconNav' onClick={(e)=>openProfileOption(e)}>
                        <img className='smallProfilePic' src={profile.profile_pic ? profile.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"></img>
                    </button>
                    <div className='profileMenu' >
                        <button className='dropButton' onClick={(e)=>goToProfile(e)}>
                            <img className='smallProfilePic' src={profile.profile_pic ? profile.profile_pic : defaultProfile} alt='profile pic'/>
                            <div className='profileFullName'>{profile.name} {profile.surname}</div>
                        </button>
                        <button className='dropButton' onClick={(e)=>logOutUser(e)}>
                            <FontAwesomeIcon className='circleLogOut' icon="fa-solid fa-right-from-bracket" />
                            <div>Logout</div>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
export default Navbar;