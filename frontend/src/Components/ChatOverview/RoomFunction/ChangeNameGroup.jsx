import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {useSelector,useDispatch} from "react-redux";
import InputField from "../../InputFields/Input";
import "./ChangeNameGroup.css";
import ReactJsAlert from "reactjs-alert";
import {setPopupRename,setFullName} from "../../../redux/navigateSlice";

const AddMember = (props) => {
    const titleState =  useSelector((state) => state.nav.title.name);
    const user = useSelector((state) => state.user.user?.currentUser);
    const setOpen =  useSelector((state) => state.nav.roomName.open);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(false);
    const [type, setType] = useState("");
    const [title, setTitle] = useState("");
    const dispatch = useDispatch();
    const changeNameConversation = async () => {
        const data = {
            conversationId:  props.conversationId,
            conversationName: search
        };
        await axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/conversation/update-group-name`, data ,{
                headers: { token: `Bearer ${user.accessToken}` },
            }).then((res) => {
                if (res.status === 200) {
                    setType("success");
                    setTitle("Change name group success");
                    dispatch(setFullName(search));
                }else{
                    setType("false");
                    setTitle("Change name group fail! please try again later");
                }
                setStatus(true);
            });
    };

    const closePopUp = () => {
        dispatch(setPopupRename(!setOpen));
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
                    placeholder= {titleState}
                    data={search}
                    setData={setSearch}
                />
            </div>
            <div>
                <button className={"buttonChange"} onClick={changeNameConversation}>Change</button>
            </div>
            <div>
                <button className={"buttonClose"} onClick={closePopUp}>Close</button>
            </div>
        </header>
    );
};

export default AddMember;
