interface PrismStatic {
  highlightElement: (element: HTMLElement) => void
  highlightAll: () => void
  manual?: boolean
}

declare module 'prismjs' {
  const Prism: PrismStatic
  export default Prism
}

declare module 'prismjs/components/*'

interface Window {
  Prism?: PrismStatic
}
