let globalId = 0
export const getId = () => {
  globalId++
  return globalId
}
