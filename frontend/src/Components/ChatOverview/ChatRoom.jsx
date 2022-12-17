import React, {useEffect, useRef, useState} from "react";
import {IoIosArrowRoundBack} from "react-icons/io";
import {BsFillFileArrowUpFill, BsThreeDotsVertical} from "react-icons/bs";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {io} from "socket.io-client";
import "./chatroom.css";
import {useNavigate, useParams} from "react-router-dom";
import Message from "./Message";
import {baseURL} from "../../utils/listContainer";
import InputField from "../InputFields/Input";
import {BiImageAdd} from "react-icons/bi";
import "./uploadimageorfile.css";
import {setShowAction} from "../../redux/navigateSlice";
import Popup from "../PopUp/popUp";
import "../PopUp/popUp.css";
const ChatRoom = () => {
    const user = useSelector((state) => state.user.user?.currentUser);
    const room = useSelector((state) => state.nav.message.room);
    const roomNameGroup = useSelector((state) => state.nav.roomName.name);
    const setOpen =  useSelector((state) => state.nav.showAddMember.open);
    const [previewSource, setPreviewSource] = useState("");
    const [previewFileData, setPreviewFile] = useState(null);
    const [messages, setMessage] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [receivedMsg, setReceivedMsg] = useState("");
    const socket = useRef();
    const [partner, setPartner] = useState([]);
    const navigate = useNavigate();
    const scrollRef = useRef();
    const {id} = useParams();
    const dispatch = useDispatch();
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
        navigate("/");
        socket.current.disconnect();
    };
    const handleOpenAddUser = () => {
        console.log("Gía trị của nó là " +!setOpen);
        dispatch(setShowAction(!setOpen)) ;
    };

    useEffect(() => {
        socket.current = io("http://192.168.0.103:8089", {
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
                const partnerId = room?.members.filter((m) => m !== user?._id);

                axiosInstance.post(`${baseURL}/users/get-all-user-with-id`,{
                    users: partnerId,
                }).then((res)=>{
                    setPartner(res.data);
                    console.log(res.data);
                });
                axiosInstance.get(`${baseURL}/message/${room._id}`).then((msgRes)=>{
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
                const res = await axios.post(`${baseURL}/message`, message, {
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
            const message = {
                sender: user?._id,
                text: fileName,
                conversationId: id,
                isFile: true
            };
            console.log({base64: previewFileData});
            socket.current.emit("sendPhoto", {
                senderId: user._id,
                receiverId,
                data: previewFileData,
                fileName: fileName
            });
            try {
                const res = await axios.post(`${baseURL}/message`, message, {
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
    return (
        <section className="convo-container">
            <div className="convo-header">
                <div className="message-header">
                    <div className="go-back-convo" onClick={handleGoBack}>
                        <IoIosArrowRoundBack size={"42px"}/>
                    </div>
                    {roomNameGroup}
                    <div className="add-member" onClick={handleOpenAddUser}>
                        <BsThreeDotsVertical size={"20px"}/>
                    </div>
                </div>
                {setOpen && (
                    <div className="search-user-add">
                        {/*<span className="close-icon" onClick={handleOpenAddUser}>x</span>*/}
                        <p className="close close-icon" onClick={handleOpenAddUser}>x</p>
                        <Popup/>
                    </div>
                )}
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
                    <img src={previewSource} alt="chosen"/>
                </div>
            )}
            <div className="chat-box-bot">
                <InputField
                    
                    classStyle="chat-msg-input"
                    inputType="textarea"
                    placeholder="write something..."
                    setData={setNewMsg}
                    value={newMsg}
                    data={newMsg}
                />
                {!isMobile && ( <div className="upload-web">
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
                </div>)}
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
