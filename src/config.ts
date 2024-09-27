export interface Scope {
  include: string[];
  exclude: string[];
}

export interface Scopes {
  [name: string]: Scope;
}
