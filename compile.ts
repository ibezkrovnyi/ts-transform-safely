import * as ts from 'typescript'
import { sync as globSync } from 'glob'
import { transform } from './src'

declare module 'fs-extra' {
    export function outputJsonSync(file: string, data: any, opts?: {}): void;
}

const CJS_CONFIG = {
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noEmitOnError: false,
    noUnusedLocals: true,
    noUnusedParameters: true,
    stripInternal: true,
    target: ts.ScriptTarget.ES5
}

export default function compile(input: string, options: ts.CompilerOptions = CJS_CONFIG) {
    console.log('startingcompling')
    const files = globSync(input)
    const compilerHost = ts.createCompilerHost(options)
    const program = ts.createProgram(files, options, compilerHost)

    const msgs = {}

    let emitResult = program.emit(undefined, undefined, undefined, undefined, {
        before: [
            transform()
        ]
    })

    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

    allDiagnostics.forEach(diagnostic => {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
    })
    console.log('done compilng', emitResult.emittedFiles)
    return msgs
}