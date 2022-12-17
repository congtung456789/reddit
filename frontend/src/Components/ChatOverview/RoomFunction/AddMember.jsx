import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {baseURL} from "../../utils/listContainer";
import {useSelector,useDispatch} from "react-redux";
import InputField from "../InputFields/Input";
import "./AddMember.css";
import {io} from "socket.io-client";
import ReactJsAlert from "reactjs-alert";
import {setShowAction} from "../../redux/navigateSlice";
const AddMember = () => {
    const socket = useRef();
    const titleState =  useSelector((state) => state.nav.title.name);
    const user = useSelector((state) => state.user.user?.currentUser);
    const room = useSelector((state) => state.nav.message.room);
    const setOpen =  useSelector((state) => state.nav.showAddMember.open);
    const [search, setSearch] = useState("");
    const [result, setResulsts] = useState([]);
    const [status, setStatus] = useState(false);
    const [type, setType] = useState("");
    const [title, setTitle] = useState("");
    const [openSearch, setOpenSearch] = useState(false);
    const dispatch = useDispatch();
    const placeHolder = "🔎 Search for " + titleState;
    const addUserToConversation = async (id, conversationId) => {
        const newUser = {
            conversationId: conversationId,
            userAddId: id,
        }
        await axios.post(`${baseURL}/conversation/add-user-conversation`, newUser, {
            headers: {token: `Bearer ${user.accessToken}`},
        }).then((res) => {
            if (res.status === 200) {
                socket.current.emit("addUser", id);
                //dispatch(setShowAction(!setOpen));
                setType("success");
            }else{
                setType("false");
            }
            setTitle(res.data);
            setStatus(true);
        });
    };
    const searchUsername = async () => {
        await axios
            .get(`${baseURL}/users?username=${search}`, {
                headers: { token: `Bearer ${user.accessToken}` },
            })
            .then((res) => {
                if (search === "") {
                    setResulsts([]);
                } else {
                    setResulsts(res.data);
                }
            });
    };
    useEffect(()=>{
        socket.current = io("http://192.168.0.103:8089", {
            transports: ["websocket"],
        });
    });
    useEffect(() => {
        if (search === "") {
            setOpenSearch(false);
        } else {
            setOpenSearch(true);
            searchUsername();
        }
    }, [search]);
    const closePopUp = () => {
        dispatch(setShowAction(!setOpen));
    }
    return (
        <header className="feed-logo">
            <div className="search-container">
                <ReactJsAlert
                    status={status} // true or false
                    type={type} // success, warning, error, info
                    title={title}
                    Close={() => setStatus(false)}
                    />
                <InputField
                    classStyle="search-user"
                    placeholder= {placeHolder}
                    data={search}
                    setData={setSearch}
                />
                {openSearch && (
                    <div className="feed-username-display">
                        {result?.map((username) => {
                            return (
                                <div
                                    className="user-container"
                                    onClick={() => addUserToConversation(username._id,room._id)}
                                >
                                    <img
                                        style={{ backgroundColor: `${username.theme}` }}
                                        src={username.profilePicture}
                                        alt="profile pic"
                                        className="username-profile"
                                    />
                                    <div className="username"> u/{username.username}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div>
                <button className={"buttonClose"} onClick={closePopUp}>Close</button>
            </div>
        </header>
    );
};

export default AddMember;
