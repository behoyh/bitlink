import React, {useState} from 'react';
import './Dialog.css';
import IO from "../../controllers/IO";
import MyInfo from "../../stores/MyInfoStore";
import UIStore from "../../stores/UIStore";
import RoomStore from "../../stores/RoomStore";
import NotificationStore from "../../stores/NotificationStore";
import {prepareAudioBank} from "../Tiles/AutoPlayAudio";
import logo from "../../assets/logo/logo.svg";
import LegalText from "../LegalText";
import NotificationService from "../../services/NotificationService";
import {NotificationType} from "../../enum/NotificationType";

const JoinDialog: React.FunctionComponent = () => {
    const [roomId, setRoomId] = useState(UIStore.store.preFillJoinValue || "");
    const [userName, setUserName] = useState("");
    const [roomIdValidationEnabled, setRoomIdValidationEnabled] = useState(false);
    const [userNameValidationEnabled, setUserNameValidationEnabled] = useState(false);

    function userNameIsValid() {
        return userName.length > 0;
    }

    function roomIdIsValid() {
        return roomId.length > 0;
    }

    function hasValidInput(): boolean {
        return userNameIsValid() && roomIdIsValid();
    }

    function handleJoinRoom() {
        prepareAudioBank();
        NotificationService.requestPermission();
        UIStore.store.modalStore.join = false;
        MyInfo.chosenName = userName;

        try {
            IO.joinRoom(roomId, userName);
            setRoomId("");
            setUserName("");
            setRoomIdValidationEnabled(false);
            setUserNameValidationEnabled(false)
        } catch (e) {
            UIStore.store.modalStore.join = true;
            NotificationService.add(NotificationService.createUINotification(e, NotificationType.Error))
        }
    }

    function handleCancel() {
        UIStore.store.modalStore.join = false;
        if (!RoomStore.info) {
            UIStore.store.modalStore.joinOrCreate = true;
        }
    }

    function handlePaste(e: any) {
        const text = e.clipboardData.getData('text');
        const nums = text.match(/\/join\/(.+)$/);
        if (nums && nums[1]) {
            e.preventDefault();
            setRoomId(nums[1]);
        }
    }

    return (
        <div className={"dialog-modal"}>
            <img className={"dialog--logo"} src={logo}/>
            <h2 className={"modal--title"}>Join Room</h2>
            <input data-private={"lipsum"} onBlur={() => setRoomIdValidationEnabled(true)}
                   value={roomId}
                   className={"modal--input " + ((!roomIdValidationEnabled || roomIdIsValid()) ? "" : "invalid")}
                   onChange={(e) => { setRoomId(e.target.value); setRoomIdValidationEnabled(true)}}
                   onPaste={handlePaste}
                   type={"tel"}
                   placeholder={"Room ID or Paste Link"}/>
            <input data-private={"lipsum"} onBlur={() => {setUserNameValidationEnabled(true)}}
                   value={userName}
                   className={"modal--input " + ((!userNameValidationEnabled || userNameIsValid()) ? "" : "invalid")}
                   onChange={(e) => {setUserName(e.target.value); setUserNameValidationEnabled(true)}}
                   placeholder={"Your Name"}/>
            <div className={"modal--button-container"}>
                <input onClick={handleCancel} type={"button"} value={"Cancel"}
                       className={"modal--button cancel"}/>
                <input onClick={handleJoinRoom} type={"button"} value={"Join"}
                       disabled={!hasValidInput()} className={"modal--button confirm"}/>
            </div>
            <LegalText/>
        </div>
    );
}
export default JoinDialog;
