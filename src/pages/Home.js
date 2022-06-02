import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';
const Home = () => {
    const navigate = useNavigate();  // also a hook
    const [RoomId, setRoomId] = useState('')
    const [UserName, setUserName] = useState('')

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom()
        }

    }

    const createNewRoom = (e) => {
        e.preventDefault();
        const roomId = uuid();
        setRoomId(roomId);
        toast('RoomID created', {
            icon: '✔️'
        })
    }


    const joinRoom = () => {
        if (!RoomId || !UserName) {
            toast.error("Both field are required")
            return;
        }
        // we can send data from one page to another, like this info will be availabe on main home page but we need to /// send it to editor page, so we can pass data along the route.
        navigate(`/editor/${RoomId}`, {
            state: {
                UserName
            }
        })
    }
    return (
        <div className='homePageWrapper'>
            <div className='formWrapper'>
                <img className='homePageLogo' src='./code-sync.png' alt='code-sync-logo' />
                <h4 className='mainLabel'>Paste Invitation Room ID</h4>
                <div className='inputGroup'>
                    <input onChange={(e) => { setRoomId(e.target.value) }} value={RoomId} type='text' className='inputBox' placeholder='ROOM ID' onKeyUp={handleInputEnter} />
                    <input onChange={(e) => { setUserName(e.target.value) }} value={UserName} type='text' className='inputBox' placeholder='USERNAME' onKeyUp={handleInputEnter} />
                    <button onClick={joinRoom} className='btn joinBtn'>Join</button>
                    <span className='createInfo'>
                        if you don't have an invite then create &nbsp;
                        <a onClick={createNewRoom} className='createNewBtn'>new room</a>
                    </span>
                </div>

            </div>
            <footer>
                <h4>
                    Built with ❤️ by Chirag
                </h4>
            </footer>
        </div>
    )
}

export default Home