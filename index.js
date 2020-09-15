import React, {useRef} from 'react';
import {serialize} from 'cookie';
import Cookies from 'universal-cookie';
import {CookiesProvider} from 'react-cookie';

const SET_COOKIE_HEADER = 'Set-Cookie';

export const injectResponseCookie = res => {
  // Set cookie
  res.cookie = (...args) => {
    res.setHeader(SET_COOKIE_HEADER, [
      ...(res.getHeader(SET_COOKIE_HEADER) || []),
      serialize(...args),
    ]);
  };

  // Delete cookie
  res.clearCookie = (name, option = {}) => {
    res.setHeader(SET_COOKIE_HEADER, [
      ...(res.getHeader(SET_COOKIE_HEADER) || []),
      serialize(name, '', {
        maxAge: -1,
        path: '/',
        ...option,
      }),
    ]);
  };
};

export const withCookie = (
  option = {isServerSide: false},
) => AppPageComponent => {
  const {isServerSide} = option;

  const AppOrPage = props => {
    const cookies = useRef(new Cookies(props.cookieHeader));

    return (
      <CookiesProvider cookies={cookies.current}>
        <AppPageComponent {...props} />
      </CookiesProvider>
    );
  };

  AppOrPage.displayName = `withCookie(${
    AppPageComponent.displayName || AppPageComponent.name
  })`;

  if (!isServerSide) {
    AppOrPage.getInitialProps = async appOrPageCtx => {
      const isApp = !!appOrPageCtx.Component;
      const ctx = isApp ? appOrPageCtx.ctx : appOrPageCtx;
      const cookieHeader = process.browser
        ? document.cookie
        : ctx.req.headers.cookie;

      ctx.cookie = new Cookies(cookieHeader);

      if (ctx.res) {
        injectResponseCookie(ctx.res);
      }

      let pageProps = {};
      if (typeof AppPageComponent.getInitialProps === 'function') {
        pageProps = await AppPageComponent.getInitialProps(appOrPageCtx);
      }

      return {...pageProps, cookieHeader};
    };
  }

  return AppOrPage;
};

export const withServerSideProps = callback => ctx => {
  injectResponseCookie(ctx.res);

  ctx.cookie = new Cookies(ctx.req.headers.cookie);

  return callback(ctx);
};
