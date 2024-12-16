import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID',
      userPoolClientId: 'YOUR_USER_POOL_CLIENT_ID',
      signUpVerificationMethod: 'code'
    }
  },
  API: {
    GraphQL: {
      endpoint: 'YOUR_APPSYNC_ENDPOINT',
      region: 'YOUR_REGION',
      defaultAuthMode: 'userPool'
    }
  }
});