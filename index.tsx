import {IncomingMessage, ServerResponse} from 'http';
import {createElement, useMemo} from 'react';
import {
  NextPage,
  NextPageContext,
  NextApiRequest,
  NextApiResponse,
  GetServerSideProps,
  GetServerSidePropsContext,
} from 'next';
import {AppContext} from 'next/app';
import {serialize} from 'cookie';
import Cookies from 'universal-cookie';
import {CookiesProvider} from 'react-cookie';

import type {
  NextCookiePageContext,
  NextCookiePageResponse,
  NextCookieApiResponse,
  WithCookieProps,
  NextCookieOption,
  GetCookieServerSidePropsResponse,
} from './types';

function assertType<T>(value: unknown): asserts value is T {}

const SET_COOKIE_HEADER = 'Set-Cookie';

function isApp(ctx: AppContext | NextPageContext): ctx is AppContext {
  return 'Component' in ctx;
}

function applyCookie<T extends NextCookiePageResponse | NextCookieApiResponse>(
  req: IncomingMessage | NextApiRequest,
  res: ServerResponse | NextApiResponse
): asserts res is T {
  assertType<NextApiRequest>(req);
  assertType<T>(res);

  // Inject cookies
  if (req.cookies === undefined) {
    req.cookies = new Cookies(req.headers.cookie).getAll();
  }

  // Set cookie
  if (res.cookie === undefined) {
    res.cookie = (...args) => {
      res.setHeader(SET_COOKIE_HEADER, [
        ...((res.getHeader(SET_COOKIE_HEADER) as string[]) || []),
        serialize(...args),
      ]);
    };
  }

  // Delete cookie
  if (res.clearCookie === undefined) {
    res.clearCookie = (name, options = {}) => {
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
}

export function applyApiCookie<T extends NextCookieApiResponse>(
  req: NextApiRequest,
  res: NextApiResponse
): asserts res is T {
  applyCookie<T>(req, res);
}

export const applyServerSidePropsCookie = <
  T extends GetCookieServerSidePropsResponse
>(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res']
): asserts res is T => {
  applyCookie<T>(req, res);
};

export function withCookie(option?: NextCookieOption) {
  return (Page: NextPage) => {
    const {isLegacy} = option ?? {isLegacy: false};

    const WithCookie = (props: any) => {
      const cookies = useMemo(
        () => new Cookies((props as WithCookieProps).cookieHeader),
        [props.cookieHeader]
      );

      return createElement(
        CookiesProvider,
        {cookies},
        createElement(Page, props)
      );
    };

    const displayName = Page.displayName || Page.name || 'Component';
    WithCookie.displayName = `withCookie(${displayName})`;

    if (isLegacy === true) {
      WithCookie.getInitialProps = async (
        ctx: AppContext | NextPageContext
      ): Promise<WithCookieProps> => {
        if (isApp(ctx)) {
          throw new Error(
            'withCookie() is no longer supported in Custom <App />. Read more: https://err.sh/next.js/opt-out-auto-static-optimization'
          );
        }

        let pageProps = {};

        const cookieHeader =
          typeof window === 'undefined'
            ? ctx.req!.headers.cookie ?? ''
            : document.cookie;

        (ctx as NextCookiePageContext).cookie = new Cookies(cookieHeader);

        if (ctx.req && ctx.res) {
          applyCookie<NextCookiePageResponse>(ctx.req, ctx.res);
        }

        if (typeof Page.getInitialProps === 'function') {
          pageProps = await Page.getInitialProps(ctx);
        }

        return {...pageProps, cookieHeader};
      };
    }

    return WithCookie;
  };
}
