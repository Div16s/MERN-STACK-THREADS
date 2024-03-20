import { Button, FormControl, Textarea, Text, useColorModeValue, Input, Flex, Image, CloseButton } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/hooks'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/modal'
import {useState} from 'react'
import usePreviewImg from '../hooks/usePreviewImg';
import { BsFillImageFill } from 'react-icons/bs'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import useShowToast from '../hooks/useShowToast'
import postsAtom from '../atoms/postsAtom'
import { useParams } from 'react-router-dom'

const MAX_CHARS = 500;

const CreatePost = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [postText, setPostText] = useState('')
    const {handleImageChange, imgUrl, setImgUrl} = usePreviewImg();
    const imageRef = useState(null);
    const [remainingChars, setRemainingChars] = useState(MAX_CHARS);
    const user = useRecoilValue(userAtom);
    const showToast = useShowToast();
    const [loading,setLoading] = useState(false);
    const [posts,setPosts] = useRecoilState(postsAtom);
    const {username} = useParams();

    const handlePostChange = (e) => {
        e.preventDefault();
        const inputText = e.target.value;

        //logic for handling the remaining characters
        if(inputText.length > MAX_CHARS){
            const truncatedText = inputText.slice(0,MAX_CHARS);
            setPostText(truncatedText);
            setRemainingChars(0);
        }
        else{
            setPostText(inputText);
            setRemainingChars(MAX_CHARS - inputText.length);
        }
    }

    const handleCreatePost = async () => {
        if(loading) return;
        setLoading(true);
        try {
            const res = await fetch('/api/posts/create',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({postedBy:user._id, text: postText, img: imgUrl})
            })
    
            const data = await res.json();
            if(data.error){
                showToast('Error',data.error,'error');
                return;
            }
            console.log(data);
            showToast('Success',data.message,'success');
            if(username === user.username){
                setPosts([data.newPost, ...posts]);
            }
            onClose();
            setPostText('');
            setImgUrl('');
        } catch (error) {
            showToast('Error',error,'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button
                position={"fixed"}
                bottom={"10"}
                right={"5"}
                bg={useColorModeValue('gray.300', 'gray.dark')}
                onClick={onOpen}
                size={{base:"sm",sm:"md"}}
            >
                <AddIcon />
            </Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Post</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <Textarea
                                placeholder="What's on your mind?"
                                value={postText}
                                onChange={handlePostChange}
                            />
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                textAlign="right"
                                m={1}
                                color={'gray.800'}
                            >
                                {remainingChars}/{MAX_CHARS}
                            </Text>
                            <Input 
                                type='file' 
                                hidden
                                ref={imageRef}
                                onChange={handleImageChange}   
                            />

                            <BsFillImageFill 
                                style={{marginLeft: "5px",cursor: 'pointer'}}
                                size={16}
                                onClick={()=>imageRef.current.click()}
                            />

                        </FormControl>

                        {imgUrl && (
                            <Flex mt={5} w={"full"} position={"relative"}>
                                <Image src={imgUrl} alt='Selected img'/>
                                <CloseButton 
                                    onClick={()=>setImgUrl("")}
                                    bg={"gray.800"}
                                    position={"absolute"}
                                    top={2}
                                    right={2}
                                />
                            </Flex>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleCreatePost} isLoading={loading}>
                            Post
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default CreatePost