import axios from 'axios';
import defaultProfile from './profile.jpg';
import {Link,useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {faImages, faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faXmark, faImages);

function AddFriend({singleUser, currentUser,setUpdateCurrentUser, option}){
    const [requested, setRequested] = useState(null)

    function addFriend(e){
        e.preventDefault();
        const user_id = e.target.name;
        axios.post(`/api/addFriend/${currentUser._id}` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    function removeRequest(e){
        e.preventDefault();
        const user_id =e.target.name;
        axios.put(`/api/cancelRequest/${currentUser._id}` , {user_id})
            .then(res => {
                if(!res.data.errors){
                    setUpdateCurrentUser(true);
                    setRequested(null)
                }else{
                    console.log(res.data.errors)
                }
            }) 
    }

    useEffect(()=>{
        for(let i = 0; i < currentUser.friends.length; i++){
            if(currentUser.friends[i].user_id._id === singleUser._id ){
                setRequested(true)
            }
        }
    },[singleUser])

    return (
        <>
            {singleUser._id !== currentUser._id && 
            <>
                {option === 1 &&
                    <Link to={`/profile/${singleUser._id}`}  className='addFriendLink'>
                        <img className='smallProfilePic' src={singleUser.profile_pic ? singleUser.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                        <div className='commentName'>{singleUser.name} {singleUser.surname} </div>
                        {requested === true &&
                            <button className='addFriend' name={singleUser._id} onClick={(e) => removeRequest(e)}> Cancel Request</button>
                        }
                        {requested === null &&
                            <button className='addFriend' name={singleUser._id} onClick={(e) => addFriend(e)}> Add friend</button>
                        }
                    </Link>
                }
                {option === 2 &&
                    <Link to={`/profile/${singleUser._id}`}  className='addFriendBig'>
                        <img className='postPicBig' src={singleUser.profile_pic ? singleUser.profile_pic : defaultProfile} alt='profile pic' referrerPolicy="no-referrer"/>
                        <div className='padding'>
                            <div className='commentName'>{singleUser.name} {singleUser.surname} </div>
                            {requested === true &&
                                <button className='addFriend2' name={singleUser._id} onClick={(e) => removeRequest(e)}> Cancel Request</button>
                            }
                            {requested === null &&
                                <button className='addFriend2' name={singleUser._id} onClick={(e) => addFriend(e)}> Add friend</button>
                            }
                        </div>
                    </Link>
                }
            </>
            }
        </>    
    )
}
export default AddFriend;