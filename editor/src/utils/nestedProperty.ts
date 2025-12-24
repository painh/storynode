// 중첩된 객체 경로에서 값 가져오기
// 예: getNestedValue(obj, 'imageData.layer') -> obj.imageData.layer
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

// 중첩된 객체 경로에 값 설정하기 (불변성 유지)
// 예: setNestedValue(obj, 'imageData.layer', 'background')
export function setNestedValue<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split('.')

  if (keys.length === 1) {
    return { ...obj, [path]: value }
  }

  const [firstKey, ...restKeys] = keys
  const restPath = restKeys.join('.')
  const currentValue = obj[firstKey]

  return {
    ...obj,
    [firstKey]: setNestedValue(
      (currentValue as Record<string, unknown>) || {},
      restPath,
      value
    ),
  }
}
