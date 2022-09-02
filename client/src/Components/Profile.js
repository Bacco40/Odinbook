import axios from 'axios';
import defaultProfile from './profile.jpg';
import loadingGif from './loading.gif';
import React from 'react';
import loadingGif2 from './loading2.gif';
import defaultCover from './Panorama.jpg';
import CreatePost from './CreatePost';
import EditPost from './EditPost';
import SinglePost from './SinglePost';
import {useNavigate,useParams,Link} from 'react-router-dom';
import Moment from 'moment';
import {useEffect,useState} from 'react';
import {getStorage,ref,uploadBytesResumable,getDownloadURL} from 'firebase/storage';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCamera, faPencil, faUserCheck, faUserPlus, faUserXmark} from '@fortawesome/free-solid-svg-icons';
import { faFacebookMessenger } from '@fortawesome/free-brands-svg-icons';
library.add(faPencil,faCamera, faUserPlus, faUserXmark, faUserCheck,faFacebookMessenger);

function Profile({logged, setUpdateCurrentUser, currentUser,friendRequests, setSelectedChat}){
    const [profileSelection, setProfileSelection] = useState(1);
    const [selectedSection, setSelectedSection] = useState('#postSection');
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState(null);
    const [loadFriend, setLoadFriend] = useState(true);
    const [uploading, setUploading] = useState(null);
    const [uploading2, setUploading2] = useState(null);
    const [loading, setLoading] = useState(true)
    const [filePic,setFilePic] = useState();
    const [fileBack, setFileBack] = useState();
    const [isFriend, setIsFriend] = useState(0);
    const [backgroundUrl,setBackgroundUrl] = useState();
    const [profileUrl,setProfileUrl] = useState();
    const [type, setType] = useState(0);
    const [type2, setType2] = useState(0);
    const [firstTry, setFirstTry] = useState(0);
    const {id} = useParams();
    const redirect = useNavigate();
    const [check,setCheck] = useState(null);
    const days =[];
    const years = [];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    for(let i=1;i<32;i++){
        days.push(i);
    }
    for(let a=2022;a>1960;a--){
        years.push(a);
    }

    function startAtTop(){
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
      }

    function openRegistrationForm(e){
        e.preventDefault();
        const y=window.scrollY;
        document.querySelector('.register').style.cssText = `display:flex; top:${y}px;`;
        document.body.style.overflow = "hidden";
        setType(0)
        setType2(0)
        setBackgroundUrl();
        setFileBack()
        setProfileUrl();
        setFilePic();
    }

    function closeRegistrationForm(e){
        e.preventDefault();
        document.querySelector('.register').style.cssText = 'display:none;';
        document.body.style.overflow = "";
    }

    function openRemoveForm(e){
        e.preventDefault();
        const y=window.scrollY;
        document.querySelector('.createPost2').style.cssText = `display:flex; top:${y}px;`;
        document.body.style.overflow = "hidden";
    }

    function closeRemoveForm(e){
        e.preventDefault();
        document.querySelector('.createPost2').style.cssText = 'display:none;';
        document.body.style.overflow = "";
    }

    function uploadImage(e){
        const file = e.target.files[0];
        if (file.type.match('image.*') && e.target.className ==="uploadCoverPic"){
          setBackgroundUrl(URL.createObjectURL(file));
          setFileBack(file)
          setType(1);
        }
        if (file.type.match('image.*') && e.target.className ==="uploadProfilePic"){
          setProfileUrl(URL.createObjectURL(file));
          setFilePic(file);
          setType2(1);
        }
      }

    async function saveUserDetail(e){
        e.preventDefault();
        setUploading(true);
        let day= document.querySelector('#birthDay').value;
        let month= document.querySelector('#birthMonth').value;
        const year= document.querySelector('#birthYear').value;
        const name= document.querySelector('#name').value;
        const surname= document.querySelector('#surname').value;
        const username= document.querySelector('#usernameReg').value;
        const friends= profile.friends;
        const saved= currentUser.saved_post;
        let profile_pic = null;
        let cover_pic = null;
        const bio= document.querySelector('#bio').value;
        let date_of_birth='';
        if(month.length === 1){
            month= `0${month}`;
        }
        if(day.length === 1){
            day= `0${day}`;
        }
        try {
            if(Moment(`${day}/${month}/${year}`, "DD/MM/YYYY", true).isValid()){
                date_of_birth=`${year}/${month}/${day}`;
                if(type === 1){
                    const filePath = `${profile._id}/profilePic/${fileBack.name}`;
                    const newImageRef = ref(getStorage(), filePath);
                    const fileSnapshot = await uploadBytesResumable(newImageRef, fileBack);
                    cover_pic = await getDownloadURL(newImageRef);
                    setType(0)
                }
                else{
                    cover_pic = profile.cover_pic;
                }
                if(type2 === 1){
                    const filePath = `${profile._id}/profilePic/${filePic.name}`;
                    const newImageRef = ref(getStorage(), filePath);
                    const fileSnapshot1 = await uploadBytesResumable(newImageRef, filePic);
                    profile_pic = await getDownloadURL(newImageRef);
                    setType2(0)
                }
                else{
                    profile_pic = profile.profile_pic;
                }
                axios.put(`/api/edit/${profile._id}`, {username,date_of_birth,bio,name,surname,profile_pic,cover_pic,saved,friends})
                    .then(res => {
                        if(!res.data.errors){
                            recoveUserData();
                            setUpdateCurrentUser(true);
                            closeRegistrationForm(e);
                            setUploading(false)
                        }else{
                            console.log(res.data.errors)
                        }
                    }) 
            }
            else{
                document.querySelector('.errorReg').innerHTML='Please insert a valid date';
            }
        }
        catch(error) {
            console.error('Error uploading the account to Firebase Database', error);
        }
    }

    function uploadCover(e){
        e.preventDefault();
        document.querySelector('.uploadCoverPic').click();
    }

    function uploadProfile(e){
        e.preventDefault();
        document.querySelector('.uploadProfilePic').click();
    }

    function addFriend(e){
        e.preventDefault();
        setLoadFriend(true)
        const user_id =id;
        axios.post(`/api/addFriend/${currentUser._id}` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                    recoveUserData();
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function confirmFriend(e){
        e.preventDefault();
        setLoadFriend(true)
        const user_id =id;
        axios.put(`/api/confirmFriend/${currentUser._id}` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                    recoveUserData();
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function removeRequest(e){
        e.preventDefault();
        setLoadFriend(true);
        const user_id =id;
        axios.put(`/api/cancelRequest/${currentUser._id}` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true);
                    recoveUserData();
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function removeFriend(e){
        e.preventDefault();
        setLoadFriend(true);
        const user_id =id;
        axios.put(`/api/removeFriend/${currentUser._id}` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setIsFriend(0);
                    setUpdateCurrentUser(true);
                    recoveUserData();
                    closeRemoveForm(e);
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function selectSection(e){
        e.preventDefault();
        document.querySelector(`${selectedSection}`).style.cssText = 'background-color: #ffffff';
        if(e.target.id === 'posts'){
            setProfileSelection(1)
        }
        if(e.target.id === 'friends'){
            setProfileSelection(2)
        }
        if(e.target.id === 'photos'){
            setProfileSelection(3)
        }
    }

    function recoveUserData(){
        axios.get(`/api/user/${id}`)
          .then(res => {
            if(res.data.user){
              setProfile(res.data.user)
              setPosts(res.data.posts)
              setLoading(false)
            }
            else{
              redirect('/login');
            }
          })
    }

    function messageUser(e){
        e.preventDefault();
        setSelectedChat(profile)
        redirect(`/message/${currentUser._id}`)
    }

    useEffect(()=>{
        if(uploading2 === false){
            recoveUserData();
        }
    },[uploading2])

    useEffect(()=>{
        if(uploading === true && profile ){
            document.querySelector('#saveEdit').innerHTML = `<img src=${loadingGif2} class='smallLoad' alt='Loading..'/>`
            document.querySelector('#saveEdit').style.cssText = 'padding:8.5px; cursor: not-allowed;';
        }
        if(uploading === false && profile ){
            document.querySelector('#saveEdit').innerHTML = 'Update Profile';
            document.querySelector('#saveEdit').style.cssText = 'padding:15px;';
        }
    },[uploading])

    useEffect(()=>{
        if(logged === true && currentUser && loading === false && profile !== null){
            setCheck(Moment(profile.date_of_birth, 'YYYY/MM/DD'));
            document.querySelector(`${selectedSection}`).style.cssText = 'background-color: #ffffff';
            if(profileSelection === 1){
              document.querySelector('#postSection').style.cssText = 'background-color: #1877f2';
              setSelectedSection('#postSection')  
            }
            if(profileSelection === 2){
                document.querySelector('#friendSection').style.cssText = 'background-color: #1877f2';
                setSelectedSection('#friendSection')  
            }
            if(profileSelection === 3){
                document.querySelector('#photoSection').style.cssText = 'background-color: #1877f2'; 
                setSelectedSection('#photoSection') 
            }
        }
    },[profile,currentUser,loading,logged, profileSelection])

    useEffect(()=>{
        if(logged === true){
            recoveUserData();
            setProfileSelection(1);
            startAtTop();
        }
      },[id])

    useEffect(()=>{
        if(currentUser){
            recoveUserData();
        }
      },[currentUser])

      useEffect(()=>{
        if(currentUser && profile && friendRequests){
            setIsFriend(0);
            if(currentUser._id !== profile._id){
                for(let i=0; i<profile.friends.length; i++){
                    if(profile.friends[i].user_id._id === currentUser._id){
                        if(profile.friends[i].confirmed === true){
                            setIsFriend(2)
                        }
                    }
                }
                for(let a=0;a<currentUser.friends.length; a++){
                    if(currentUser.friends[a].user_id._id === profile._id){
                        if(currentUser.friends[a].confirmed === false){
                            setIsFriend(1)
                        }
                    }
                }
                for(let b=0;b<friendRequests.length; b++){
                    if(friendRequests[b].friend_request._id === profile._id){
                        setIsFriend(3)
                    }
                }
                setLoadFriend(false)
            }
        }
      },[currentUser])

      useEffect(()=>{
        if(currentUser && profile && friendRequests && firstTry === 0){
            setIsFriend(0);
            if(currentUser._id !== profile._id){
                for(let i=0; i<profile.friends.length; i++){
                    if(profile.friends[i].user_id._id === currentUser._id){
                        if(profile.friends[i].confirmed === true){
                            setIsFriend(2)
                        }
                    }
                }
                for(let a=0;a<currentUser.friends.length; a++){
                    if(currentUser.friends[a].user_id._id === profile._id){
                        if(currentUser.friends[a].confirmed === false){
                            setIsFriend(1)
                        }
                    }
                }
                for(let b=0;b<friendRequests.length; b++){
                    if(friendRequests[b].friend_request._id === profile._id){
                        setIsFriend(3)
                    }
                }
                setLoadFriend(false);
                setFirstTry(1);
            }
        }
      },[profile])

    return (
        <div className='profileContainer'>
            {logged === true && currentUser && loading === false && profile &&
            <>
                <div className='profileContainer2'>
                    <div className='topProfile'>
                        <img className='coverImage' src={profile.cover_pic ? profile.cover_pic : defaultCover} alt='cover pic'/>
                        <div className='profileSub'>
                            <div className='profileName'>
                                <img className='iconProfile' src={profile.profile_pic ? profile.profile_pic : defaultProfile} alt='profile pic'/>
                                <h1>{profile.name} {profile.surname}</h1>
                            </div>
                            {currentUser._id === profile._id &&
                                <button className='edit' onClick={(e)=> openRegistrationForm(e)}><FontAwesomeIcon icon="fa-solid fa-pencil" /> Edit Profile</button>
                            }
                            {currentUser._id !== profile._id &&
                            <>
                                {loadFriend === false &&
                                <>
                                    {isFriend === 0 &&
                                        <button className='edit1' onClick={(e)=> addFriend(e)}><FontAwesomeIcon icon="fa-solid fa-user-plus" /> Add Friend</button>
                                    }
                                    {isFriend === 1 &&
                                        <button className='edit1' onClick={(e)=> removeRequest(e)}><FontAwesomeIcon icon="fa-solid fa-user-xmark" /> Cancel Request</button>
                                    }
                                    {isFriend === 2 &&
                                    <div className='doubleButtonProfile'>
                                        <button className='edit1' onClick={(e)=> openRemoveForm(e)}><FontAwesomeIcon icon="fa-solid fa-user-check" /> &nbsp;Friends</button>
                                        <button className='edit' onClick={(e)=> messageUser(e)}><FontAwesomeIcon icon="fa-brands fa-facebook-messenger" /> &nbsp;Message</button>
                                    </div>
                                    } 
                                    {isFriend === 3 &&
                                        <button className='edit1' onClick={(e)=> confirmFriend(e)}><FontAwesomeIcon icon="fa-solid fa-user-check" />&nbsp;Confirm Request</button>
                                    } 
                                </>
                                }
                               {loadFriend === true &&
                                    <button className='edit1'><img src={loadingGif2} className='smallLoad' alt='Loading..'/></button>
                               }
                            </>
                            }
                        </div><hr/>
                        <div className='profileSection'>
                            <div>
                                <button className='section' id='posts' onClick={(e) => selectSection(e)}>Posts</button>
                                <div className='lineUnder' id='postSection' ></div>
                            </div>
                            <div>
                                <button className='section' id='friends' onClick={(e) => selectSection(e)}>Friends</button>
                                <div className='lineUnder' id='friendSection'></div>
                            </div>
                            <div>
                                <button className='section' id='photos' onClick={(e) => selectSection(e)}>Photos</button>
                                <div className='lineUnder' id='photoSection'></div>
                            </div>
                        </div>
                    </div>
                    {profileSelection === 1 &&
                        <div className='profileDefault'>
                            <div className='leftSideProfile'>
                                <div className='profilePart'>
                                    <div className='sectionTitle'>Bio:</div>
                                    <p>{profile.bio}</p>
                                </div>
                                <div className='profilePart'>
                                    <div className='profilePartTop'>
                                        <div className='sectionTitle'>Photos:</div>
                                        <button className='linkButton' id='photos' onClick={(e) => selectSection(e)}>See All Photos</button>
                                    </div>
                                    <div className='smallPicContainer'>
                                        {posts && posts.map((singlePost,index)=>(
                                        <React.Fragment key={index}>
                                            {index < 12 && singlePost.image_url[0] &&
                                                <Link key={index} to={`/post/${singlePost._id}`}>
                                                    <img className='postPicSmall' src={singlePost.image_url[0]} key={index} alt=''/>
                                                </Link>
                                            }
                                        </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                <div className='profilePart'>
                                    <div className='profilePartTop'>
                                        <div className='sectionTitle'>Friends:</div>
                                        <button className='linkButton' id='friends' onClick={(e) => selectSection(e)}>See All Friends</button>
                                    </div>
                                    <div className='smallPicContainer'>
                                        {profile && profile.friends.map((singleFriend,index)=>(
                                        <React.Fragment key={index}>
                                            {index < 12 && singleFriend.confirmed === true &&
                                                <Link to={`/profile/${singleFriend.user_id._id}`} key={index} className='friendList'>
                                                    <img className='postPicSmall' src={singleFriend.user_id.profile_pic ? singleFriend.user_id.profile_pic : defaultProfile} alt='' referrerPolicy="no-referrer"/>
                                                    <div className='commentName'>{singleFriend.user_id.name} {singleFriend.user_id.surname} </div>
                                                </Link>
                                            }
                                        </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className='rightSideProfile'>
                                {currentUser._id === profile._id &&
                                    <CreatePost profile={profile} uploading={uploading2} setUploading={setUploading2}/>
                                }
                                {posts.map((singlePost, index)=>(
                                    <React.Fragment key={index} >
                                        <SinglePost setUpdateCurrentUser={setUpdateCurrentUser} singlePost={singlePost} currentUser={currentUser} setUploading={setUploading2}/>
                                        {currentUser._id === singlePost.creator._id &&
                                            <EditPost post={singlePost} profile={currentUser} setUploading={setUploading2} uploading={uploading2}/>
                                        }
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    }
                    {profileSelection === 2 &&
                        <div className='secondarySection'>
                            <div className='profilePart2'>
                                <div className='sectionTitle'>{profile.friends.length} Friends:</div>
                                <hr/>
                                <div className='mediumPicContainer'>
                                    {profile && profile.friends.map((singleFriend,index)=>(
                                    <React.Fragment key={index}>
                                        {singleFriend.confirmed === true &&
                                            <Link to={`/profile/${singleFriend.user_id._id}`} key={index} className='friendList'>
                                                <img className='postPicMedium' src={singleFriend.user_id.profile_pic ? singleFriend.user_id.profile_pic : defaultProfile} alt='' referrerPolicy="no-referrer"/>
                                                <div className='commentName'>{singleFriend.user_id.name} {singleFriend.user_id.surname} </div>
                                            </Link>
                                        }
                                    </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                    {profileSelection === 3 &&
                        <div className='secondarySection'>
                            <div className='profilePart2'>
                                <div className='sectionTitle'>Photos:</div>
                                <hr/>
                                <div className='mediumPicContainer'>
                                    {posts && posts.map((singlePost,index)=>(
                                        <React.Fragment key={index}>
                                            {singlePost.image_url[0] &&
                                                <Link key={index} to={`/post/${singlePost._id}`}>
                                                    <img className='postPicMedium' src={singlePost.image_url[0]} key={index} alt=''/>
                                                </Link>
                                            }
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div className='register' id='updateProfile'>
                    <form className='formUpdate' autoComplete="new-password">
                        <div className='formTitle'>
                            <div></div>
                            <div>
                                <h2 className='updateTitle'>Edit Profile</h2>
                            </div>
                            <div className='closeForm' id='circleClose' onClick={(e)=> closeRegistrationForm(e)}>
                                <FontAwesomeIcon icon="fa-solid fa-xmark" />
                            </div>
                        </div>
                        <div className="formContent">
                            <hr/>
                            <img className='coverImageUpload' src={type=== 0 ? profile.cover_pic ? profile.cover_pic : defaultCover : backgroundUrl} alt='cover pic'/>
                            <div className='changeCover' onClick={(e)=>uploadCover(e)}><FontAwesomeIcon icon="fa-solid fa-camera" />&nbsp; <div>Edit cover photo</div></div>
                            <div className='profileSub'>
                                <div className='profileName' id='profileEdit'>
                                    <img className='iconProfile' src={type2 === 0 ? profile.profile_pic ? profile.profile_pic : defaultProfile : profileUrl} alt='profile pic'/>
                                    <div className='changePhoto' onClick={(e)=>uploadProfile(e)}><FontAwesomeIcon icon="fa-solid fa-camera" /></div>
                                </div>
                                <></>
                            </div>
                            <div className='regName'>
                                <input className="inputLogIn3" name="name" id="name" placeholder="First name" type="text" defaultValue={profile.name} key={profile.name}/>
                                <input className="inputLogIn3" id="surname" name="surname" type="surname" placeholder="Surname" defaultValue={profile.surname} key={profile.surname}/>
                            </div>
                            <textarea className="editBio" id="bio" minLength="3" placeholder='Bio' defaultValue={profile.bio} key={profile.bio}/>
                            <input id="username" style={{display:'none'}} type="text" name="fakeusernameremembered"/>
                            {profile.username !== 'Nick_Jo' &&
                                <input className="inputLogIn2" name="username" id="usernameReg" placeholder="Username" type="text" defaultValue={profile.username} key={profile.username}/>
                            }
                            <label className='smallDesc2' htmlFor='birth'>Date of birth:</label>
                            {check !== null &&
                                <div className='regName'>
                                    <select id='birthDay' className='selectForm'>
                                        {days.map((day,index)=>{
                                            return <option id={day} key={index} value={index+1} selected={day === +check.format('D')+1 ? true : false}>{day}</option>
                                        })}
                                    </select>
                                    <select id='birthMonth' className='selectForm'>
                                        {months.map((day,index)=>{
                                            return <option id={day} key={index} value={index+1} selected={index+1 === +check.format('M') ? true : false}>{day}</option>
                                        })}
                                    </select>
                                    <select id='birthYear' className='selectForm'>
                                        {years.map((day,index)=>{
                                            return <option id={day} key={index} value={day} selected={day === +check.format('Y') ? true : false}>{day}</option>
                                        })}
                                    </select>
                                </div>
                            }
                            <div className='errorReg'></div>
                            <input className='uploadProfilePic' type="file" onChange={uploadImage}></input>
                            <input className='uploadCoverPic' type="file" onChange={uploadImage}></input>
                            <button className="buttonMenu2" id='saveEdit' onClick={(e) => saveUserDetail(e)}>Update Profile</button>
                        </div>
                    </form>
                </div>
                <div className='createPost2'>
                    <form className='formUpdate' id='formPost'>
                        <div className='formTitle'>
                            <div></div>
                            <div>
                                <h2 className='updateTitle'>Remove Friend</h2>
                            </div>
                            <div className='closeForm' id='circleClose' onClick={(e) => closeRemoveForm(e)}>
                                <FontAwesomeIcon icon="fa-solid fa-xmark" />
                            </div>
                        </div>
                        <div className="formContent">
                            <hr/>
                            <div className='biggerText'> Do you wish to remove {profile.name} {profile.surname} from your friends?</div>
                        </div>
                        <div className='standard1'>
                            <button className='edit' onClick={(e) => closeRemoveForm(e)}>Cancel</button>
                            <button className='edit' id='removeFriends' onClick={(e) => removeFriend(e)}>Confirm</button>
                        </div>
                    </form>
                </div>
            </>
            }
            {loading === true &&
                <div className="homeLoad">
                    <img src={loadingGif} alt='Loading...'/>
                </div>
            }
        </div>
    )
}
export default Profile;