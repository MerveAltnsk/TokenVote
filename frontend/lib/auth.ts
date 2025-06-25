import { UserSession, AppConfig, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export function authenticate() {
  showConnect({
    userSession,
    appDetails: {
      name: 'TokenVote',
      icon: window.location.origin + '/icon.png'
    }
  });
}

export function signOut() {
  userSession.signUserOut('/');
}

export function getUserData() {
  return userSession.loadUserData();
}

export function isSignedIn() {
  return userSession.isUserSignedIn();
}

export function getSTXAddress() {
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress.testnet;
  }
  return null;
}
