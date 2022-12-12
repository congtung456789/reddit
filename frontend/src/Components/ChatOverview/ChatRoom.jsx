import React, {useEffect, useRef, useState} from "react";
import {IoIosArrowRoundBack} from "react-icons/io";
import {BsFillFileArrowUpFill, BsThreeDotsVertical} from "react-icons/bs";
import {useDispatch,useSelector} from "react-redux";
import axios from "axios";
import {io} from "socket.io-client";
import "./chatroom.css";
import {useNavigate, useParams} from "react-router-dom";
import Message from "./Message";
import {baseURL} from "../../utils/listContainer";
import InputField from "../InputFields/Input";
import {BiImageAdd} from "react-icons/bi";
import "./uploadimageorfile.css";
import AddMember from "./AddMember";
import {setShowAction} from "../../redux/navigateSlice";
const ChatRoom = () => {
    const user = useSelector((state) => state.user.user?.currentUser);
    const room = useSelector((state) => state.nav.message.room);
    const setOpen =  useSelector((state) => state.nav.showAddMember.open);
    const [previewSource, setPreviewSource] = useState("");
    const [previewFileData, setPreviewFile] = useState(null);
    const [messages, setMessage] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [receivedMsg, setReceivedMsg] = useState("");
    const socket = useRef();
    const [partner, setPartner] = useState(null);
    const navigate = useNavigate();
    const scrollRef = useRef();
    const {id} = useParams();
    const dispatch = useDispatch();
    const axiosInstance = axios.create({
        headers: {
            token: `Bearer ${user?.accessToken}`,
        },
    });

    const handleGoBack = () => {
        navigate("/");
        socket.current.disconnect();
    };
    const handleOpenAddUser = () => {
        console.log("Gía trị của nó là " +!setOpen);
        dispatch(setShowAction(!setOpen)) ;
    };

    useEffect(() => {
        socket.current = io("http://localhost:8089", {
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
        // socket.current.on("getUsers", (users) => {
        //   setOnlineUsers(users);
        // });
    }, [user]);

    useEffect(() => {
        const getMessage = async () => {
            try {
                const partnerId = room?.members.find((m) => m !== user?._id);
                axios
                    .all([
                        axiosInstance.get(`${baseURL}/users/${partnerId}`),
                        axiosInstance.get(`${baseURL}/message/${room._id}`),
                    ])
                    .then(
                        axios.spread((partnerRes, msgRes) => {
                            setPartner(partnerRes.data);
                            setMessage(msgRes.data);
                        })
                    )
                    .catch((err) => {
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
            const receiverId = partner?._id;
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
            const receiverId = partner?._id;
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
                {setOpen ? (
                    <div className="search-user-add">
                        <p className="close" onClick={handleOpenAddUser}>X</p>
                        <AddMember/>
                    </div>
                ) : (
                    <div className="message-header">
                        <div className="go-back-convo" onClick={handleGoBack}>
                            <IoIosArrowRoundBack size={"42px"}/>
                        </div>
                        {partner?.username}{" "}
                        <div className="add-member" onClick={handleOpenAddUser}>
                            <BsThreeDotsVertical size={"20px"}/>
                        </div>
                    </div>
                )}
            </div>
            <div className="chat-box-top">
                {messages.map((msg) => {
                    return (
                        <div ref={scrollRef} className="msg-container">
                            <Message
                                message={msg}
                                own={msg.sender === user._id}
                                partner={partner}
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
                <button className="chat-submit" onClick={submitMessage}>
                    Send
                </button>
            </div>
            <footer className="upload">
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
            </footer>
        </section>
    );
};

export default ChatRoom;
