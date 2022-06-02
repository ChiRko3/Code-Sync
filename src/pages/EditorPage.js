import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { initSocket } from '../socket'
import Client from '../components/Client'
import Editor from '../components/Editor'
import ACTIONS from '../Actions'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom'
const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const { RoomId } = useParams();
    const [clients, setclients] = useState([])
    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }
            // console.log(location);
            socketRef.current.emit(ACTIONS.JOIN, {
                RoomId,
                UserName: location.state?.UserName
            });

            // listening to joined event
            socketRef.current.on(ACTIONS.JOINED, ({ clients, UserName, socketId }) => {
                if (UserName !== location.state.UserName) {
                    toast.success(`${UserName} has Joined the room`);
                }
                setclients(clients)
            })
            // listening for disconnect
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} Left the room`);
                setclients((prev) => {
                    return prev.filter(
                        (client) => client.socketId !== socketId
                    )
                })
            })
        }
        init();
        // never forget to close listners as it can lead to memory leak, the function returning from useEffect is called cleaning function 
        return () => {
            return () => {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED).disconnect();
                socketRef.current.off(ACTIONS.DISCONNECTED).disconnect();
            };

        }
    }, [])

    if (!location.state) {
        return <Navigate to="/" />;
    }
    const CopyHandler = async () => {
        try {
            await navigator.clipboard.writeText(RoomId)
            toast.success(`Copied to clipboard`)
        } catch (error) {
            toast.error('Something Went Wrong')
        }
    }
    const LeaveHandler = () => {
        reactNavigator('/')
    }
    return (
        <div className='mainWrap'>
            <div className='aside'>
                <div className='asideInner'>
                    <div className='logo'>
                        <img className='logoImage' src='/code-sync.png' alt='code-sync-logo' />
                    </div>
                    <h3>Connected</h3>
                    <div className='clientsList'>
                        {
                            clients.map((client) => (
                                <Client key={client.socketId} username={client.username} />
                            ))
                        }
                    </div>
                </div>
                <button className='btn copyBtn' onClick={CopyHandler}>Copy room Id</button>
                <button className='btn leaveBtn' onClick={LeaveHandler}>Leave Room</button>
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={RoomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    )
}

export default EditorPage
