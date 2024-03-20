import { Link } from "react-router-dom"
import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react"
import { BsThreeDots } from "react-icons/bs"
import ActionLogo from "./ActionLogo"
import { useState } from "react"

const UserPost = ({postImg, postTitle, likes, replies}) => {
    const [liked,setLiked] = useState(false);
  return (
    <Link to={"/markzuckerberg/post/1"}>
        <Flex gap={3} mb={4} py={5}>
            <Flex flexDirection={"column"} alignItems={"center"}>
                <Avatar size={"md"} name="Mark Zuckerberg" src="/zuck-avatar.png" />
                <Box w={"1px"} h={"full"} bg={"gray.light"} my={2}></Box>
                <Box position={"relative"} w={"full"}>
                    <Avatar
                     size={"xs"}
                     name="Dan Abrahmov"
                     src="https://bit.ly/dan-abramov"
                     position={"absolute"}
                     top={"0px"}
                     left={"-5px"}
                     padding={"2px"}

                     />
                    <Avatar
                     size={"xs"}
                     name="Ryan Florence"
                     src="https://bit.ly/ryan-florence"
                     position={"absolute"}
                     bottom={"0px"}
                     left={"11px"}
                     padding={"2px"}

                     />
                    <Avatar
                     size={"xs"}
                     name="Kent Dodds"
                     src="https://bit.ly/kent-c-dodds"
                     position={"absolute"}
                     top={"0px"}
                     right={"1px"}
                     padding={"2px"}

                     />
                </Box>
            </Flex>
            <Flex flex={1} flexDirection={"column"} gap={2}>
                <Flex justifyContent={"space-between"} w={"full"}>
                    <Flex w={"full"} alignItems={"center"}>
                        <Text fontSize={"sm"} fontWeight={"bold"}>
                            markzuckerberg
                        </Text>
                        <Image src="/verified.png" w={4} h={4} ml={1} mt={1} />
                    </Flex>
                    <Flex gap={4} alignItems={"center"}>
                        <Text fontStyle={"sm"} color={"gray.light"}>
                            1d
                        </Text>
                        <BsThreeDots />
                    </Flex>
                </Flex>

                <Text fontSize={"sm"}>{postTitle}</Text>
                {postImg && 
                    <Box
                        borderRadius={6}
                        overflow={"hidden"}
                        border={"1px solid"}
                        borderColor={"gray.light"}
                    >
                        <Image src={postImg} />
                    </Box>
                }

                <Flex gap={3}  my={1}>
                    <ActionLogo liked={liked} setLiked={setLiked}/>
                </Flex>

                <Flex gap={2} alignItems={"center"}>
                    <Text color={"gray.light"} fontSize={"sm"}>{replies} replies</Text>
                    <Box w={1} h={1} borderRadius={"full"} bg={"gray.light"}></Box>
                    <Text color={"gray.light"} fontSize={"sm"}>{likes} likes</Text>
                </Flex>
            </Flex>
        </Flex>
    </Link>
  )
}

export default UserPost