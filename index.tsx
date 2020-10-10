import {ServerResponse} from 'http';
import React, {useRef} from 'react';
import {
  NextPage,
  NextPageContext,
  GetServerSideProps,
  GetServerSidePropsContext,
} from 'next';
import NextApp, {AppContext} from 'next/app';
import {serialize} from 'cookie';
import Cookies, {CookieSetOptions} from 'universal-cookie';
import {CookiesProvider} from 'react-cookie';

export interface NextCookiePageContext extends NextPageContext {
  cookie: InstanceType<typeof Cookies>;
}

export interface NextCookieAppContext extends AppContext {
  cookie: InstanceType<typeof Cookies>;
}

export interface NextCookieServerSidePropsContext
  extends GetServerSidePropsContext {
  cookie: InstanceType<typeof Cookies>;
}

export interface NextCookieServerResponse
  extends InstanceType<typeof ServerResponse> {
  cookie?: (name: string, value: any, option: CookieSetOptions) => void;
  clearCookie?: (name: string, option: CookieSetOptions) => void;
}

export type NextCookieContext = NextCookiePageContext | NextCookieAppContext;

interface NextCookieOption {
  isServerSide: boolean;
}

interface Props {
  cookieHeader: string;
}

function getDisplayName(Component: React.ComponentType<any>) {
  return Component.displayName || Component.name || 'Component';
}

function isApp(
  appOrPageCtx: AppContext | NextPageContext,
): appOrPageCtx is AppContext {
  return 'Component' in appOrPageCtx;
}

const SET_COOKIE_HEADER = 'Set-Cookie';

export function injectResponseCookie(res: NextCookieServerResponse) {
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
        path: '/',
        ...option,
        maxAge: -1,
      }),
    ]);
  };
}

export function withCookie(option?: NextCookieOption) {
  return (AppOrPage: NextPage<any> | typeof NextApp) => {
    const {isServerSide} = option ?? {isServerSide: false};

    const WithCookieWrapper = (props: Props) => {
      const cookie = useRef(new Cookies(props.cookieHeader));

      return (
        <CookiesProvider cookies={cookie.current}>
          <AppOrPage {...props} />
        </CookiesProvider>
      );
    };

    WithCookieWrapper.displayName = `withCookie(${getDisplayName(AppOrPage)})`;

    if (!isServerSide) {
      WithCookieWrapper.getInitialProps = async (
        appOrPageCtx: NextCookieContext,
      ): Promise<Props> => {
        const ctx = isApp(appOrPageCtx) ? appOrPageCtx.ctx : appOrPageCtx;

        const cookieHeader =
          typeof window !== 'undefined'
            ? document.cookie
            : ctx?.req?.headers.cookie!;

        (ctx as NextCookieContext).cookie = new Cookies(cookieHeader);

        if (ctx.res) {
          injectResponseCookie(ctx.res);
        }

        let pageProps = {};
        if (typeof AppOrPage.getInitialProps === 'function') {
          pageProps = await AppOrPage.getInitialProps(appOrPageCtx as any);
        }

        return {...pageProps, cookieHeader};
      };
    }

    return WithCookieWrapper;
  };
}

export function withServerSideProps(handler: GetServerSideProps) {
  return (ctx: NextCookieServerSidePropsContext) => {
    injectResponseCookie(ctx.res);

    ctx.cookie = new Cookies(ctx.req.headers.cookie);

    return handler(ctx);
  };
}
