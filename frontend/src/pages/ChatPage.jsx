import { SearchIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { Input } from '@chakra-ui/react'
import Conversation from '../components/Conversation'
import { GiConversation } from 'react-icons/gi'
import MessageContainer from '../components/MessageContainer'
import useShowToast from '../hooks/useShowToast'
import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { conversationsAtom } from '../atoms/messagesAtom'
import { selectedConversationAtom } from '../atoms/messagesAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'

const ChatPage = () => {
    const showToast = useShowToast();
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [conversations, setConversations] = useRecoilState(conversationsAtom);
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const [searchText, setSearchText] = useState("");
    const [searchingUser, setSearchingUser] = useState(false);
    const currentUser = useRecoilValue(userAtom);
    const { socket, onlineUsers } = useSocket();

    useEffect(() => {
        socket?.on("messagesSeen", (conversationId) => {
            setConversations((prevConversations) => {
                const updatedConversations = prevConversations.map((conversation) => {
                    if (conversation._id === conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                ...conversation.lastMessage,
                                seen: true
                            }
                        }
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        })
    }, [socket, setConversations]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await fetch("/api/messages/conversations");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log(data);
                setConversations(data);
            } catch (error) {
                showToast("Error", error.message, "error")
            } finally {
                setLoadingConversations(false);
            }
        }

        getConversations();
    }, [showToast, setConversations]);

    const handleConversationSearch = async (e) => {
        e.preventDefault();
        if (!searchText) {
            return;
        }
        setSearchingUser(true);
        try {
            const res = await fetch(`/api/users/profile/${searchText}`);
            const searchedUser = await res.json();
            if (searchedUser.error) {
                showToast("Error", searchedUser.error, "error");
                return;
            }
            console.log(searchedUser);

            const messagingYourself = currentUser._id === searchedUser._id;
            if (messagingYourself) {
                showToast("Error", "You can't message yourself!", "error");
                return;
            }

            const conversationAllReadyExists = conversations.find(conversation => conversation.participants[0]._id === searchedUser._id);
            if (conversationAllReadyExists) {
                setSelectedConversation({
                    _id: conversationAllReadyExists._id,
                    userId: searchedUser._id,
                    username: searchedUser.username,
                    userProfilePic: searchedUser.profilePic
                })
                return;
            }

            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: "",
                    sender: ""
                },
                _id: Date.now(),
                participants: [
                    {
                        _id: searchedUser._id,
                        username: searchedUser.username,
                        profilePic: searchedUser.profilePic
                    }
                ]
            }

            setConversations((prevConversations) => [...prevConversations, mockConversation]);
        } catch (error) {
            showToast("Error", error.message, "error")
        } finally {
            setSearchingUser(false);
        }
    }
    return (
        <Box position={"absolute"} left={"50%"} w={{
            // on small screens and above
            base: "100%",
            // on medium screens and above
            md: "80%",
            // on large screens and above
            lg: "750px"
        }}
            p={4}
            transform={"translateX(-50%)"}>
            <Flex
                gap={4}
                flexDirection={{
                    // on small screens and above
                    base: "column",
                    // on medium screens and above
                    md: "row"
                }}
                maxW={{
                    // on small screens and above
                    sm: "400px",
                    // on medium screens and above
                    md: "100%",
                }}
                mx={"auto"}
            >
                <Flex flex={30}
                    flexDirection={"column"}
                    gap={2}
                    maxW={{
                        sm: "250px",
                        md: "full"
                    }}
                    mx={"auto"}
                >
                    <Text fontWeight={700} color={useColorModeValue("gay.600", "gray.400")}>
                        Your Conversations
                    </Text>
                    {/* Search form */}
                    <form onSubmit={handleConversationSearch}>
                        <Flex alignItems={"center"} gap={2}>
                            <Input placeholder="Search for a user" onChange={(e) => setSearchText(e.target.value)} />
                            <Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>

                    {/* Chat list & Loading Effect */}
                    {loadingConversations && (
                        [0, 1, 2, 3, 4].map((_, i) => (
                            <Flex key={i} gap={4}
                                alignItems={"center"}
                                p={1}
                                borderRadius={"md"}
                            >
                                <Box>
                                    <SkeletonCircle size={10} />
                                </Box>
                                <Flex w={"full"} flexDirection={"column"} gap={3}>
                                    <Skeleton h={"10px"} w={"80px"} />
                                    <Skeleton h={"8px"} w={"90%"} />
                                </Flex>
                            </Flex>
                        ))
                    )}
                    {!loadingConversations && (
                        conversations.map((conversation) => (
                            <Conversation key={conversation._id}
                                isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                                conversation={conversation} />
                        ))
                    )}
                </Flex>
                {!selectedConversation._id && (
                    <Flex flex={70}
                        borderRadius={"md"}
                        p={2}
                        flexDirection={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"400px"}
                    >
                        <GiConversation size={100} />
                        <Text>Select a conversation to start messaging!</Text>
                    </Flex>
                )}
                {selectedConversation._id && (
                    <MessageContainer />
                )}
                {/* <Flex flex={70}>Message Container</Flex> */}
            </Flex>
        </Box>
    )
}

export default ChatPage