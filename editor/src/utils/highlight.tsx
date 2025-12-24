import React from 'react'

/**
 * 텍스트에서 검색어를 하이라이트하여 렌더링
 */
export function highlightText(
  text: string,
  query: string,
  highlightClassName: string
): React.ReactNode {
  if (!query || !text) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.length)
  const after = text.slice(index + query.length)

  return (
    <>
      {before}
      <span className={highlightClassName}>{match}</span>
      {after}
    </>
  )
}
