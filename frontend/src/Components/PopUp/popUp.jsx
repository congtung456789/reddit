import React from "react";
import "./popUp.css"
import {useDispatch, useSelector} from "react-redux";
import {setShowAction, setPopup, setTitle, setPopupRename, setRemoveMember} from "../../redux/navigateSlice";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Popup = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const setOpen = useSelector((state) => state.nav.showAddMember.open);
    const popupChangeName = useSelector((state) => state.nav.roomName.open);
    const popupRemoveUser = useSelector((state) => state.nav.removeMember.open);
    const user = useSelector((state) => state.user.user?.currentUser);
    const removeAllPopUp = ()=>{
        dispatch(setShowAction(false));
        dispatch(setRemoveMember(false));
        dispatch(setPopupRename(false));
        dispatch(setPopup(false));

    }
    const addUser = () => {
        removeAllPopUp();
        dispatch(setTitle("Add user to conversation"));
        if (setOpen !== true) {
            dispatch(setShowAction(!setOpen));
        }

    };
    const removeUser = () => {
        removeAllPopUp();
        dispatch(setTitle("Remove user to conversation"));
        if (popupRemoveUser !== true) {
            dispatch(setRemoveMember(!popupRemoveUser));
        }
    }
    const changeGroupName = () => {
        removeAllPopUp();
        dispatch(setTitle("Change name conversation"));
        dispatch(setPopupRename(!popupChangeName));
    };
    const leaveTheConversation = async () => {
        removeAllPopUp();
        const data = {
            conversationId:  props.conversationId,
            userRemoveId: user._id
        };
        await axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/conversation/remove-user-conversation`, data ,{
                headers: { token: `Bearer ${user.accessToken}` },
            }).then((res) => {
                if (res.status===200){
                    navigate("/");
                    props.socket.current.disconnect();
                }
            });
    };
    return (
        <div className="popup-box">
            <div className="box">
                <button onClick={addUser} className="popupButton">Add user</button>
                <button onClick={removeUser} className="popupButton">Remove user</button>
                <button onClick={changeGroupName} className="popupButton">Rename</button>
                <button onClick={leaveTheConversation} className="popupButton">Leave the conversation</button>
            </div>
        </div>
    );
};

export default Popup;
