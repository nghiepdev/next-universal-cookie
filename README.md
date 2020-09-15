# next-universal-cookie

[![NPM version](https://img.shields.io/npm/v/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)
[![NPM yearly download](https://img.shields.io/npm/dy/next-universal-cookie.svg)](https://www.npmjs.com/package/next-universal-cookie)

> 🍪 Cookie for Next.js like a pro. A wrapper for react-cookie to Next.js

## Features

- Easy to integration
- For Server-side Rendering, just same as [express](http://expressjs.com/en/5x/api.html#res.cookie) `res.cookie` and `res.clearCookie`
- Hooks support, usage seems as [react-cookie](https://www.npmjs.com/package/react-cookie#usecookiesdependencies)
- Perfect for authentication

## Installation

```bash
yarn add next-universal-cookie
```

### Integration with `_app.js`

Only once time. However, be aware that this will opt you out of [Automatic static optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization) and [getServerSideProps (Server-side Rendering)
](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) for your entire application.

```jsx
// pages/_app.js
import {withCookie} from 'next-universal-cookie';

const App = ({Component, pageProps}) => {
  return <Component {...pageProps} />;
};

export default withCookie()(App);
```

### Integration for per-page want to use

```jsx
// pages/index.js
import {withCookie} from 'next-universal-cookie';

const Index = () => {
  return <div>Hello Cookie</div>;
};

export default withCookie()(Index);
```

## Usage

Reference document to `react-cookie` and `universal-cookie`.

### For Server-side Rendering `getInitialProps` or `getServerSideProps`

#### Read cookie

#### In `getInitialProps`

```jsx
Index.getInitialProps = ctx => {
  const cookies = ctx.cookie.getAll();
  const ahihi = ctx.cookie.get('ahihi');

  return {};
};
```

#### In `getServerSideProps`

```jsx
import {withServerSideProps, withCookie} from 'next-universal-cookie';

export const getServerSideProps = withServerSideProps(ctx => {
  const cookies = ctx.cookie.getAll();
  const ahihi = ctx.cookie.get('ahihi');

  return {
    props: {},
  };
});

export default withCookie({
  isServerSide: true,
})(Index);
```

#### Set and delete cookie

```jsx
Index.getInitialProps = ctx => {
  // Set a cookie
  ctx.res.cookie('access_token', 'my_token_base64', {
    path: '/',
    expires: new Date(),
  });

  // Set another cookie at the time
  ctx.res.cookie('refresh_token', 'my_refresh_token_base64', {
    path: '/',
    expires: new Date(),
  });

  // Delete a cookie
  ctx.res.clearCookie('ahihi');

  return {};
};
```

**Note:** If use `getServerSideProps` instead of `getInitialProps` for Server-side Rendering that means you have chosen `withCookie` in per-page.
And make sure `isServerSide: true` option.

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

## License

MIT © [Nghiep](mailto:me@nghiepit.dev)
