export const getGoogleOAuthURL = () => {
  const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: 'http://localhost:3000/user/auth/google/callback',
    client_id:
      '391206109401-vs59v7cmicomu6aa8pcmii6d3sbf6nhk.apps.googleusercontent.com',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  console.log('QS: ', qs);
  console.log('URL: ', `${rootURL}?${qs.toString()}`);
  return `${rootURL}?${qs.toString()}`;
};
