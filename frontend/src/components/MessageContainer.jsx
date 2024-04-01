import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, useColorModeValue } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import Message from './Message'
import MessageInput from './MessageInput'
import { useEffect, useState, useRef } from 'react'
import useShowToast from '../hooks/useShowToast'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { selectedConversationAtom, conversationsAtom } from '../atoms/messagesAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'
import notificationSound from "../assets/sounds/notification_sound.mp3"

const MessageContainer = () => {
    const showToast = useShowToast();
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messages, setMessages] = useState([]);
    const currentUser = useRecoilValue(userAtom);
    const { socket } = useSocket();
    const setConversations = useSetRecoilState(conversationsAtom);
    const messageEndRef = useRef(null);

    useEffect(() => {
        socket.on("newMessage", (message) => {
            if(selectedConversation._id === message.conversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }

            if(!document.hasFocus()){
                const sound = new Audio(notificationSound);
                sound.play();
            }
            setConversations((prevConversations) => {
                const updatedConversations = prevConversations.map((conversation) => {
                    if (conversation._id === message.conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender
                            }
                        }
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        })

        return () => {
            socket.off("newMessage");
        }
    }, [socket,selectedConversation,setConversations]);

    useEffect(() => {
        const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id;
        if(lastMessageIsFromOtherUser) {
            socket.emit("markMessagesAsSeen", {
                conversationId: selectedConversation._id,
                userId: selectedConversation.userId
            });
        }

        socket.on("messagesSeen", (conversationId) => {
            if(conversationId === selectedConversation._id) {
                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.map((message) => {
                        if(!message.seen){
                            return {
                                ...message,
                                seen: true
                            }
                        }
                        return message;
                    });
                    return updatedMessages;
                });
            }
        });
    },[socket,selectedConversation,messages,currentUser._id])
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessages(true);
            setMessages([]);
            try {
                if (selectedConversation.mock) return;
                const res = await fetch(`/api/messages/${selectedConversation.userId}`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setMessages(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingMessages(false);
            }
        }
        getMessages();
    }, [showToast, selectedConversation.userId, selectedConversation.mock]);

    return (
        <Flex flex={"70"}
            bg={useColorModeValue("gray.200", "gray.dark")}
            borderRadius={"md"}
            flexDirection={"column"}
            p={2}
        >
            {/* Message header */}
            <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
                <Avatar src={selectedConversation.userProfilePic} size={"sm"} />
                <Text display={"flex"} alignItems={"center"}>
                    {selectedConversation.username} <Image src="/verified.png" w={4} h={4} ml={1} />
                </Text>
            </Flex>

            <Divider />

            {/* Messages */}
            <Flex flexDirection={"column"} gap={4} my={4}
                h={"400px"} overflowY={"auto"} p={2}
            >
                {loadingMessages && (
                    [...Array(5)].map((_, i) => (
                        <Flex key={i}
                            gap={2}
                            alignItems={"center"}
                            p={1}
                            borderRadius={"md"}
                            alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                        >
                            {i % 2 === 0 && (
                                <SkeletonCircle size={7} />
                            )}
                            <Flex flexDirection={"column"} gap={2}>
                                <Skeleton h={"8px"} w={"250px"} />
                                <Skeleton h={"8px"} w={"250px"} />
                                <Skeleton h={"8px"} w={"250px"} />
                            </Flex>

                            {i % 2 !== 0 && (<SkeletonCircle size={7} />)}
                        </Flex>
                    )
                    ))}

                {!loadingMessages && (
                    messages.map((message) => (
                        <Flex key={message._id} direction={"column"}
                            ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}
                        >
                            <Message key={message._id} message={message} ownMessage={currentUser._id === message.sender} />
                        </Flex>
                    ))
                )}
            </Flex>

            <MessageInput setMessages={setMessages} />
        </Flex>
    )
}

export default MessageContainer