import React, { useState, useEffect } from 'react'
import useShowToast from '../hooks/useShowToast';
import { Flex, Spinner, Box } from '@chakra-ui/react';
import Post from '../components/Post';
import SuggestedUsers from '../components/SuggestedUsers';

const HomePage = () => {
  const showToast = useShowToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        //get request to fetch the feed posts
        const res = await fetch('/api/posts/feed');

        const data = await res.json();
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        console.log(data);
        setPosts(data);

      } catch (error) {
        showToast('Error', error.message, 'error');
      } finally {
        setLoading(false);
      }
    }

    getFeedPosts();
  }, [showToast]);
  return (
    <Flex gap={10} alignItems={"start"}>
      <Box flex={70}>
        {loading && (
          <Flex justify={"center"}>
            <Spinner size={"xl"} />
          </Flex>
        )}
        {!loading && posts.length === 0 && (
          <h1>Follow some users to see the feed!</h1>
        )}

        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </Box>
      <Box flex={30}
        display={
          {
            base: "none",
            md: "block"
          }
        }
      >
          <SuggestedUsers />
      </Box>
    </Flex>
  )
}

export default HomePage