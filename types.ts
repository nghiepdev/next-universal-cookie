import {IncomingMessage, ServerResponse} from 'http';
import {NextPageContext} from 'next';
import Cookies, {CookieSetOptions} from 'universal-cookie';

export interface NextCookiePageContext extends NextPageContext {
  cookie: Cookies;
}

export interface NextWithCookieIncomingMessage extends IncomingMessage {
  cookies: Record<string, string>;
}

export interface NextWithCookieServerResponse extends ServerResponse {
  cookie: (name: string, value: any, option: CookieSetOptions) => void;
  clearCookie: (name: string, option: CookieSetOptions) => void;
}

export interface WithCookieProps {
  cookieHeader: string;
}

export interface NextCookieOption {
  /**
   * @description Set `true` while getInitialProps in use
   * @default false
   */
  isLegacy: boolean;
}
