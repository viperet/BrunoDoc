// Type definitions for command options

export interface BuildOptions {
  input: string;
  output: string;
  format: string;
  exclude?: string[];
  verbose: boolean;
}

export interface Request {
  url: string;
  body?: 'none' | string;
  auth?: 'none' | 'basic' | 'bearer' | 'digest' | 'inherit';
}

export interface AuthBearer {
  token: string;
}

export interface AuthBasic {
  username: string;
  password: string;
}

export interface AuthDigest {
  username: string;
  password: string;
}

export interface BodyJson {
  [key: string]: any;
}

export interface BodyForm {
  [key: string]: string | number;
}

export type BodyText = string;

export interface Headers {
  [key: string]: string;
}

export interface Param {
  value: string | number;
  disabled?: boolean;
}

export interface ParamsQuery {
  [key: string]: Param;
}

export interface ParamsPath {
  [key: string]: string | number;
}

export interface Tests {
  [key: string]: string;
}

export interface Scripts {
  'pre-request'?: string;
  'post-response'?: string;
}

export interface BruFile {
  meta: {
    name: string;
    type: 'http' | 'graphql';
    seq: number;
  };
  // HTTP Methods
  get?: Request;
  post?: Request;
  put?: Request;
  delete?: Request;
  options?: Request;
  head?: Request;
  patch?: Request;
  trace?: Request;
  connect?: Request;

  // Auth configurations
  'auth:basic'?: AuthBasic;
  'auth:bearer'?: AuthBearer;
  'auth:digest'?: AuthDigest;

  // Parameters
  'params:query'?: ParamsQuery;
  'params:path'?: ParamsPath;

  // Headers
  headers?: Headers;

  // Body variations
  body?: string;
  'body:json'?: string;
  'body:text'?: string;
  'body:xml'?: string;
  'body:form-urlencoded'?: BodyForm;
  'body:multipart-form'?: BodyForm;
  'body:graphql'?: string;
  'body:graphql:vars'?: string;

  // Scripts
  'script:pre-request'?: string;
  'script:post-response'?: string;

  // Tests
  tests?: string;
}

export interface BruFolder {
  name: string;
  files: BruFile[];
  folders: BruFolder[];
}

export interface BruCollection {
  auth: 'basic' | 'bearer' | 'digest' | 'none'; // from collection.bru
  'auth:basic'?: AuthBasic;
  'auth:bearer'?: AuthBearer;
  'auth:digest'?: AuthDigest;
  folders: BruFolder[];
  name: string; // from bruno.json "name" field
}
