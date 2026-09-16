// Import React and the hooks we need
import React, { useState } from 'react';

// Import Material UI components
import { Box, TextField, Button } from '@mui/material';

const SignIn: React.FC = () => {

  // Store the email entered by the user
  const [email, setEmail] = useState('');

  // Store the password entered by the user
  const [password, setPassword] = useState('');

  // Store an error message if login fails
  const [error, setError] = useState('');

  // Handle the Sign In button
  const handleLogin = async () => {

    // Clear any previous error
    setError('');

    try {

      // Send the email and password to our Flask backend
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',

        // Tell Flask that we are sending JSON
        headers: {
          'Content-Type': 'application/json',
        },

        // Convert our email and password into JSON
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Convert Flask's response from JSON
      const data = await response.json();

      // Check whether the login failed
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save the access token in the browser's localStorage
      localStorage.setItem('accessToken', data.accessToken);

      // Show a success message for now
      alert('Login successful!');

      // Check that the token was saved
      console.log('Access token saved');

    } catch (error) {

      // Handle connection errors
      setError('Cannot connect to the server');
      console.error(error);
    }
  };

  return (
    <Box>

      {/* Sign In title */}
      <h1>Sign In</h1>

      {/* Email input */}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      {/* Password input */}
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {/* Show an error if login fails */}
      {error && (
        <p>{error}</p>
      )}

      {/* Sign In button */}
      <Button
        variant="contained"
        onClick={handleLogin}
      >
        Sign In
      </Button>

    </Box>
  );
};

export default SignIn;