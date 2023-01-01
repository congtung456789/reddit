import { useState, useEffect } from "react";
import axios from "axios";
import "./chatroom.css";

const Conversation = (props) => {
  const { conversation, currentUser,conversationName } = props;
  const [user, setUser] = useState(null);
  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser?._id);
    const getOtherUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/${friendId}`, {
          headers: { token: `Bearer ${currentUser.accessToken}` },
        });
        setUser(res.data);
      } catch (e) {
        console.log(e);
      }
    };
    getOtherUser();
  }, []);
  return (
    <section className="contact-container">
      <div className="contact-img-container">
        <img
          src={user?.profilePicture}
          alt="profile pic"
          className="contact-img"
          style={{ backgroundColor: `${user?.theme}` }}
        />
      </div>
      <div className="preview-container">
        <div className="preview-username">{conversationName}</div>
      </div>
    </section>
  );
};

export default Conversation;
