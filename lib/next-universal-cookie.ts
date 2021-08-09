import {IncomingMessage, ServerResponse} from 'http';
import {NextApiRequest, NextApiResponse, GetServerSidePropsContext} from 'next';
import cookie from 'cookie';

import type {NextCookiePageResponse, NextCookieApiResponse} from './types';

function assertType<T>(value: unknown): asserts value is T {}

const SET_COOKIE_HEADER = 'Set-Cookie';

function applyCookie<T extends NextCookiePageResponse | NextCookieApiResponse>(
  req: IncomingMessage | GetServerSidePropsContext['req'] | NextApiRequest,
  res: ServerResponse | GetServerSidePropsContext['res'] | NextApiResponse
): asserts res is T {
  assertType<NextApiRequest>(req);
  assertType<T>(res);

  // Parse cookies
  if (req.cookies === undefined) {
    req.cookies = cookie.parse(req.headers.cookie ?? '');
  }

  // Set cookie
  if (res.cookie === undefined) {
    res.cookie = (...args) => {
      res.setHeader(SET_COOKIE_HEADER, [
        ...((res.getHeader(SET_COOKIE_HEADER) as string[]) || []),
        cookie.serialize(...args),
      ]);
    };
  }

  // Destroy cookie
  if (res.clearCookie === undefined) {
    res.clearCookie = (name, options = {}) => {
      res.setHeader(SET_COOKIE_HEADER, [
        ...((res.getHeader(SET_COOKIE_HEADER) as string[]) || []),
        cookie.serialize(name, '', {
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

export const applyServerSideCookie = <T extends NextCookiePageResponse>(
  req: IncomingMessage | GetServerSidePropsContext['req'],
  res: ServerResponse | GetServerSidePropsContext['res']
): asserts res is T => {
  applyCookie<T>(req, res);
};
