import tseslint from 'typescript-eslint'
import hooks from 'eslint-plugin-react-hooks'
export default tseslint.config(
 {ignores:['.next/**','node_modules/**','next-env.d.ts','.runtime/**']},
 ...tseslint.configs.recommended.map(config=>({...config,files:['**/*.ts','**/*.tsx']})),
 {files:['**/*.ts','**/*.tsx'],plugins:{'react-hooks':hooks},rules:{
  'react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'warn',
  '@typescript-eslint/ban-ts-comment':['error',{'ts-expect-error':'allow-with-description'}],
 }},
)
