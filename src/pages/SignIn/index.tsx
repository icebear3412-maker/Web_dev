// Import the useState hook
import { useState } from 'react';

// Import Material UI components
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Typography,
} from '@mui/material';

const SignIn = () => {
  // Store the email entered by the user
  const [email, setEmail] = useState('');

  // Store the password entered by the user
  const [password, setPassword] = useState('');

  // Store the error message
  const [error, setError] = useState('');

  // Store the Remember Me checkbox state
  const [rememberMe, setRememberMe] = useState(false);

  // Send login information to the backend
  const handleLogin = async () => {
    setError('');

    // Check if email is empty
    if (!email) {
      setError('Please enter your email');
      return;
    }

    // Check if password is empty
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      // Send login request to Flask
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Read the backend response
      const data = await response.json();

      // Show backend error
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save access token
      localStorage.setItem('accessToken', data.accessToken);

      // Show successful login
      alert('Login successful!');
    } catch {
      // Show error when backend cannot be reached
      setError('Cannot connect to the server');
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
        padding: 3,
      }}
    >
      {/* Sign In card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'background.paper',
          padding: 4,
          borderRadius: 2,
        }}
      >
        {/* Page title */}
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          Sign In
        </Typography>

        {/* Email field */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          margin="normal"
        />

        {/* Password field */}
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          margin="normal"
        />

        {/* Remember Me and Forgot Password */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
            }
            label="Remember Me"
          />

          <Link
            component="button"
            type="button"
            underline="hover"
          >
            Forgot Password?
          </Link>
        </Box>

        {/* Error message */}
        {error && (
          <Typography
            sx={{
              marginTop: 2,
              color: 'error.main',
              textAlign: 'center',
            }}
          >
            {error}
          </Typography>
        )}

        {/* Login button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            marginTop: 2,
            padding: 1.5,
          }}
        >
          Sign In
        </Button>

        {/* Sign Up link */}
        <Box
          sx={{
            textAlign: 'center',
            marginTop: 3,
          }}
        >
          <Typography component="span">
            Don't have an account?{' '}
          </Typography>

          <Link href="/signup" underline="hover">
            Sign Up
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;
