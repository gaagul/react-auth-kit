# @gaagul/react-auth-kit

A lightweight authentication toolkit for React applications, providing easy integration with various authentication providers.

## Installation

```bash
npm install @gaagul/react-auth-kit
# or
yarn add @gaagul/react-auth-kit
```

## Google Login Integration

This package provides a simple hook for implementing Google Sign-In in your React applications using Google Identity Services.

### Prerequisites

1. Set up a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the OAuth consent screen
3. Create OAuth 2.0 Client ID credentials
4. Add authorized JavaScript origins for your application

### Basic Usage

```jsx
import { useGoogleLogin } from '@gaagul/react-auth-kit';
import { useState } from 'react';

function LoginComponent() {
  const [user, setUser] = useState(null);
  
  const { signIn, isGoogleReady } = useGoogleLogin({
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    onSuccess: (response) => {
      console.log('Login successful:', response);
      // You can decode the JWT to get user info
      // or send it to your backend for verification
      setUser(response.credential);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  return (
    <div>
      {!user ? (
        <button 
          onClick={signIn}
          disabled={!isGoogleReady}
        >
          {isGoogleReady ? 'Sign in with Google' : 'Loading...'}
        </button>
      ) : (
        <div>Logged in successfully!</div>
      )}
    </div>
  );
}
```

### API Reference

#### `useGoogleLogin` Hook

```typescript
function useGoogleLogin({
  useFedcm?: boolean,
  onSuccess?: (response: GoogleCredentialResponse) => void,
  onError?: (error: Error) => void,
  clientId?: string,
}): { signIn: () => void, isGoogleReady: boolean }
```

##### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `useFedcm` | `boolean` | `true` | Whether to use Federated Credential Management API (recommended) |
| `onSuccess` | `function` | `() => {}` | Callback function that runs after successful login |
| `onError` | `function` | `() => {}` | Callback function that runs if login fails |
| `clientId` | `string` | `""` | Your Google OAuth 2.0 Client ID |

##### Return Values

| Value | Type | Description |
|-------|------|-------------|
| `signIn` | `function` | Function to trigger the Google Sign-In flow |
| `isGoogleReady` | `boolean` | Indicates if the Google library is loaded and ready |

### Handling Authentication Tokens

The successful login response includes a `credential` property which is a JWT (JSON Web Token). You can:

1. Send this token to your backend for verification
2. Decode it on the client side to get basic user information

Example of decoding the JWT on the client side:

```jsx
import { useGoogleLogin } from '@gaagul/react-auth-kit';
import { jwtDecode } from 'jwt-decode'; // You'll need to install this package

function LoginComponent() {
  const { signIn, isGoogleReady } = useGoogleLogin({
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    onSuccess: (response) => {
      const decodedToken = jwtDecode(response.credential);
      console.log('User info:', decodedToken);
      // decodedToken typically contains:
      // - sub: User ID
      // - email: User's email
      // - name: User's full name
      // - picture: URL to user's profile picture
    }
  });
  
  // Rest of your component
}
```

### Best Practices

1. **Environment Variables**: Store your client ID in environment variables
   ```jsx
   const { signIn } = useGoogleLogin({
     clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
   });
   ```

2. **Token Verification**: Always verify tokens on your backend before granting access to protected resources

3. **Error Handling**: Implement comprehensive error handling
   ```jsx
   const { signIn } = useGoogleLogin({
     onError: (error) => {
       // Show user-friendly error message
       setError('Sign-in failed. Please try again.');
       // Log detailed error for debugging
       console.error('Google sign-in error:', error);
     }
   });
   ```

## Browser Compatibility

The package uses Google Identity Services which supports most modern browsers. The FedCM feature (enabled by default) has more limited browser support, so you may want to disable it for wider compatibility:

```jsx
const { signIn } = useGoogleLogin({
  useFedcm: false,
  // other options
});
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
