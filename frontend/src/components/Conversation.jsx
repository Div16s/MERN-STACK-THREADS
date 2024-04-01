import { Avatar, AvatarBadge, Flex, Stack, Text, WrapItem, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react'
import React from 'react'
import { useRecoilValue } from 'recoil'
import userAtom  from '../atoms/userAtom'
import {selectedConversationAtom} from '../atoms/messagesAtom'
import { BsCheck2All, BsFillImageFill } from 'react-icons/bs'
import { useRecoilState } from 'recoil'
import { Box } from '@chakra-ui/react'

const Conversation = ({conversation, isOnline}) => {
    const currentUser = useRecoilValue(userAtom);
    const user = conversation.participants[0];
    const lastMessage = conversation.lastMessage;
    const [selectedConversation,setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const colorMode = useColorMode();
    console.log("Selected Conversation: ",selectedConversation);
  return (
    <Flex gap={4}
        alignItems={"center"}
        p={1}
        _hover={{
            cursor: "pointer",
            bg:useColorModeValue("gary.600","gray.dark"),
            color:"white"
        }}
        borderRadius={"md"}
        onClick={() => setSelectedConversation({
            _id: conversation._id,
            userId: user._id,
            username: user.username,
            userProfilePic: user.profilePic,
            mock: conversation.mock,
        })}
        bg={selectedConversation._id === conversation._id ? (colorMode === "light" ? "gray.600" : "gray.dark") : "" }
    >
        <WrapItem>
            <Avatar size={{
                    base: "xs",
                    sm: "sm",
                    md: "md"
                }} 
            src={user.profilePic}
            >
            {isOnline ? (<AvatarBadge boxSize={"1em"} bg={"green.500"}/>): ("")}   
            </Avatar>
        </WrapItem>
        
        <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight={"700"} display={"flex"} alignItems={"center"}>
                    {user.username} <Image src="/verified.png" w={4} h={4} ml={1}/>
                </Text>
                <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
                    {lastMessage.sender === currentUser._id ? (
                        <Box color={lastMessage.seen ? "blue.400":""}>
                            <BsCheck2All size={16}/>
                        </Box>
                    ) : ""}
                    {lastMessage.text.length > 17 ? lastMessage.text.substring(0,17) + "..." : lastMessage.text || 
                    <BsFillImageFill size={16}/> }
                </Text>
        </Stack>
    </Flex>
  )
}

export default Conversation