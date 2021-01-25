# next-universal-cookie

[![NPM version](https://img.shields.io/npm/v/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)
[![NPM yearly download](https://img.shields.io/npm/dy/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)

> 🍪 Cookie for Next.js like a pro. A wrapper for react-cookie to Next.js

## Features

- Server-side Rendering support, just same as [express](http://expressjs.com/en/5x/api.html#res.cookie) `req.cookies`, `res.cookie` and `res.clearCookie`
- Hooks support [react-cookie](https://www.npmjs.com/package/react-cookie#usecookiesdependencies)
- API Routes support
- Perfect for authentication

**Note:** From the `Next.js >=9.5` the `req.cookies` built-in supported. If you are working on `>=9.5 ` please upgrade to `next-universal-cookie@1`

## Installation

```bash
yarn add next-universal-cookie
```

### Integration with `_app.js`

Only once time, you can use cookie any page

```jsx
// pages/_app.js
import {withCookie} from 'next-universal-cookie';

const App = ({Component, pageProps}) => {
  return <Component {...pageProps} />;
};

export default withCookie()(App);
```

**Note:**

- Be aware that this will opt you out of [Automatic static optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization) and [getServerSideProps
  ](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering)(Server-side Rendering) for your entire application.
- This will be deprecated in the next major release!

### Integration for each per-page

```jsx
// pages/index.js
import {withCookie} from 'next-universal-cookie';

const Index = () => {
  return <div>Hello Cookie</div>;
};

export default withCookie()(Index);
```

## Usage

Reference [react-cookie](https://www.npmjs.com/package/react-cookie#usecookiesdependencies)

### For Server-side Rendering `getInitialProps` and `getServerSideProps`

#### Read cookie

In ~~getInitialProps~~

**Note:**

- Be aware that this will opt you out of [Automatic static optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization) for your entire application.
- This will be deprecated in the next major release!

```jsx
Index.getInitialProps = ctx => {
  // All cookies, only avaliable server-side, use `ctx.cookie` instance instead
  const cookies = ctx.req.cookies;

  // Or
  const cookies = ctx.cookie.getAll();
  const ahihi = ctx.cookie.get('ahihi');

  return {};
};
```

Or in `getServerSideProps`

```jsx
import {withServerSideProps, withCookie} from 'next-universal-cookie';

export const getServerSideProps = ctx => {
  // All cookies
  const cookies = ctx.req.cookies;

  return {
    props: {},
  };
};
```

#### Set and delete cookie

```jsx
Index.getInitialProps = ctx => {
  // Set a cookie
  ctx.res.cookie('access_token', 'my_token_base64', {
    path: '/',
  });

  // Set another cookie at the time
  ctx.res.cookie('refresh_token', 'my_refresh_token_base64', {
    path: '/',
  });

  // Delete a cookie
  ctx.res.clearCookie('ahihi');

  return {};
};
```

**Note:** If you are using `withCookie` in per-page and want to using cookie in `getServerSideProps` make sure `isSSG: true` option and wrap by `withServerSideProps`.

**Example:**

```jsx
import {withServerSideProps, withCookie} from 'next-universal-cookie';

export const getServerSideProps = withServerSideProps(({req, res}) => {
  // Code
});

export default withCookie({
  isSSG: true,
})(Index);
```

### Hooks

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

```js
//utils/cookie.js
import {injectResponseCookie} from 'next-universal-cookie';

export const injectApiResponseCookie = handler => (req, res) => {
  injectResponseCookie(res);

  return handler(req, res);
};
```

```js
//pages/api/auth.js
export default injectApiResponseCookie((req, res) => {
  // All cookies
  const cookies = req.cookies;

  // Set cookie
  res.cookie('my_cookie', 'my_cookie_value', {
    path: '/',
  });

  // Delete cookie
  res.clearCookie('i_am_cookie');

  res.end('Ok!');
});
```

## License

MIT © [Nghiep](mailto:me@nghiepit.dev)
