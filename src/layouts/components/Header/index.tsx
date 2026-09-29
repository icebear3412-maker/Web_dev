import React from 'react';
import { Box, Container, Link } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { MAX_WIDTH } from '@/constants';

import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import PersonIcon from '@mui/icons-material/Person';

import type { IButtonWithIconAndDisplayText } from '@/types';

const TopNavButton: IButtonWithIconAndDisplayText[] = [
  { display: 'tin mới & ưu đãi', link: '/new_and_sale', icon: ConfirmationNumberIcon },
  { display: 'kiểm tra vé', link: '/check_ticket', icon: LoyaltyIcon },
  { display: 'đăng nhập / đăng ký', link: '/sign_in', icon: PersonIcon },
];

const HeaderComponent: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container
      sx={{
        display: 'flex',
        maxWidth: `${MAX_WIDTH}px`,
      }}
    >
      <Box sx={{ ml: 'auto', py: 1, display: 'flex', alignItems: 'center' }}>
        {TopNavButton.map((button) => (
          <Link
            onClick={() => navigate(button.link)}
            sx={{
              textDecoration: 'none',
              color: 'black',
              cursor: 'pointer',
              textTransform: 'uppercase',
              px: 2,
              display: 'flex',
              alignItems: 'center',
              columnGap: 1,
            }}
          >
            <button.icon />
            {button.display}
          </Link>
        ))}
      </Box>
    </Container>
  );
};

export default HeaderComponent;
