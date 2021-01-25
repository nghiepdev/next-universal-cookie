import {IncomingMessage, ServerResponse} from 'http';
import {createElement, useMemo} from 'react';
import {
  NextPage,
  NextPageContext,
  GetServerSideProps,
  GetServerSidePropsContext,
} from 'next';
import {AppContext} from 'next/app';
import {serialize} from 'cookie';
import Cookies from 'universal-cookie';
import {CookiesProvider} from 'react-cookie';

import type {
  NextCookieContext,
  NextWithCookieIncomingMessage,
  NextWithCookieServerResponse,
} from './types';

interface NextCookieOption {
  /**
   * @default false
   */
  isSSG: boolean;
}

interface Props {
  cookieHeader: string;
}

function assertType<T>(value: unknown): asserts value is T {}

const SET_COOKIE_HEADER = 'Set-Cookie';

function isApp(
  appOrPageCtx: AppContext | NextPageContext
): appOrPageCtx is AppContext {
  return 'Component' in appOrPageCtx;
}

export function injectRequestCookie(
  req: IncomingMessage
): asserts req is NextWithCookieIncomingMessage {
  assertType<NextWithCookieIncomingMessage>(req);

  if (req.cookies === undefined) {
    req.cookies = new Cookies(req.headers.cookie).getAll();
  }
}

export function injectResponseCookie(
  res: ServerResponse
): asserts res is NextWithCookieServerResponse {
  assertType<NextWithCookieServerResponse>(res);

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
    res.clearCookie = (name, option = {}) => {
      res.setHeader(SET_COOKIE_HEADER, [
        ...((res.getHeader(SET_COOKIE_HEADER) as string[]) || []),
        serialize(name, '', {
          path: '/',
          ...option,
          maxAge: -1,
        }),
      ]);
    };
  }
}

export function withCookie(option?: NextCookieOption) {
  // AppOrPage: NextPage<Props> | typeof NextApp
  return (AppOrPage: NextPage<Props>) => {
    const {isSSG} = option ?? {isSSG: false};

    const WithCookieWrapper = (props: Props) => {
      const cookies = useMemo(() => new Cookies(props.cookieHeader), [
        props.cookieHeader,
      ]);

      return createElement(
        CookiesProvider,
        {cookies},
        createElement(AppOrPage, props)
      );
    };

    WithCookieWrapper.displayName = `withCookie(${AppOrPage.displayName})`;

    if (isSSG === false) {
      WithCookieWrapper.getInitialProps = async (
        appOrPageCtx: NextCookieContext
      ): Promise<Props> => {
        const ctx = isApp(appOrPageCtx) ? appOrPageCtx.ctx : appOrPageCtx;

        const cookieHeader =
          typeof window !== 'undefined'
            ? document.cookie
            : ctx.req!.headers.cookie!;

        (ctx as NextCookieContext).cookie = new Cookies(cookieHeader);

        if (ctx.req) {
          injectRequestCookie(ctx.req);
        }

        if (ctx.res) {
          injectResponseCookie(ctx.res);
        }

        let pageProps = {};
        if (typeof AppOrPage.getInitialProps === 'function') {
          pageProps = await AppOrPage.getInitialProps(appOrPageCtx as never);
        }

        return {...pageProps, cookieHeader};
      };
    }

    return WithCookieWrapper;
  };
}

export function withServerSideProps(handler: GetServerSideProps) {
  return (ctx: GetServerSidePropsContext) => {
    injectRequestCookie(ctx.req);

    injectResponseCookie(ctx.res);

    return handler(ctx);
  };
}
