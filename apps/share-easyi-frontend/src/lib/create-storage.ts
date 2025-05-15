import { Option } from '@/lib/result'

type Props = {
  getItem: (name: string) => string | null
  setItem: (name: string, value: string) => void
}

export function createStorage({ getItem: _getItem, setItem: _setItem }: Props) {
  const getItem = <Value = object>(name: string): Option<Value> => {
    try {
      const json = _getItem(name)
      if (json == null) {
        return Option.none
      }

      const parsed = JSON.parse(json) as Value

      return Option.some(parsed)
    } catch (e) {
      console.error(e);
      return Option.none;
    }
  }

  const setItem = (name: string, value: unknown): void => {
    const json = JSON.stringify(value)
    _setItem(name, json)
  }

  return {
    getItem,
    setItem,
  }
}
