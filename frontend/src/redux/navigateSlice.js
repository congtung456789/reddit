import { createSlice } from "@reduxjs/toolkit";

export const navigateSlice = createSlice({
  name: "nav",
  initialState: {
    sidebar: {
      open: false,
    },
    makepost: {
      open: false,
    },
    deleteState: {
      status: false,
      open: false,
      id: 0,
    },
    fullPost: {
      open: false,
      postId: null,
    },
    message: {
      open: false,
      room: null,
    },
    showAddMember:{
      open:false,
    },
    removeMember:{
      open:false,
    },
    title:{
      name:"",
      type:"",
    },
    roomName:{
      name:"",
      open:false,
    },
    popup:{
      open:false,
    }
  },
  reducers: {
    sideBarToggle: (state, action) => {
      state.sidebar.open = action.payload;
    },
    makePostToggle: (state, action) => {
      state.makepost.open = action.payload;
    },
    setDelete: (state, action) => {
      state.deleteState = action.payload;
    },
    fullPostToggle: (state, action) => {
      state.fullPost = action.payload;
    },
    messageToggle: (state, action) => {
      state.message.open = action.payload;
    },
    setRoom: (state,action) => {
      state.message.room = action.payload;
    },
    setShowAction:(state, action)=>{
      state.showAddMember.open = action.payload;
    },
    setTitle:(state, action)=>{
      state.title.name = action.payload;
    },
    setFullName:(state,action)=>{
      state.roomName.name = action.payload
    },
    setPopup:(state,action)=>{
      state.popup.open = action.payload
    },
    setPopupRename:(state,action)=>{
      state.roomName.open = action.payload
    },
    setRemoveMember:(state,action)=>{
      state.removeMember.open = action.payload
    }
  },
});

export const {
  sideBarToggle,
  makePostToggle,
  setDelete,
  fullPostToggle,
  messageToggle,
  setRoom,
  setShowAction,
  setFullName,
  setPopup,
  setTitle,
  setPopupRename,
  setRemoveMember
} = navigateSlice.actions;
export default navigateSlice.reducer;
