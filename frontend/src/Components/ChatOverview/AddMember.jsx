import {useEffect, useRef, useState} from "react";
import axios from "axios";
import {baseURL} from "../../utils/listContainer";
import {useSelector,useDispatch} from "react-redux";
import InputField from "../InputFields/Input";
import "./AddMember.css";
import {io} from "socket.io-client";
import {setShowAction} from "../../redux/navigateSlice";
const AddMember = () => {
    const socket = useRef();
    const user = useSelector((state) => state.user.user?.currentUser);
    const room = useSelector((state) => state.nav.message.room);
    const setOpen =  useSelector((state) => state.nav.showAddMember.open);
    const [search, setSearch] = useState("");
    const [result, setResulsts] = useState([]);
    const [openSearch, setOpenSearch] = useState(false);
    const dispatch = useDispatch();
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
                dispatch(setShowAction(!setOpen));
            }
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
        socket.current = io("http://localhost:8089", {
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
    return (
        <header className="feed-logo">
            <div className="search-container">
                <InputField
                    classStyle="search-user"
                    placeholder="🔎 Search for user to add"
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
        </header>
    );
};

export default AddMember;
