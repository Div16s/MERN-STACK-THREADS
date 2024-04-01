import { Flex, Image, Input, InputGroup, InputRightElement, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Spinner } from '@chakra-ui/react'
import { IoSendSharp } from 'react-icons/io5'
import { useState, useRef } from 'react'
import useShowToast from '../hooks/useShowToast'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { selectedConversationAtom, conversationsAtom } from '../atoms/messagesAtom'
import { BsFillImageFill } from 'react-icons/bs'
import usePreviewImg from '../hooks/usePreviewImg'



const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const imageRef = useRef(null);
  const {onClose} = useDisclosure();
  const {handleImageChange, imgUrl, setImgUrl} = usePreviewImg();
  const [isSending,setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) {
      return;
    }
    if(isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        useShowToast("Error", data.error, "error");
        return;
      }
      setMessages((messages) => [...messages, data]);
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            }
          }
          return conversation;
        })
        return updatedConversations;
      })
      setMessageText("");
      setImgUrl("");
    } catch (error) {
      useShowToast("Error", error.message, "error")
    } finally {
      setIsSending(false);
    }
  }
  return (
    <Flex gap={2} alignItems={"center"}>
      <form onSubmit={handleSendMessage} style={{flex: 95}}>
        <InputGroup>
          <Input
            w={"full"}
            placeholder='Type a message...'
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
          />
          <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
            <IoSendSharp />
          </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex={5} cursor={"pointer"}>
        <BsFillImageFill size={20} onClick={()=>imageRef.current.click()}/>
        <Input type={"file"} hidden ref={imageRef} onChange={handleImageChange}/>
      </Flex>

      <Modal isOpen={imgUrl} onClose={()=>{
        onClose();
        setImgUrl("");
      }}>
        <ModalOverlay>
        <ModalContent>  
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={"full"}>
              <Image src={imgUrl}/>
            </Flex>
            <Flex justifyContent={"flex-end"} my={2}>
              {!isSending ? (
                <IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage}/>
              ): (
                <Spinner size={"md"}/>
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
        </ModalOverlay>
      </Modal>
    </Flex>
  )
}

export default MessageInput