import generateAliasesResolver from 'esm-module-alias'

const aliases = {
  "@root": "."
}

export const resolve = generateAliasesResolver(aliases)