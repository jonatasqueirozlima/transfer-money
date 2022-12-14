import { Box, HStack, Stack } from '@chakra-ui/react';

import AccountSession from '../account-session/AccountSession';
import Balance from '../balance/Balance';

export default function Header() {
  return (
    <Box
      as="header"
      bg="gray.200"
      position="fixed"
      w="full"
      zIndex={2}
      borderBottom="1px solid #1A202C"
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        p="4"
        w="fit-content"
        mx="auto"
        justifyContent="center"
        gap={{ base: '1.3em', lg: '"4em"' }}
      >
        <Balance />
        <AccountSession />
      </Stack>
    </Box>
  );
}
