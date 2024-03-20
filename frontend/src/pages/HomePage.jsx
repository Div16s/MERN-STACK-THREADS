import React, { useState,useEffect } from 'react'
import useShowToast from '../hooks/useShowToast';
import { get, set } from 'lodash';
import { Flex, Spinner } from '@chakra-ui/react';
import Post from '../components/Post';

const HomePage = () => {
  const showToast = useShowToast();
  const [posts,setPosts] = useState([]);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        //get request to fetch the feed posts
        const res = await fetch('/api/posts/feed');

        const data = await res.json();
        if(data.error){
          showToast('Error',data.error,'error');
          return;
        }
        console.log(data);
        setPosts(data);

      } catch (error) {
        showToast('Error',error.message,'error');
      } finally {
        setLoading(false);
      }
    }

    getFeedPosts();
  }, [showToast]);
  return (
    <>
      {loading && (
        <Flex justify={"center"}>
          <Spinner size={"xl"}/>
        </Flex>
      )}
      {!loading && posts.length === 0 && (
        <h1>Follow some users to see the feed!</h1>
      )}

      {posts.map((post) => (
        <Post key={post._id} post={post} postedBy={post.postedBy} />
      ))}
    </>
  )
}

export default HomePage