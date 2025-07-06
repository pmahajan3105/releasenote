import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CodeBlockComponent } from './code-block-component'

export interface CodeBlockEnhancedOptions {
  languageClassPrefix: string
  HTMLAttributes: Record<string, any>
  defaultLanguage: string | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlockEnhanced: {
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType
    }
  }
}

export const CodeBlockEnhanced = Node.create<CodeBlockEnhancedOptions>({
  name: 'codeBlockEnhanced',

  addOptions() {
    return {
      languageClassPrefix: 'language-',
      HTMLAttributes: {},
      defaultLanguage: 'javascript',
    }
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: element => {
          const { languageClassPrefix } = this.options
          const classNames = [...(element.firstElementChild?.classList || [])]
          const languages = classNames
            .filter(className => className.startsWith(languageClassPrefix))
            .map(className => className.replace(languageClassPrefix, ''))
          const language = languages[0]

          if (!language) {
            return null
          }

          return language
        },
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {
          class: node.attrs.language
            ? this.options.languageClassPrefix + node.attrs.language
            : null,
        },
        0,
      ],
    ]
  },

  addCommands() {
    return {
      setCodeBlock:
        attributes =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCodeBlock:
        attributes =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
    }
  },

  addInputRules() {
    return [
      {
        find: /^```([a-z]+)?[\s\n]$/,
        handler: ({ state, range, match }) => {
          const attributes = match[1] ? { language: match[1] } : {}
          const { tr } = state
          const start = range.from
          const end = range.to

          tr.replaceWith(start, end, this.type.create(attributes))
        },
      },
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },
})