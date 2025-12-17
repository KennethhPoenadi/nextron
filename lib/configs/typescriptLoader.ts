/* eslint-disable @typescript-eslint/no-explicit-any */

import path from 'path'
import { createJiti } from 'jiti'
import { TypeScriptCompileError } from './typescriptCompileError'

type Jiti = ReturnType<typeof createJiti>
type JitiOptions = Parameters<typeof createJiti>[1]
type LoaderAsync = (filepath: string) => Promise<any>

function TypeScriptLoader(options?: JitiOptions): LoaderAsync {
  const loader: Jiti = createJiti('', { interopDefault: true, ...options })
  return async (path: string): Promise<any> => {
    try {
      const mod = (await loader.import(path)) as { default?: unknown }
      return mod.default || mod
    } catch (error) {
      if (error instanceof Error) {
        // Coerce generic error instance into typed error with better logging.
        throw TypeScriptCompileError.fromError(error)
      }
      throw error
    }
  }
}

export async function loadScriptFile<T = any>(filePath: string): Promise<T> {
  if (['.js', '.mjs', '.cjs'].includes(path.extname(filePath))) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(filePath)
    return (mod.default || mod) as T
  }
  return TypeScriptLoader()(filePath) as T
}
