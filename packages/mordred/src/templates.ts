import { join } from 'path'
import { compile } from 'ejs'
import { readFileSync } from 'fs-extra'

const template = readFileSync(
  join(__dirname, '../templates/graphql.ejs'),
  'utf8'
)

export const graphqlTemplate = compile(template)

export const graphqlDefinitionTemplate = readFileSync(
  join(__dirname, '../templates/graphql.d.ts'),
  'utf8'
)
