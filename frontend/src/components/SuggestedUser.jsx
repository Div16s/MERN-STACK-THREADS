import React from 'react'
import { Avatar, Box, Button, Flex, Text, Image } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import useFollowUnfollow from '../hooks/useFollowUnfollow'

const SuggestedUser = ({user}) => {
    const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

	return (
		<Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
			{/* left side */}
			<Flex gap={2} as={Link} to={`${user.username}`}>
				<Avatar src={user.profilePic} />
				<Box>
					<Text fontSize={"sm"} display={"flex"} alignItems={"center"} fontWeight={"bold"}>
						{user.username} <Image src="/verified.png" w={4} h={4} ml={1}/>
					</Text>
					<Text color={"gray.light"} fontSize={"sm"}>
						{user.name}
					</Text>
				</Box>
			</Flex>
			{/* right side */}
			<Button
				size={"sm"}
				color={following ? "black" : "white"}
				bg={following ? "white" : "blue.400"}
				onClick={handleFollowUnfollow}
				isLoading={updating}
				_hover={{
					color: following ? "black" : "white",
					opacity: ".8",
				}}
			>
				{following ? "Unfollow" : "Follow"}
			</Button>
		</Flex>
	);
}

export default SuggestedUser