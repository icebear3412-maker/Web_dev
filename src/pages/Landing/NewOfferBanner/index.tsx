import type { ICardWithLink } from '@/types';
import { Box } from '@mui/material';
import type React from 'react';

import gift from '@/assets/newOffer/gift.jpg';
import fanc from '@/assets/newOffer/fanc.jpg';
import rent from '@/assets/newOffer/rent.jpg';
import { useNavigate } from 'react-router-dom';

const NewOffers: ICardWithLink[] = [
  {
    image: gift,
    linkTo: '',
  },
  {
    image: fanc,
    linkTo: '',
  },
  {
    image: rent,
    linkTo: '',
  },
];

const NewOfferBanner: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box>
      {NewOffers.map((offer) => (
        <Box onClick={() => navigate(offer.linkTo)}>
          <img src={offer.image} />
        </Box>
      ))}
    </Box>
  );
};

export default NewOfferBanner;
