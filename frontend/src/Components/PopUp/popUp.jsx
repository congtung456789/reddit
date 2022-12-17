import React from "react";
import "./popUp.css"
const Popup = (props) => {
    const openPopup = ()=>{

    };
    const removeUser = ()=>{

    };
   const changeGroupName = ()=>{

    };
    return (
        <div className="popup-box">
            <div className="box">
                <p onClick={openPopup}>Add user </p>
                <p onClick={removeUser}>Remove user</p>
                <p onClick={changeGroupName}>Rename</p>
            </div>
        </div>
    );
};

export default Popup;
