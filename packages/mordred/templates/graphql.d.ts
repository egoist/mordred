import { ExecutionResult, GraphQLSchema } from 'graphql'
import { Thunder } from './zeus'

export const client: ReturnType<typeof Thunder>

export declare type QueryOptions = {
  variables?: {
    [k: string]: any
  }
}

export declare const schema: GraphQLSchema

export declare const executeQuery: (
  query: string,
  options?: QueryOptions,
) => ExecutionResult

export declare function gql(
  literals: TemplateStringsArray,
  ...variables: any[]
): string
