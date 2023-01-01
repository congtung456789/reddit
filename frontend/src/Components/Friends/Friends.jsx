import { useState } from "react";
import { useSelector } from "react-redux";
import FeedLayout from "../Feed/Layout/FeedLayout";
import useFetchData from "../Hooks/useFetchData";
import Loading from "../Loading/Loading";
import Posts from "../Posts/Posts";
import FullPost from "../Posts/FullPost/FullPost";
import React, { Component }  from 'react';

const Friends = () => {
  const fullPost = useSelector((state) => state.nav.fullPost);
  const user = useSelector((state) => state.user.user?.currentUser);
  const { isLoading, apiData, serverError } = useFetchData(
    `${process.env.REACT_APP_BACKEND_URL}/post/timeline`,
    user?.accessToken,
    "post",
    user._id
  );

  const [deleteComment, setDeleteComment] = useState([]);
  const allComments = useSelector((state) => state.post.allPosts?.comments);
  const openedComment = allComments?.filter(
    (comment) => comment.postId === fullPost.postId
  );
  const filteredComment = openedComment.filter(
    (comment) => !deleteComment.includes(comment._id)
  );

  // const [friendsPosts, setFriendsPosts] = useState(
  //   allPosts?.filter((post) => user?.followings.includes(post.userId))
  // );
  // useEffect(() => {
  //   setFriendsPosts(
  //     allPosts?.filter((post) => user?.followings.includes(post.userId))
  //   );
  // }, []);

  return (
    <FeedLayout>
      <Loading
        loadingType="BeatLoader"
        color="white"
        size="10px"
        loading={isLoading}
      />
      {fullPost.open && <FullPost />}
      {apiData?.map((post) => {
        return (
          <Posts
            key={post._id}
            post={post}
            comments={filteredComment}
            setDeleteComment={setDeleteComment}
            deleteComment={deleteComment}
          />
        );
      })}
    </FeedLayout>
  );
};

export default Friends;
