# next-universal-cookie

[![NPM version](https://img.shields.io/npm/v/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)
[![NPM monthly download](https://img.shields.io/npm/dm/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)

> Provides way to read, set and delete a cookie for Next.js similar to `express` such as [req.cookies](http://expressjs.com/en/5x/api.html#req.cookies), [res.cookie](http://expressjs.com/en/5x/api.html#res.cookie) and [res.clearCookie](http://expressjs.com/en/5x/api.html#res.clearCookie)

## Installation

```bash
npm install next-universal-cookie
```

## Usage

### With **getServerSideProps** and ~~getInitialProps~~

```tsx
import {GetServerSideProps, NextPageContext} from 'next';
import {applyServerSideCookie} from 'next-universal-cookie';

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  applyServerSideCookie(req, res);

  // Typescript-ready

  // Parse all cookies
  const allCookies = req.cookies;

  // Set a cookie
  res.cookie();

  // Delete a cookie
  res.clearCookie();

  return {
    props: {},
  };
};
```

### API Routes

```tsx
// pages/api/index.ts
import {NextApiRequest, NextApiResponse} from 'next';
import {applyApiCookie} from 'next-universal-cookie';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ok: boolean}>
) {
  applyApiCookie(req, res);

  // Typescript-ready
  const allCookies = req.cookies;
  res.cookie();
  res.clearCookie();

  res.json({ok: true});
}
```

## API

```tsx
import {applyServerSideCookie, applyApiCookie} from 'next-universal-cookie';
```

## License

MIT
