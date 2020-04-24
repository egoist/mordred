export function gql(literals: TemplateStringsArray, ...variables: any[]) {
  return literals
    .map((l, i) => {
      const variable = variables[i]
      return `${l}${variable ? variable : ''}`
    })
    .join('')
}
