import {ServerResponse} from 'http';
import {NextApiResponse, NextPageContext} from 'next';
import Cookies, {CookieSetOptions} from 'universal-cookie';

interface NextCookieResponse {
  cookie: (name: string, value: any, option?: CookieSetOptions) => void;
  clearCookie: (name: string, option?: CookieSetOptions) => void;
}

export interface NextCookiePageResponse
  extends ServerResponse,
    NextCookieResponse {}

export interface NextCookieApiResponse
  extends NextApiResponse,
    NextCookieResponse {}

export interface GetCookieServerSidePropsResponse
  extends ServerResponse,
    NextCookieResponse {}

export interface NextCookiePageContext extends Omit<NextPageContext, 'res'> {
  cookie: Cookies;
  res: NextCookiePageResponse;
}

export interface WithCookieProps {
  cookieHeader?: string;
}

export interface NextCookieOption {
  /**
   * @description Set `true` while getInitialProps in use
   * @default false
   */
  isLegacy: boolean;
}
