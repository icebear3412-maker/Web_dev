import { Box, Container } from '@mui/material';
import { sectionSx } from '@/theme';

const Partners = [
  { name: '4DX', color: '#b4b9be' },
  { name: 'IMAX', color: '#009dd4' },
  { name: 'STARIUM', color: '#f28b28' },
  { name: 'GOLD CLASS', color: '#5c5146' },
  { name: 'SWEETBOX', color: '#df3f83' },
  { name: 'PREMIUM CINEMA', color: '#e51b23' },
  { name: 'SCREENX', color: '#454545' },
];

const createWordmark = (name: string, color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="42" viewBox="0 0 180 42"><text x="90" y="29" text-anchor="middle" font-family="Georgia,serif" font-size="${name.length > 8 ? 18 : 25}" font-weight="700" fill="${color}">${name}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const PartnerLine: React.FC = () => {
  return (
    <Box component="section" className="partners-section" sx={sectionSx}>
      <Container maxWidth="lg">
        <Box className="partners-row">
          {Partners.map((partner) => (
            <Box
              className="partner-logo"
              component="img"
              key={partner.name}
              src={createWordmark(partner.name, partner.color)}
              alt={partner.name}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default PartnerLine;
