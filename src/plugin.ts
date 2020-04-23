import {gql} from './gql'
import { State } from './query'

export type Plugin = {
  name: string

  onInit: () => void | Promise<void>
}

export class PluginContext {
  public schema = ''
  public resolvers: any = {}
  public gql = gql

  constructor(public state: State) {}

  setSchema = (schema: string) => {
    this.schema = schema
  }

  setResolvers = (resolvers: any) => {
    this.resolvers = resolvers
  }

  refreshResolvers = () => {
    this.state.createResolvers()
  }

  refreshSchema = () => {
    this.state.createSchema()
  }
}

export type PluginFactory = (context: PluginContext) => Plugin
