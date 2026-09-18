import { Box, Container, Paper, Typography } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GroupsIcon from '@mui/icons-material/Groups';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import type { SvgIconComponent } from '@mui/icons-material';

const links: [string, SvgIconComponent][] = [
  ['RẠP CINEMA', MovieIcon],
  ['PHIM ĐANG CHIẾU', LocalMoviesIcon],
  ['CINEMA SPECIAL', LocalOfferIcon],
  ['THUÊ PHÒNG & GROUP SALE', GroupsIcon],
  ['LIÊN HỆ CINEMA', PhoneIcon],
  ['TIN MỚI & ƯU ĐÃI', ConfirmationNumberIcon],
  ['ĐĂNG KÝ NGAY', PersonAddIcon],
];

function QuickLinks() {
  return (
    <Box className="quick-links">
      <Container maxWidth="lg" className="quick-links-inner">
        {links.map(([label, Icon]) => (
          <Paper key={label} elevation={0} className="quick-link-card">
            <Icon className="quick-link-icon" />
            <Typography>{label}</Typography>
          </Paper>
        ))}
      </Container>
    </Box>
  );
}

export default QuickLinks;