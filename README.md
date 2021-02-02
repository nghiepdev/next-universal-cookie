# next-universal-cookie

[![NPM version](https://img.shields.io/npm/v/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)
[![NPM yearly download](https://img.shields.io/npm/dy/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)

> 🍪 Cookie for Next.js like a pro. A wrapper for react-cookie to Next.js

## Features

- Server-side Rendering support, just same as [express](http://expressjs.com/en/5x/api.html#res.cookie) `res.cookie` and `res.clearCookie`
- Hooks support [react-cookie](https://www.npmjs.com/package/react-cookie#usecookiesdependencies)
- API Routes support
- Perfect for authentication
- Typescript-ready

## Installation and setup

### Installation

```bash
yarn add next-universal-cookie
```

### Setup

```tsx
// pages/_app.tsx
import {NextCookieProvider} from 'next-universal-cookie';

export default function App({Component, pageProps}) {
  return (
    <NextCookieProvider cookie={pageProps.cookie}>
      <Component {...pageProps} />
    </NextCookieProvider>
  );
}
```

## Usage

### With **getServerSideProps** and ~~getInitialProps~~

```tsx
import {GetServerSideProps} from 'next';
import {applyServerSidePropsCookie} from 'next-universal-cookie';

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  applyServerSidePropsCookie(req, res);

  // Typescript-ready
  res.cookie();
  res.clearCookie();

  return {
    props: {
      // Export the `cookie` prop to use cookie with Server Side Rendering
      cookie: req.headers.cookie,
    },
  };
};
```

### With Hooks

Read more [react-cookie](https://github.com/reactivestack/cookies/tree/master/packages/react-cookie#usecookiesdependencies).

```tsx
import {useCookie} from 'next-universal-cookie';

const Profile = () => {
  const [cookies, setCookie, removeCookie] = useCookie(['access_token']);

  function handleLogout() {
    removeCookie('access_token');

    setCookie('redirect_uri', '/home', {
      path: '/',
    });
  }

  return (
    <div>
      <h3>Access token: {cookies.access_token}</h3>
      <div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};
```

### API Routes

```tsx
// pages/api/index.ts
import {NextApiRequest, NextApiResponse} from 'next';
import {applyApiCookie} from 'next-universal-cookie';

export default (req: NextApiRequest, res: NextApiResponse) => {
  applyApiCookie(req, res);

  // Typescript-ready
  res.cookie();
  res.clearCookie();
};
```

## API

```tsx
import {
  NextCookieProvider
  useCookie,
  applyServerSidePropsCookie,
  applyApiCookie,
} from 'next-universal-cookie';
```

## License

MIT
