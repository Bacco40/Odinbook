import './App.css';
import Navbar from './Components/navbar';
import Login from './Components/Login';
import Home from './Components/Home';
import Profile from './Components/Profile';
import PostDetail from './Components/PostDetail';
import UserMessages from './Components/UserMessages';
import { Route, Routes, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import axios from 'axios';

function App() {
  const [logged,setLogged] = useState(false);
  const [currentUser,setCurrentUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const [possibleFriends, setPossibleFriends] = useState(null);
  const [updateCurrentUser, setUpdateCurrentUser] = useState(false);
  const [friendRequests, setFriendRequests] = useState(null);
  const [savedPost, setSavedPost] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageRead,setMessageRead] = useState(false);

  const redirect = useNavigate();

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  useEffect(()=>{
    if(updateCurrentUser === true){
      const user = localStorage.getItem('user');
      axios.get(`http://localhost:5000/api/home/user/${user}`)
      .then(res => {
        if(res.data.user){
          setCurrentUser(res.data.user);
          setSavedPost(res.data.saved_post);
          setUpdateCurrentUser(false);
        }
        else{
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('username');
          setLogged(false);
        }
      })
    }
  },[updateCurrentUser])

  useEffect(()=>{
    const token=localStorage.getItem('token');
    if(token){
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`http://localhost:5000/api/test`)
      .then(res => {
        setLogged(true);
      })
    }else{
      const token2= getCookie('token');
      if(token2 !== ""){
        axios.defaults.headers.common['Authorization'] = `Bearer ${token2}`;
        axios.get(`http://localhost:5000/api/test`)
          .then(res => {
            localStorage.setItem('token', token2);
            setLogged(true);
          })
      }
      else{
        redirect('/login');
      }
    }
  },[logged])

  useEffect(()=>{
    if(logged === true){
      const user = localStorage.getItem('user');
      axios.get(`http://localhost:5000/api/home/user/${user}`)
      .then(res => {
        if(res.data.user){
          setSavedPost(res.data.saved_post);
          setCurrentUser(res.data.user);
          setLoading(false)
        }
        else{
          const user2 = getCookie('user');
          if(user2 !== ""){
            localStorage.setItem('user', user2);
            axios.get(`http://localhost:5000/api/home/user/${user2}`)
            .then(res => {
              if(res.data.user){
                setCurrentUser(res.data.user);
                setLoading(false)
              }
            })
          }
          else{
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('username');
            setLogged(false);
          }
        }
      })
    }
  },[logged])

  useEffect(()=>{
    if(currentUser){
      axios.get(`http://localhost:5000/api/possiblefriend/${currentUser._id}`)
        .then(res =>{
          if(res.data.user){
            setPossibleFriends(res.data.user);
          }
        })
    }
  },[currentUser])

  return (
    <div className="App">
      <header>
        {logged === true && loading === false &&
          <Navbar 
            setLogged={setLogged} 
            profile={currentUser} 
            setFriendRequests={setFriendRequests}
            setUpdateCurrentUser={setUpdateCurrentUser}
            messageRead={messageRead}
            setMessageRead={setMessageRead}
            setSelectedChat={setSelectedChat}
          />
        }
      </header>
      <main>
        <Routes>
          <Route path='/' element={
            <Home 
              logged={logged} 
              profile={currentUser} 
              loading={loading} 
              setProfile={setCurrentUser} 
              setLoading = {setLoading}
              setLogged={setLogged}
              possibleFriends={possibleFriends}
              currentUser={currentUser}
              setUpdateCurrentUser={setUpdateCurrentUser}
              savedPost={savedPost}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              setMessageRead={setMessageRead}
            />
          }/>
          <Route path='/login' element={
            <Login setLogged={setLogged}/>
          }/>
          <Route path='/profile/:id' element={
            <Profile 
              logged={logged} 
              setLogged={setLogged} 
              currentUser={currentUser} 
              setUpdateCurrentUser={setUpdateCurrentUser}
              friendRequests={friendRequests}
              setSelectedChat={setSelectedChat}
            />
          }/>
          <Route path='/post/:id' element={
            <PostDetail
              logged={logged} 
              currentUser={currentUser} 
              setUpdateCurrentUser={setUpdateCurrentUser}
            />
          }/>
          <Route path='/message/:id' element = {
            <UserMessages
              currentUser={currentUser}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              setMessageRead={setMessageRead}
            />
          }/>
        </Routes>
      </main>
    </div>
  );
}

export default App;
