export interface ConnectionConfig {
  name: string
  host: string
  port: number
  database: string
  user: string
  password: string
}

export interface Connection extends ConnectionConfig {
  id: string
  createdAt: string
}

export interface ConnectionSafe extends Omit<Connection, 'password'> {
  password?: never
}
