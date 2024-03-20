import { Link, useNavigate } from "react-router-dom"
import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react"
import ActionLogo from "./ActionLogo"
import { useEffect, useState } from "react"
import useShowToast from "../hooks/useShowToast"
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { DeleteIcon } from "@chakra-ui/icons"
import { useRecoilState, useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import postsAtom from "../atoms/postsAtom"

const Post = ({ post, postedBy }) => {
    const currentUser = useRecoilValue(userAtom);
    const [posts, setPosts] = useRecoilState(postsAtom); //the posts that are displayed on the page
    const [user, setUser] = useState(null); //the user that has posted the post
    const showToast = useShowToast();
    const navigate = useNavigate();

    //fetch the user that has posted the posts
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/profile/${postedBy}`);
                const data = await res.json();
                if (data.error) {
                    showToast('Error', data.error, 'error');
                    return;
                }
                setUser(data);
            } catch (error) {
                showToast('Error', error.message, 'error');
                setUser(null);
            }
        }

        getUser();

    }, [postedBy, showToast]);

    const handleDeletePost = async (e) => {
        e.preventDefault();
        try {
            if(!window.confirm('Are you sure you want to delete this post?')) return;
            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE",
            });
            const data = res.json();
            if(data.error){
                showToast('Error', data.error, 'error');
                return;
            }
            showToast('Success', 'Post deleted successfully', 'success');
            setPosts((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
        } catch (error) {
            showToast('Error', error.message, 'error');
        }
    }

    if (!user) return null;
    return (
        <Link to={`/${user.username}/post/${post._id}`}>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection={"column"} alignItems={"center"}>
                    <Avatar size={"md"} name={user.name} src={user.profilePic}
                        onClick={(e) => {
                            (
                                e.preventDefault(),
                                navigate(`/${user.username}`)
                            )
                        }}
                    />
                    <Box w={"1px"} h={"full"} bg={"gray.light"} my={2}></Box>
                    <Box position={"relative"} w={"full"}>
                        {post.replies.length === 0 && (
                            <Text textAlign={"center"}>🥱</Text>
                        )}
                        {post.replies[0] && (
                            <Avatar
                                size={"xs"}
                                name="Dan Abrahmov"
                                src={post.replies[0].userProfilePic}
                                position={"absolute"}
                                top={"0px"}
                                left={"-5px"}
                                padding={"2px"}

                            />
                        )}
                        {post.replies[2] && (
                            <Avatar
                                size={"xs"}
                                name="Ryan Florence"
                                src={post.replies[2].userProfilePic}
                                position={"absolute"}
                                bottom={"0px"}
                                left={"11px"}
                                padding={"2px"}

                            />
                        )}
                        {post.replies[1] && (
                            <Avatar
                                size={"xs"}
                                name="Kent Dodds"
                                src={post.replies[1].userProfilePic}
                                position={"absolute"}
                                top={"0px"}
                                right={"1px"}
                                padding={"2px"}

                            />
                        )}
                    </Box>
                </Flex>
                <Flex flex={1} flexDirection={"column"} gap={2}>
                    <Flex justifyContent={"space-between"} w={"full"}>
                        <Flex w={"full"} alignItems={"center"}>
                            <Text fontSize={"sm"} fontWeight={"bold"} onClick={(e) => {
                                (
                                    e.preventDefault(),
                                    navigate(`/${user.username}`)
                                )
                            }}>
                                {user.username}
                            </Text>
                            <Image src="/verified.png" w={4} h={4} ml={1} mt={1} />
                        </Flex>
                        <Flex gap={4} alignItems={"center"}>
                            <Text fontSize={"sm"} width={36} textAlign={"right"} color={"gray.light"}>
                                {formatDistanceToNow(new Date(post.createdAt))} ago
                            </Text>

                            {currentUser?._id === user._id && (
                                <DeleteIcon size={20} onClick={handleDeletePost}></DeleteIcon>
                            )}
                        </Flex>
                    </Flex>

                    <Text fontSize={"sm"}>{post.text}</Text>
                    {post.img &&
                        <Box
                            borderRadius={6}
                            overflow={"hidden"}
                            border={"1px solid"}
                            borderColor={"gray.light"}
                        >
                            <Image src={post.img} />
                        </Box>
                    }

                    <Flex gap={3} my={1}>
                        <ActionLogo post={post} />
                    </Flex>

                </Flex>
            </Flex>
        </Link>
    )
}

export default Post