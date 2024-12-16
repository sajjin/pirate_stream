import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const Auth = ({ children }) => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Welcome, {user.username}</h1>
            <button
              onClick={signOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
          {children}
        </div>
      )}
    </Authenticator>
  );
};

export default Auth;
