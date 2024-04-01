import { Box, Flex, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react'
import {useState} from 'react'
import SuggestedUser from './SuggestedUser'
import useShowToast from '../hooks/useShowToast'
import { useEffect } from 'react'

const SuggestedUsers = () => {
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();
    useEffect(() => {
		const getSuggestedUsers = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/users/suggested");
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setSuggestedUsers(data);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};

		getSuggestedUsers();
	}, [showToast]);

  return (
    <>
        <Text mb={4} fontWeight={"bold"}>
            Suggested Users
        </Text>
        <Flex direction={"column"} gap={4}>
            {!loading && suggestedUsers.map((user) => (
                <SuggestedUser key={user._id} user={user}/>
            ))}
            {loading && [...Array(5)].map((_, index) => (
                <Flex key={index} gap={2} alignItems={"center"} borderRadius={"md"} p={1}>
                    <Box>
                        <SkeletonCircle size={10}/>
                    </Box>
                    {/* User Info Skeleton*/}
                    <Flex w={"full"} flexDirection={"column"} gap={2}>
                        <Skeleton h={"8px"} w={"80px"}/>
                        <Skeleton h={"8px"} w={"90%"}/> 
                    </Flex>

                    {/* Follow Button Skeleton */}
                    <Flex>
                        <Skeleton h={"20px"} w={"60px"}/>
                    </Flex>
                </Flex>
            ))}
        </Flex>
    </>
  )
}

export default SuggestedUsers