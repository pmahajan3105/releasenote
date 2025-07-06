import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CalloutComponent } from './callout-component'

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout block
       */
      setCallout: (attributes?: { type: string }) => ReturnType
      /**
       * Toggle a callout block
       */
      toggleCallout: (attributes?: { type: string }) => ReturnType
      /**
       * Unset callout
       */
      unsetCallout: () => ReturnType
    }
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => ({
          'data-type': attributes.type,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'callout',
          class: `callout callout-${node.attrs.type}`,
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent)
  },

  addCommands() {
    return {
      setCallout:
        attributes =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes)
        },
      toggleCallout:
        attributes =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes)
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCallout({ type: 'info' }),
    }
  },
})