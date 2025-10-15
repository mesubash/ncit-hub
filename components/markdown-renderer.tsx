import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
        // Custom styling for various markdown elements
        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-5 mb-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-lg font-semibold mt-4 mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
        li: ({ node, ...props }) => <li className="ml-4" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />
        ),
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
          ) : (
            <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props} />
          ),
        pre: ({ node, ...props }) => <pre className="bg-muted rounded-lg overflow-x-auto my-4" {...props} />,
        a: ({ node, ...props }) => (
          <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        img: ({ node, ...props }) => (
          <img className="rounded-lg my-4 max-w-full h-auto" {...props} alt={props.alt || ''} />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-border" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props} />
        ),
        td: ({ node, ...props }) => <td className="border border-border px-4 py-2" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
