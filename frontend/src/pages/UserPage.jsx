import React, { useEffect, useState } from 'react'
import UserHeader from '../components/UserHeader'
import Post from '../components/Post'
import { useParams } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast';
import { Flex, Spinner } from '@chakra-ui/react';
import { get } from 'lodash';
import { useRecoilState } from 'recoil';
import  postsAtom  from '../atoms/postsAtom';

const UserPage = () => {
  const showToast = useShowToast();
  //fetching the user
  const [user, setUser] = useState(null);
  const {username} = useParams();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    const getUser = async() => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if(data.error){
          showToast('Error',data.error,'error');
          return;
        }
        setUser(data);
      } catch (error) {
        showToast('Error',error.message,'error');
      } finally {
        setLoading(false);
      }
    }

    const getUserPosts = async() => {
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        if(data.error){
          showToast('Error',data.error,'error');
          return;
        }
        setPosts(data);
      } catch (error) {
        showToast('Error',error.message,'error');
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    }

    getUser();
    getUserPosts();
  }, [username,showToast]);

  if(!user && loading){
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    )
  }
  if(!user && !loading){
    return (
      <h1>User not found</h1>
    )
  }
  return (
    <>
        <UserHeader user={user}/>
        {!fetchingPosts && posts.length === 0 && (
          <h1>User has no posts.</h1>
        )}
        {fetchingPosts && (
          <Flex justifyContent={"center"} my={12}>
            <Spinner size={"xl"} />
          </Flex>
        )}

        {posts.map(post => (
          <Post key={post._id} post={post} postedBy={post.postedBy}/>
        ))}
        
    </>
  )
}

export default UserPage