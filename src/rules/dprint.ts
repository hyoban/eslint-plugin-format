import { join } from 'node:path'
import type { Rule } from 'eslint'
import { createSyncFn } from 'synckit'
import { messages, reportDifferences } from 'eslint-formatting-reporter'
import { dirWorkers } from '../dir'
import type { DprintOptions } from '../../dts/rule-options'

let format: (code: string, filename: string, options: DprintOptions) => string

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Use dprint to format code',
      category: 'Stylistic',
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          language: {
            type: 'string',
            required: true,
          },
          languageOptions: {
            type: 'object',
          },
        },
        additionalProperties: true,
      },
    ],
    messages,
  },
  create(context) {
    if (!format)
      format = createSyncFn(join(dirWorkers, 'dprint.cjs')) as any

    return {
      Program() {
        const sourceCode = context.sourceCode.text
        const formatted = format(sourceCode, context.filename, context.options[0] || {})

        reportDifferences(context, sourceCode, formatted)
      },
    }
  },
} satisfies Rule.RuleModule
