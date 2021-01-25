import {IncomingMessage, ServerResponse} from 'http';
import {GetServerSidePropsContext, NextPageContext} from 'next';
import {AppContext} from 'next/app';
import Cookies, {CookieSetOptions} from 'universal-cookie';

export interface NextCookiePageContext extends NextPageContext {
  cookie: Cookies;
}

export interface NextCookieAppContext extends AppContext {
  cookie: Cookies;
}

export type NextCookieContext = NextCookiePageContext | NextCookieAppContext;

export interface NextCookieRequest extends IncomingMessage {
  cookies: Record<string, string>;
}

export interface NextCookieResponse extends ServerResponse {
  cookie: (name: string, value: any, option?: CookieSetOptions) => void;
  clearCookie: (name: string, option?: CookieSetOptions) => void;
}

export interface NextCookieOption {
  /**
   * @description Set `true` while `getServerSideProps` in use
   * @default false
   */
  isServerSide: boolean;
}
