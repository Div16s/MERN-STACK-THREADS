import { Avatar, Flex, Image, Skeleton, Text } from '@chakra-ui/react'
import { useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { selectedConversationAtom } from '../atoms/messagesAtom';
import userAtom from '../atoms/userAtom';
import { BsCheck2All } from 'react-icons/bs';
import { Box } from '@chakra-ui/react';
import { useState } from 'react';

const Message = ({ message, ownMessage }) => {
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const currentUser = useRecoilValue(userAtom);
    const [imgLoaded, setImgLoaded] = useState(false);
    return (
        <>
            {ownMessage ? (
                <Flex
                    gap={2}
                    alignSelf={"flex-end"}
                >
                    {message.text && (
                        <Flex bg={"green.800"} p={1} maxW={"350px"} borderRadius={"md"}>
                            <Text color={"white"}>
                                {message.text}
                            </Text>
                            <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
                                <BsCheck2All size={16} />
                            </Box>
                        </Flex>
                    )}
                    {message.img && !imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} hidden onLoad={()=>setImgLoaded(true)} alt='Message Img' borderRadius={4} />
                            <Skeleton w={"200px"} h={"200px"}/>
                        </Flex>
                    )}

                    {message.img && imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} alt='Message Img' borderRadius={4} />
                            <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
                                <BsCheck2All size={16} />
                            </Box>
                        </Flex>
                    )}
                    <Avatar w={7} h={7} src={currentUser.profilePic} />
                </Flex>
            ) : (
                <Flex
                    gap={2}
                >
                    <Avatar w={7} h={7} src={selectedConversation.userProfilePic} />
                    {message.text && (
                        <Text maxW={"350px"} bg={"gray.500"}
                            p={1} borderRadius={"md"}
                        >
                            {message.text}
                        </Text>
                    )}
                    {message.img && !imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} hidden onLoad={()=>setImgLoaded(true)} alt='Message Img' borderRadius={4} />
                            <Skeleton w={"200px"} h={"200px"}/>
                        </Flex>
                    )}

                    {message.img && imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} alt='Message Img' borderRadius={4} />
                        </Flex>
                    )}
                </Flex>
            )}
        </>
    )
}

export default Message