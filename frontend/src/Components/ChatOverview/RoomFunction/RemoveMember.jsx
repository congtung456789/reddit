import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {baseURL} from "../../../utils/listContainer";
import {useSelector, useDispatch} from "react-redux";
import "./RemoveMember.css";
import {setRemoveMember} from "../../../redux/navigateSlice";
import ReactJsAlert from "reactjs-alert";

const RemoveMember = (props) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user?.currentUser);
    const popupRemoveUser = useSelector((state) => state.nav.removeMember.open);
    const [ dataUser, setDataUser ] = useState([]);
    const [status, setStatus] = useState(false);
    const [type, setType] = useState("");
    const [title, setTitle] = useState("");
    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get( `${baseURL}/conversation/get-user-conversation/${props.conversationId}`,
                { headers: { token: `Bearer ${user.accessToken}` }});
            setDataUser(result.data);
            console.log(result.data);
        };
        fetchData();
    }, []);
    const closePopUp = ()=>{
        dispatch(setRemoveMember(!popupRemoveUser));
    }
    const removeItemInArray = (index,e)=>{
        setDataUser(dataUser.filter((v, i) => v._id !== index));
    }
    const removeMember = async (users,e) => {
        if ( users._id !== user._id){
            const data = {
                conversationId:  props.conversationId,
                userRemoveId: users._id
            };
            await axios
                .post(`${baseURL}/conversation/remove-user-conversation`, data ,{
                    headers: { token: `Bearer ${user.accessToken}` },
                }).then((res) => {
                    if (res.status===200){
                        removeItemInArray(users._id,e);
                    }
                });
        }else {
            setTitle("You can't remove you from group");
            setStatus(true);
            setType("false");
        }
    };
    return (<>
            <div className="background"></div>
            <ReactJsAlert
                status={status} // true or false
                type={type} // success, warning, error, info
                title={title}
                Close={() => setStatus(false)}
            />
            <div className={"removeUser"}>
                <div className="allUser">
                    <ul className="responsive-table">
                        {dataUser?.map((user) => {
                            return (

                                <li className="table-header">
                                    <div className="col col-2">
                                        <img src= {`${user.profilePicture}`}  alt="" className={"profilePic"}/>
                                    </div>
                                    <div className="col col-1">{user.username}</div>
                                    <div className="col col-4">
                                        <button className={"removeButton"} onClick={ async (e) =>{ await removeMember(user,e)}} >Remove</button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <button className={"closeButton"} onClick={closePopUp}>Close</button>
            </div>
        </>
    )
};

export default RemoveMember;
