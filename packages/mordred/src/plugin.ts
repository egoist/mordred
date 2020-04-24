import {gql} from './gql'
import { Mordred } from '.'

export type Plugin = {
  name: string

  onInit: () => void | Promise<void>
}

export class PluginContext {
  public schema = ''
  public resolvers = '{}'
  public gql = gql

  constructor(public mordred: Mordred) {}

  setSchema = (schema: string) => {
    this.schema = schema
  }

  setResolvers = (resolvers: any) => {
    this.resolvers = resolvers
  }

  async writeGraphQL() {
    await this.mordred.writeGraphQL()
  }

  async writeNodes() {
    await this.mordred.writeNodes()
  }

  async writeAll() {
    await this.mordred.writeAll()
  }
}

export type PluginFactory<TOptions = any> = (context: PluginContext, options: TOptions) => Plugin
