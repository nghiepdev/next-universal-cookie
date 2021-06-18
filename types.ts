import {ServerResponse} from 'http';
import {NextApiResponse} from 'next';
import {CookieSerializeOptions} from 'cookie';

interface NextCookieResponse {
  cookie: (name: string, value: any, option?: CookieSerializeOptions) => void;
  clearCookie: (name: string, option?: CookieSerializeOptions) => void;
}

export interface NextCookiePageResponse
  extends ServerResponse,
    NextCookieResponse {}

export interface NextCookieApiResponse
  extends NextApiResponse,
    NextCookieResponse {}
