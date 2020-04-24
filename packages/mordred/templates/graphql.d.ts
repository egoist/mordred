import { ExecutionResult, GraphQLSchema } from 'graphql'

export declare type QueryOptions = {
  variables?: {
    [k: string]: any
  }
}

export declare const schema: GraphQLSchema

export declare const query: (
  query: string,
  options?: QueryOptions
) => ExecutionResult

export declare function gql(
  literals: TemplateStringsArray,
  ...variables: any[]
): string
