import { lawlyTheme } from './theme'

export function hslToTailwindVar(hslValue: string) {
  return hslValue.replace('hsl(', '').replace(')', '')
}

export const colors = {
  ...Object.entries(lawlyTheme.light).reduce((acc, [key]) => ({
    ...acc,
    [key]: `hsl(var(--${key}))`,
  }), {}),
} 