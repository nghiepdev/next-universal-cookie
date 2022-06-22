import {IncomingMessage, ServerResponse} from 'http';
import {NextApiRequest, NextApiResponse, GetServerSidePropsContext} from 'next';
import cookie from 'cookie';

import type {NextCookiePageResponse, NextCookieApiResponse} from './types';


const SET_COOKIE_HEADER = 'Set-Cookie';

function applyCookie<T extends NextCookiePageResponse | NextCookieApiResponse>(
  req: IncomingMessage | GetServerSidePropsContext['req'] | NextApiRequest,
  res: ServerResponse | GetServerSidePropsContext['res'] | NextApiResponse
): asserts res is T {
  assertType<NextApiRequest>(req);
  assertType<T>(res);

  function getCookieHeaders() {
    let cookieHeaders = res.getHeader(SET_COOKIE_HEADER) ?? [];

    if (!Array.isArray(cookieHeaders)) {
      cookieHeaders = [`${cookieHeaders}`];
    }

    return cookieHeaders;
  }

  // Parse cookies
  if (req.cookies === undefined) {
    req.cookies = cookie.parse(req.headers.cookie ?? '');
  }

  // Set cookie
  if (res.cookie === undefined) {
    res.cookie = (...args) => {
      res.setHeader(SET_COOKIE_HEADER, [
        ...getCookieHeaders(),
        cookie.serialize(...args),
      ]);
    };
  }

  // Remove cookie
  if (res.clearCookie === undefined) {
    res.clearCookie = (name, options = {}) => {
      res.setHeader(SET_COOKIE_HEADER, [
        ...getCookieHeaders(),
        cookie.serialize(name, '', {
          path: '/',
          ...options,
          maxAge: -1,
        }),
      ]);
    };
  }
}

export function applyApiCookie<
  R extends any,
  T extends NextCookieApiResponse<R>
>(req: NextApiRequest, res: NextApiResponse<R>): asserts res is T {
  applyCookie<T>(req, res);
}

export const applyServerSideCookie = <T extends NextCookiePageResponse>(
  req: IncomingMessage | GetServerSidePropsContext['req'],
  res: ServerResponse | GetServerSidePropsContext['res']
): asserts res is T => {
  applyCookie<T>(req, res);
};
