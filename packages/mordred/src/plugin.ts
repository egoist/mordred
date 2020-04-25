import { Mordred } from '.'

export type Plugin = {
  name: string

  onInit?: () => void | Promise<void>

  getSchema?: () => string

  getResolvers?: () => string

  createNodes?: () => any[] | Promise<any[]>
}

export type PluginFactory<TOptions = any> = (
  context: Mordred,
  options: TOptions
) => Plugin
