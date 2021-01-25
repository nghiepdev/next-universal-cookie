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

## Installation

```bash
yarn add next-universal-cookie
```

## Usage

**Note:**

- `next-universal-cookie` does not work in [Custom App](https://nextjs.org/docs/advanced-features/custom-app) since it leads to deoptimization.
- From the `Next.js >=9.5` the `req.cookies` built-in supported.

### With ~~getInitialProps~~

**Note:** Be aware that this will opt you out of [Automatic static optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization) for your entire application.

```tsx
import {withCookie, NextCookiePageContext} from 'next-universal-cookie';

Index.getInitialProps = (ctx: NextCookiePageContext) => {
  // Available both server and client
  const cookies = ctx.cookie.getAll();
  const accessToken = ctx.cookie.get('access_token');

  // Set a cookie
  ctx.res.cookie('access_token', 'my_token_base64', {
    path: '/',
  });

  // Set another cookie at the time
  ctx.res.cookie('refresh_token', 'my_refresh_token_base64', {
    path: '/',
  });

  // Delete a cookie
  ctx.res.clearCookie('access_token');

  return {};
};

export default withCookie({
  isLegacy: true,
})(Index);
```

### With **getServerSideProps**

```tsx
import {GetServerSideProps} from 'next';
import {withCookie, applyServerSidePropsCookie} from 'next-universal-cookie';

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  applyServerSidePropsCookie(req, res);

  // Typescript-ready
  res.cookie();
  res.clearCookie();

  return {
    props: {
      // Provide the `cookieHeader` to make Hooks work
      cookieHeader: req.headers.cookie,
    },
  };
};

// Require for Hooks
export default withCookie()(Index);
```

### With Hooks

Read more [react-cookie](https://github.com/reactivestack/cookies/tree/master/packages/react-cookie#usecookiesdependencies).

```jsx
import {useCookies} from 'react-cookie';

const Profile = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);

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

```ts
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

```ts
import {
  withCookie,
  applyServerSidePropsCookie,
  applyApiCookie,
} from 'next-universal-cookie';
```

## License

MIT © [Nghiep](mailto:me@nghiepit.dev)
