import * as React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#fcfaed',
        display: 'flex',
        color: '#29241f',
      }}
    >
      {/* ==================== SIDEBAR ==================== */}
      <Box
        sx={{
          width: 240,
          minHeight: '100vh',
          flexShrink: 0,
          backgroundColor: '#fcfaed',
          borderRight: '1px solid #d9d0c1',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo / Admin title */}
        <Box
          sx={{
            paddingBottom: 3,
            marginBottom: 3,
            borderBottom: '2px solid #e51b23',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: 1.5,
              color: '#e51b23',
            }}
          >
            ADMIN
          </Typography>

          <Typography
            sx={{
              marginTop: 0.5,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              color: '#6e6559',
              textTransform: 'uppercase',
            }}
          >
            Cinema Management
          </Typography>
        </Box>

        {/* Dashboard */}
        <Button
          startIcon={<DashboardIcon />}
          sx={{
            justifyContent: 'flex-start',
            color: '#e51b23',
            fontWeight: 800,
            fontSize: 14,
            padding: '13px 12px',
            marginBottom: 1,
            backgroundColor: '#fff4dd',
            borderLeft: '4px solid #e51b23',
            borderRadius: 0,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#fff4dd',
            },
          }}
        >
          Dashboard
        </Button>

        {/* Movie List */}
        <Button
          startIcon={<MovieIcon />}
          onClick={() => navigate('/admin/movies')}
          sx={{
            justifyContent: 'flex-start',
            color: '#29241f',
            fontWeight: 700,
            fontSize: 14,
            padding: '13px 12px',
            marginBottom: 1,
            borderRadius: 0,
            textTransform: 'none',
            '&:hover': {
              color: '#e51b23',
              backgroundColor: '#fff4dd',
            },
          }}
        >
          Movie List
        </Button>

        {/* Transactions */}
        <Button
          startIcon={<ReceiptLongIcon />}
          onClick={() => navigate('/admin/transactions')}
          sx={{
            justifyContent: 'flex-start',
            color: '#29241f',
            fontWeight: 700,
            fontSize: 14,
            padding: '13px 12px',
            borderRadius: 0,
            textTransform: 'none',
            '&:hover': {
              color: '#e51b23',
              backgroundColor: '#fff4dd',
            },
          }}
        >
          Transactions
        </Button>
      </Box>

      {/* ==================== MAIN CONTENT ==================== */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          padding: {
            xs: 3,
            sm: 4,
            md: 6,
          },
        }}
      >
        {/* Page title */}
        <Typography
          sx={{
            fontFamily: "'Roboto Condensed', sans-serif",
            fontSize: {
              xs: 32,
              sm: 38,
              md: 46,
            },
            fontWeight: 900,
            letterSpacing: 1,
            color: '#29241f',
            lineHeight: 1.1,
            marginBottom: 1.5,
          }}
        >
          ADMIN DASHBOARD
        </Typography>

        {/* Red divider */}
        <Box
          sx={{
            width: 75,
            height: 5,
            backgroundColor: '#e51b23',
            marginBottom: 2,
          }}
        />

        <Typography
          sx={{
            color: '#6e6559',
            fontSize: 15,
            marginBottom: 5,
          }}
        >
          Manage your cinema system
        </Typography>

        {/* ==================== CARDS ==================== */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(280px, 430px))',
            },
            gap: 3,
          }}
        >
          {/* ==================== MOVIE LIST CARD ==================== */}
          <Card
            sx={{
              backgroundColor: '#fff',
              border: '1px solid #d9d0c1',
              borderRadius: 0,
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#e51b23',
                boxShadow: '0 4px 0 #e51b23',
              },
            }}
          >
            <CardContent
              sx={{
                padding: 3,
                '&:last-child': {
                  paddingBottom: 3,
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 62,
                  height: 62,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff4dd',
                  border: '2px solid #e51b23',
                  borderRadius: '8px',
                  marginBottom: 2.5,
                }}
              >
                <MovieIcon
                  sx={{
                    fontSize: 34,
                    color: '#e51b23',
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#29241f',
                  marginBottom: 1,
                }}
              >
                Movie List
              </Typography>

              <Typography
                sx={{
                  color: '#6e6559',
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 3,
                }}
              >
                Add, edit, hide and delete movies.
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate('/admin/movies')}
                sx={{
                  backgroundColor: '#e51b23',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 0.5,
                  borderRadius: '2px',
                  padding: '11px 18px',
                  boxShadow: '0 3px 0 #aa1111',
                  textTransform: 'uppercase',
                  '&:hover': {
                    backgroundColor: '#c9151b',
                    boxShadow: '0 3px 0 #8f0e0e',
                  },
                }}
              >
                Open Movie List
              </Button>
            </CardContent>
          </Card>

          {/* ==================== TRANSACTIONS CARD ==================== */}
          <Card
            sx={{
              backgroundColor: '#fff',
              border: '1px solid #d9d0c1',
              borderRadius: 0,
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#e51b23',
                boxShadow: '0 4px 0 #e51b23',
              },
            }}
          >
            <CardContent
              sx={{
                padding: 3,
                '&:last-child': {
                  paddingBottom: 3,
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 62,
                  height: 62,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff4dd',
                  border: '2px solid #e51b23',
                  borderRadius: '8px',
                  marginBottom: 2.5,
                }}
              >
                <ReceiptLongIcon
                  sx={{
                    fontSize: 34,
                    color: '#e51b23',
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#29241f',
                  marginBottom: 1,
                }}
              >
                Transactions
              </Typography>

              <Typography
                sx={{
                  color: '#6e6559',
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 3,
                }}
              >
                View and manage customer transactions.
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate('/admin/transactions')}
                sx={{
                  backgroundColor: '#e51b23',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 0.5,
                  borderRadius: '2px',
                  padding: '11px 18px',
                  boxShadow: '0 3px 0 #aa1111',
                  textTransform: 'uppercase',
                  '&:hover': {
                    backgroundColor: '#c9151b',
                    boxShadow: '0 3px 0 #8f0e0e',
                  },
                }}
              >
                Open Transactions
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage;