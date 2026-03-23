import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_HJW4ewAIp',
      userPoolClientId: '20bfk1aqs94gou4lm1lrn1l8a4',
      signUpVerificationMethod: 'code'
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://xcjv5ccrrrfl7ai7txqgxisiry.appsync-api.us-west-2.amazonaws.com/graphql',
      region: 'us-west-2',
      defaultAuthMode: 'userPool'
    }
  }
});