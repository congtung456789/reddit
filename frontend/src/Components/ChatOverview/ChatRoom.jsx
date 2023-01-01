import React, {useEffect, useRef, useState} from "react";
import {IoIosArrowRoundBack} from "react-icons/io";
import {BsFillFileArrowUpFill, BsThreeDotsVertical,BsEmojiSmile} from "react-icons/bs";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {io} from "socket.io-client";
import "./chatroom.css";
import {useNavigate, useParams} from "react-router-dom";
import Message from "./Message";
import InputField from "../InputFields/Input";
import {BiImageAdd} from "react-icons/bi";
import "./uploadimageorfile.css";
import {setPopup, setPopupRename, setRemoveMember, setShowAction} from "../../redux/navigateSlice";
import AddMember from "./RoomFunction/AddMember";
import Popup from "../PopUp/popUp";
import "../PopUp/popUp.css";
import ChangeNameGroup from "./RoomFunction/ChangeNameGroup";
import RemoveMember from "./RoomFunction/RemoveMember";
import Picker from 'emoji-picker-react';
import {isFileImage,isExtImage} from '../../utils/listContainer';

const ChatRoom = () => {
    const user = useSelector((state) => state.user.user?.currentUser);
    const room = useSelector((state) => state.nav.message.room);
    const roomNameGroup = useSelector((state) => state.nav.roomName.name);
    const addMember = useSelector((state) => state.nav.showAddMember.open);
    const removeMember = useSelector((state) => state.nav.removeMember.open);
    const popup =  useSelector((state) => state.nav.popup.open);
    const popupChangeName =  useSelector((state) => state.nav.roomName.open);
    const [previewSource, setPreviewSource] = useState("");
    const [previewFileData, setPreviewFile] = useState(null);
    const [messages, setMessage] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [receivedMsg, setReceivedMsg] = useState("");
    const [emoji, setEmoji] = useState(false);
    const socket = useRef();
    const [partner, setPartner] = useState([]);
    const navigate = useNavigate();
    const scrollRef = useRef();
    const {id} = useParams();
    const dispatch = useDispatch();
    const removeAllPopUp = ()=>{
        dispatch(setShowAction(false));
        dispatch(setRemoveMember(false));
        dispatch(setPopupRename(false));
        dispatch(setPopup(false));

    }
    const axiosInstance = axios.create({
        headers: {
            token: `Bearer ${user?.accessToken}`,
        },
    });
    // kiểm tra xem đang là loại màn hình nào
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });
    const [isMobile, setMobile] = useState(true);
    useEffect(() => {
        const handleSize = () => {
            setWindowSize({
                width: window.innerWidth,
                heigth: window.innerHeight,
            });
        };
        window.addEventListener("resize", handleSize);
        handleSize();
        return () => window.removeEventListener("resize", handleSize);
    }, []);
    useEffect(() => {
        if (windowSize.width > 500) {
            setMobile(false);
        } else {
            setMobile(true);
        }
    }, [windowSize]);


    const handleGoBack = () => {
        removeAllPopUp();
        navigate("/");
        socket.current.disconnect();
    };
    const handlePopup = () => {
        dispatch(setPopup(!popup)) ;
    };

    useEffect(() => {
        socket.current = io(`${process.env.REACT_APP_SOCKET_URL}`, {
            transports: ["websocket"],
        });
        socket.current.on("getMessage", (data) => {
            setReceivedMsg({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            });
        });
        socket.current.on("receiveImage", (data) => {
            setReceivedMsg({
                sender: data.senderId,
                text: data.urlFileName,
                type: data.type,
                isFile: true,
                createdAt: Date.now(),
            });
        });
    }, [socket]);

    useEffect(() => {
        receivedMsg &&
        room?.members.includes(receivedMsg.sender) &&
        setMessage((prev) => [...prev, receivedMsg]);
    }, [receivedMsg, room]);

    useEffect(() => {
        socket.current.emit("addUser", user?._id);
    }, [user]);

    useEffect(() => {
        const getMessage = async () => {
            try {
                let partnerId = room?.members.filter((m) => m !== user?._id);
                partnerId.push(room?.membersRemove);
                axiosInstance.post(`${process.env.REACT_APP_BACKEND_URL}/users/get-all-user-with-id`,{
                    users: partnerId,
                }).then((res)=>{
                    setPartner(res.data);
                });
                axiosInstance.get(`${process.env.REACT_APP_BACKEND_URL}/message/${room._id}`).then((msgRes)=>{
                    setMessage(msgRes.data);
                }).catch((err) => {
                    console.log(err);
                });
            } catch (e) {
                console.log(e);
            }
        };
        getMessage();
    }, [room]);

    const submitMessage = async () => {
        if (newMsg.length === 0 && previewSource.length === 0) {
            console.log("Empty msg");
        } else if (newMsg.length !== 0) {
            const message = {
                sender: user?._id,
                text: newMsg,
                conversationId: id,
                isFile: false
            };
            const receiverId = [];
             partner.forEach((value,index)=>{
                 receiverId.push(value?._id);
            });
            socket.current.emit("sendMessage", {
                senderId: user._id,
                receiverId,
                text: newMsg,
            });
            try {
                const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/message`, message, {
                    headers: {token: `Bearer ${user.accessToken}`},
                });
                console.log(res.data);
                setMessage([...messages, res.data]);
                setNewMsg("");
            } catch (err) {
                console.log(err);
            }
        } else {
            const receiverId = [];
            partner.forEach((value,index)=>{
                    receiverId.push(value?._id);
            });
            let ext = previewSource.split(',')[0].split(':')[1].split(';')[0].split("/")[1];
            let fileName = new Date().getTime().toString() + "." + ext;
            let file = "img";
            if(!isExtImage(previewSource)){
                file = "video";
            }
            const message = {
                sender: user?._id,
                text: fileName,
                conversationId: id,
                isFile: true,
                type:file
            };
            socket.current.emit("sendPhoto", {
                senderId: user._id,
                receiverId,
                data: previewFileData,
                fileName: fileName
            });
            try {
                const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/message`, message, {
                    headers: {token: `Bearer ${user.accessToken}`},
                });
                console.log("Gía trị respone là ");
                console.log(res.data);
                res.data.text = previewSource;
                setMessage([...messages, res.data]);
                setNewMsg("");
                setPreviewSource("");
                setPreviewFile(null);
            } catch (err) {
                console.log(err);
            }
        }
    };
    const onEmojiClick = (event, emojiObject) => {
        let newMessage = newMsg+event.emoji;
        console.log(newMessage);
        setNewMsg(newMessage);
    };
    useEffect(() => {
        return scrollRef?.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        previewFile(file);
    };
    const previewFile = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewSource(reader.result);
            setPreviewFile(file);
        };
    };
    const removePreviewSrc = () => {
        setPreviewSource("");
        setPreviewFile(null);
    };
    const showEmoji = () => {
        setEmoji(!emoji);
    }
    const showEmojiOff = ()=>{
        setEmoji(false);
    }
    return (
        <section className="convo-container">
            <div className="convo-header">
                <div className="message-header">
                    <div className="go-back-convo" onClick={handleGoBack}>
                        <IoIosArrowRoundBack size={"42px"}/>
                    </div>
                    {roomNameGroup}
                    <div className="add-member" onClick={handlePopup}>
                        <BsThreeDotsVertical size={"20px"}/>
                    </div>
                </div>
                <div className="search-user-add">
                    {popup && (
                        <>
                            <p className="close close-icon" onClick={handlePopup}>x</p>
                            <Popup
                                conversationId = {id}
                                socket={socket}
                            />
                        </>
                    )}
                    {addMember && (<AddMember/>)}
                    {popupChangeName && (
                        <ChangeNameGroup
                            conversationId = {id}
                        />)}
                    {removeMember && (<RemoveMember
                        conversationId = {id}
                    />)}
                </div>
            </div>
            <div className="chat-box-top">
                {messages.map((msg) => {
                    const partnerUser = partner.filter(i => i._id === msg.sender);
                    return (
                        <div ref={scrollRef} className="msg-container">
                            <Message
                                message={msg}
                                own={msg.sender === user._id}
                                partner={partnerUser[0]}
                            />
                        </div>
                    );
                })}
            </div>
            {previewSource && (
                <div className="makepost-img-preview">
                    <p className="remove-preview" onClick={removePreviewSrc}>
                        {" "}
                        X{" "}
                    </p>
                    {isExtImage(previewSource)?(
                        <img src={previewSource} alt="chosen"/>
                    ):(
                        <video src={previewSource} controls className={"imageSendData"}></video>
                    )}

                </div>
            )}
            <div className="chat-box-bot">
                <div className={"inputField"} onClick={showEmojiOff}>
                    <InputField
                        classStyle="chat-msg-input"
                        inputType="textarea"
                        placeholder="write something..."
                        setData={setNewMsg}
                        value={newMsg}
                        data={newMsg}
                    />
                </div>

                {!isMobile && ( <div className="upload-web">
                        <div className="image-upload">
                            <BsEmojiSmile onClick={showEmoji}/>
                        </div>
                    <div className="image-upload"  onClick={showEmojiOff}>
                        <label htmlFor="file-input">
                            <BiImageAdd/>
                        </label>
                        <input id="file-input"
                               type="file"
                               name="image"
                               onChange={handleFileInputChange}/>
                    </div>
                    {/*<div className="image-upload"  onClick={showEmojiOff}>*/}
                    {/*    <label htmlFor="file-input-folder">*/}
                    {/*        <BsFillFileArrowUpFill/>*/}
                    {/*    </label>*/}
                    {/*    <input id="file-input-folder"*/}
                    {/*           type="file"*/}
                    {/*           name="image"*/}
                    {/*           onChange={handleFileInputChange}/>*/}
                    {/*</div>*/}
                </div>
                )}
                {emoji && (
                    <div className={"emoji-show"}>
                        <Picker onEmojiClick={onEmojiClick} disableAutoFocus={true} native />
                    </div>
                )}
                <button className="chat-submit" onClick={submitMessage}>
                    Send
                </button>
            </div>
            {isMobile && ( <footer className="upload">
                <div className="image-upload">
                    <label htmlFor="file-input">
                        <BiImageAdd/>
                    </label>
                    <input id="file-input"
                           type="file"
                           name="image"
                           onChange={handleFileInputChange}/>
                </div>
                <div className="image-upload">
                    <label htmlFor="file-input-folder">
                        <BsFillFileArrowUpFill/>
                    </label>
                    <input id="file-input-folder"
                           type="file"
                           name="image"
                           onChange={handleFileInputChange}/>
                </div>
            </footer>)}
        </section>
    );
};

export default ChatRoom;
