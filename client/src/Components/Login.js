import axios from 'axios';
import {Link,useNavigate} from 'react-router-dom';
import {useEffect, useRef, useState} from 'react';
import Moment from 'moment';
import Snackbar from './Snackbar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faXmark);


function Login({setLogged}){
    let redirect =useNavigate();
    const days =[];
    const years = [];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const [message, setMessage] = useState("");
    const snackbarRef = useRef(null);

    for(let i=1;i<32;i++){
        days.push(i);
    }
    for(let a=2022;a>1960;a--){
        years.push(a);
    }

    function openRegistrationForm(e){
        e.preventDefault();
        document.querySelector('.register').style.cssText = 'display:flex;';
        const x = window.matchMedia("(max-width: 950px)")
        if(x.matches){
            document.querySelector('.logInPage').style.cssText = 'padding:0;';
        }
    }

    function closeRegistrationForm(e){
        e.preventDefault();
        document.querySelector('.register').style.cssText = 'display:none;';
        const x = window.matchMedia("(max-width: 950px)")
        if(x.matches){
            document.querySelector('.logInPage').style.cssText = 'padding:15px;';
        }
    }

    function registerUser(e){
        e.preventDefault();
        let day= document.querySelector('#birthDay').value;
        let month= document.querySelector('#birthMonth').value;
        const year= document.querySelector('#birthYear').value;
        const name= document.querySelector('#name').value;
        const surname= document.querySelector('#surname').value;
        const password= document.querySelector('#passReg').value;
        const confPassword= document.querySelector('#confPass').value;
        const username= document.querySelector('#usernameReg').value;
        const bio= `Hello everyone! my name is ${name} ${surname} 👋`;
        let date_of_birth='';
        if(month.length === 1){
            month= `0${month}`;
        }
        if(day.length === 1){
            day= `0${day}`;
        }
        if(Moment(`${day}/${month}/${year}`, "DD/MM/YYYY", true).isValid()){
            date_of_birth=`${year}/${month}/${day}`;
            axios.post(`/api/signup`, {username,password,confPassword,date_of_birth,bio,name,surname})
            .then(res => {
                if(!res.data.errors){
                    document.querySelector('.register').style.cssText = 'display:none;'
                    document.querySelector('#registerUser').reset();
                    setMessage('User created successfully! Please log in with your credentials!')
                    snackbarRef.current.show();
                }else{
                    setMessage('Error during the user creation! Please check the data and try again')
                    snackbarRef.current.show();
                }
            })
        }else{
            document.querySelector('.errorReg').innerHTML='Please insert a valid date';
        }
    }

    function logUserGoogle(e){
        e.preventDefault();
        window.open('/api/login/google', '_self')
    }

    function logDemoUser(e){
        e.preventDefault();
        const username = 'Nick_Jo';
        const password = 'TRkg2PA76vAAaQ8';
        axios.post(`/api/login`, {username,password})
            .then(res => {
                if(res.data.user !== false)
                {
                    const token = res.data.token;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', res.data.user._id);
                    localStorage.setItem('username', res.data.user.username);
                    setLogged(true);
                    redirect('/');
                }
                else{
                    document.querySelector('.error').innerHTML='Incorrect username or password';
                }
         })
    }
    
    function logUser(e){
        e.preventDefault();
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#pass').value;
        axios.post(`/api/login`, {username,password})
            .then(res => {
                if(res.data.user !== false)
                {
                    const token = res.data.token;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', res.data.user._id);
                    localStorage.setItem('username', res.data.user.username);
                    setLogged(true);
                    redirect('/');
                }
                else{
                    document.querySelector('.error').innerHTML='Incorrect username or password';
                }
         })
    }

    useEffect(()=>{
        const token=localStorage.getItem('token');
        if(token){
            redirect('/');
        } 
    },[])

    return (
        <div className="logInPage">
            <div className='logTitle'>
                <img className='logo' src='https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5SId3UHWd.svg' alt='Facebook'/>
                <p className='bigSubtitle'>Facebook helps you connect and share with the people in your life.</p>
            </div>
            <form className='formLog' >
                <div className="formContent">
                    <input className="inputLogIn" name="username" id="username" placeholder="Username" type="text"/>
                    <input className="inputLogIn" id="pass" name="password" type="password" placeholder="Password" />
                    <div className='error'></div>
                    <button className="buttonMenu" onClick={(e)=>logUser(e)}>Log In</button>
                    <div className='loginOption'>
                        <div className='facebookLog' onClick={(e)=>logUserGoogle(e)}>Login with Google?</div>
                        <div className='facebookLog' onClick={(e)=>logDemoUser(e)}>Login with Sample User?</div>
                    </div>
                </div><hr className='hrLog'/>
                <button className="buttonMenu2" onClick={(e)=> openRegistrationForm(e)}>Create New Account</button>
            </form>
            <div className='register'>
                <form className='formReg' id='registerUser'>
                    <div className='formTitle'>
                        <div>
                            <h2 className='formTitle'>Sign Up</h2>
                            <p className='smallSub'>It's quick and easy.</p>
                        </div>
                        <div className='closeForm' onClick={(e)=> closeRegistrationForm(e)}>
                            <FontAwesomeIcon icon="fa-solid fa-xmark" />
                        </div>
                    </div>
                    <div className="formContent">
                        <hr/>
                        <div className='regName'>
                            <input className="inputLogIn3" name="name" id="name" placeholder="First name" type="text"/>
                            <input className="inputLogIn3" id="surname" name="surname" type="surname" placeholder="Surname" />
                        </div>
                        <input className="inputLogIn2" name="username" id="usernameReg" placeholder="Username" type="text"/>
                        <input className="inputLogIn2" id="passReg" name="password" type="password" placeholder="New password" />
                        <input className="inputLogIn2" id="confPass" name="confPassword" type="password" placeholder="Confirm password" />
                        <label className='smallDesc2' htmlFor='birth'>Date of birth:</label>
                        <div className='regName'>
                            <select id='birthDay' className='selectForm'>
                                {days.map((day,index)=>{
                                    return <option id={day} key={index} value={index+1}>{day}</option>
                                })}
                            </select>
                            <select id='birthMonth' className='selectForm'>
                                {months.map((day,index)=>{
                                    return <option id={day} key={index} value={index+1}>{day}</option>
                                })}
                            </select>
                            <select id='birthYear' className='selectForm'>
                                {years.map((day,index)=>{
                                    return <option id={day} key={index} value={day}>{day}</option>
                                })}
                            </select>
                        </div>
                        <p className='smallDesc'>
                            This is not the real Facebook but just a project made for the Odin Curriculum,
                            check out my other projects <a className='gitLink' href="https://github.com/Bacco40" target="_blank" rel="noreferrer">here</a>
                        </p>
                        <div className='errorReg'></div>
                        <button className="buttonMenu2" onClick={(e)=> registerUser(e)}>Sign Up</button>
                    </div>
                </form>
            </div>
            <Snackbar ref={snackbarRef} message={message}/>
        </div>
            
    )
}
export default Login;