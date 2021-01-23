import {IncomingMessage, ServerResponse} from 'http';
import {createElement, useMemo} from 'react';
import {
  NextPage,
  NextPageContext,
  GetServerSideProps,
  NextApiHandler,
} from 'next';
import {AppContext} from 'next/app';
import {serialize} from 'cookie';
import Cookies from 'universal-cookie';
import {CookiesProvider} from 'react-cookie';

import type {
  NextCookiePageContext,
  NextCookieServerSidePropsContext,
  NextWithCookieIncomingMessage,
  NextWithCookieServerResponse,
  WithCookieProps,
} from './types';

const SET_COOKIE_HEADER = 'Set-Cookie';

function isNextApiHandler(
  handler: NextApiHandler | NextPage<WithCookieProps>
): handler is NextApiHandler {
  return handler.length > 1;
}

function isApp(ctx: AppContext | NextPageContext): ctx is AppContext {
  return 'Component' in ctx;
}

function injectRequestCookie(
  req: IncomingMessage
): asserts req is NextWithCookieIncomingMessage {
  (req as NextWithCookieIncomingMessage).cookies = new Cookies(
    req.headers.cookie
  ).getAll();
}

function injectResponseCookie(
  res: ServerResponse
): asserts res is NextWithCookieServerResponse {
  // Set cookie
  (res as NextWithCookieServerResponse).cookie = (...args) => {
    res.setHeader(SET_COOKIE_HEADER, [
      ...((res.getHeader(SET_COOKIE_HEADER) as string[]) || []),
      serialize(...args),
    ]);
  };

  // Delete cookie
  (res as NextWithCookieServerResponse).clearCookie = (name, options = {}) => {
    res.setHeader(SET_COOKIE_HEADER, [
      ...((res.getHeader(SET_COOKIE_HEADER) as string[]) || []),
      serialize(name, '', {
        path: '/',
        ...options,
        maxAge: -1,
      }),
    ]);
  };
}

export function applyCookie(req: IncomingMessage, res: ServerResponse) {
  injectRequestCookie(req);
  injectResponseCookie(res);
}

export function withCookie(
  handler: NextPage<WithCookieProps> | NextApiHandler
) {
  // Next APIs
  if (isNextApiHandler(handler)) {
    const withCookie: typeof handler = (req, res) => {
      applyCookie(req, res);

      return handler(req, res);
    };

    return withCookie;
  }

  // Next Pages
  const Page = handler;

  const WithCookie = (props: WithCookieProps) => {
    const cookies = useMemo(() => new Cookies(props.cookieHeader), [
      props.cookieHeader,
    ]);

    return createElement(
      CookiesProvider,
      {cookies},
      createElement(Page, props)
    );
  };

  const displayName = Page.displayName || Page.name || 'Component';
  WithCookie.displayName = `withCookie(${displayName})`;

  WithCookie.getInitialProps = async (
    ctx: AppContext | NextCookiePageContext
  ): Promise<WithCookieProps> => {
    if (isApp(ctx)) {
      throw new Error(
        'Custom <App /> is no longer supported. Read more: https://err.sh/next.js/opt-out-auto-static-optimization'
      );
    }

    let pageProps = {};

    const cookieHeader =
      typeof window === 'undefined'
        ? ctx.req!.headers.cookie ?? ''
        : document.cookie;

    ctx.cookie = new Cookies(cookieHeader);

    if (ctx.req && ctx.res) {
      applyCookie(ctx.req, ctx.res);
    }

    if (typeof Page.getInitialProps === 'function') {
      pageProps = await Page.getInitialProps(ctx);
    }

    return {...pageProps, cookieHeader};
  };

  return WithCookie;
}

export function withServerSideProps(handler: GetServerSideProps) {
  return (ctx: NextCookieServerSidePropsContext) => {
    applyCookie(ctx.req, ctx.res);

    return handler(ctx);
  };
}
