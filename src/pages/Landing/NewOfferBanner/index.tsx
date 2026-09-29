import type { ICardWithLink } from '@/types';
import { Box } from '@mui/material';
import type React from 'react';

import gift from '@/assets/newOffer/gift.jpg';
import fanc from '@/assets/newOffer/fanc.jpg';
import rent from '@/assets/newOffer/rent.jpg';
import { useNavigate } from 'react-router-dom';
import { clickableSx } from '@/theme';

const NewOffers: ICardWithLink[] = [
  { image: gift, linkTo: '' },
  { image: fanc, linkTo: '' },
  { image: rent, linkTo: '' },
];

const NewOfferBanner: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        py: { xs: 2, md: 3 },
      }}
    >
      {NewOffers.map((offer) => (
        <Box
          key={offer.image}
          onClick={() => offer.linkTo && navigate(offer.linkTo)}
          sx={clickableSx}
        >
          <Box
            component="img"
            src={offer.image}
            alt=""
            sx={{ display: 'block', width: '100%', borderRadius: 2 }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default NewOfferBanner;
