import { Avatar, Box, Menu, Flex, MenuButton, MenuItem, MenuList, Portal, Text, VStack, useToast, Button } from '@chakra-ui/react'
import { BsInstagram } from "react-icons/bs"
import { CgMoreO } from "react-icons/cg"
import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { Link } from 'react-router-dom'
import userAtom from '../atoms/userAtom'
import useShowToast from '../hooks/useShowToast'


const UserHeader = ({ user }) => {
    const toast = useToast();
    const currentUser = useRecoilValue(userAtom); //this is the user that logged in
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
    const showToast = useShowToast();
    const [updating,setUpdating] = useState(false);
    console.log(following);

    const copyURL = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            // console.log("URL copied to clipboard!");
            toast({
                status: "success",
                description: "Profile link copied!",
                duration: 3000,
                isClosable: true,
            });
        })
    }

    const handleFollowUnfollow = async () => {
        if(!currentUser){
            showToast('Error','You need to be logged in to follow someone!','error');
            return;
        }

        if(updating) return;
        setUpdating(true);
        
        try {
            const res = await fetch(`/api/users/follow/${user._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            })

            const data = await res.json();
            if(data.error){
                showToast('Error',data.error,'error');
                return;
            }
            if(following){
                showToast('Success',`Unfollowed ${user.name}`,'success');
                user.followers.pop();
            }
            else{
                showToast('Success',`Followed ${user.name}`,'success');
                user.followers.push(currentUser?._id);
            }
            setFollowing(!following);
            console.log(data);
        } catch (error) {
            showToast('Error',error,'error');
        } finally {
            setUpdating(false);
        }
    }

    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} w={"full"}>

                <Box>
                    <Text fontWeight={"bold"} fontSize={"2xl"}>{user.name}</Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontWeight={"bold"} fontSize={"sm"}>{user.username}</Text>
                        <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
                            threads.net
                        </Text>
                    </Flex>
                </Box>

                <Box>
                    {user.profilePic && <Avatar name={user.username} src={user.profilePic} size={"xl"} />}
                    {!user.profilePic && <Avatar name={user.username} src='https://bit.ly/broken-link' size={"xl"} />}
                </Box>

            </Flex>
            <Text>{user.bio}</Text>

            {currentUser?._id === user._id && (
                <Link to={"/update"}>
                    <Button size={"sm"}>Update Profile</Button>
                </Link>
            )}
            {currentUser?._id !== user._id && (
                <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
                    {following ? "Unfollow" : "Follow"}
                </Button>
            )}

            <Flex justifyContent={"space-between"} w={"full"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text color={"gray.light"}>{user.followers.length} followers</Text>
                </Flex>
                <Flex>
                    <Box className='icon-container'>
                        <BsInstagram size={24} cursor={"pointer"} />
                    </Box>
                    <Box className='icon-container'>
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </MenuButton>
                            <Portal>
                                <MenuList>
                                    <MenuItem onClick={copyURL}>Copy Link</MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>

                    </Box>
                </Flex>
            </Flex>

            <Flex w={"full"} >
                <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb={"3"} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Threads</Text>
                </Flex>
                <Flex flex={1} borderBottom={"1px solid grey"} justifyContent={"center"} color={"gray.light"} pb={"3"} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Replies</Text>
                </Flex>
            </Flex>
        </VStack>
    )
}

export default UserHeader