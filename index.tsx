import {IncomingMessage, ServerResponse} from 'http';
import {createElement} from 'react';
import {NextApiRequest, NextApiResponse, GetServerSidePropsContext} from 'next';
import {serialize} from 'cookie';
import {Cookies, CookiesProvider, useCookies as useCookie} from 'react-cookie';

export * from './types';
export {useCookie};
import type {
  NextCookiePageResponse,
  NextCookieApiResponse,
  GetCookieServerSidePropsResponse,
} from './types';

function assertType<T>(value: unknown): asserts value is T {}

const SET_COOKIE_HEADER = 'Set-Cookie';

function applyCookie<
  T extends
    | NextCookiePageResponse
    | NextCookieApiResponse
    | GetCookieServerSidePropsResponse
>(
  req: IncomingMessage | NextApiRequest | GetServerSidePropsContext['req'],
  res: ServerResponse | NextApiResponse | GetCookieServerSidePropsResponse
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

  // Destroy cookie
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

export function NextCookieProvider({children, cookie}) {
  return createElement(
    CookiesProvider,
    {
      cookies: cookie instanceof Cookies ? cookie : new Cookies(cookie),
    },
    children
  );
}
