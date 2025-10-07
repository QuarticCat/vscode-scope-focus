export interface ScopeConfig {
  include?: string[];
  exclude?: string[];
}

export interface ScopesConfig {
  [name: string]: ScopeConfig;
}

export interface Scope {
  include: string[];
  exclude: string[];
}
