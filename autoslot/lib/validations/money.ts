import { z } from 'zod'

export const MAX_MONEY = 99_999_999.99

export function hasCentPrecision(value: number) {
  return Number.isFinite(value) && Number(value.toFixed(2)) === value
}

export function isValidMoney(value: number) {
  return value >= 0 && value <= MAX_MONEY && hasCentPrecision(value)
}

// Accept the decimal separator displayed in the Russian UI; never round input.
export function parseDecimalInput(value: string) {
  const normalized = value.trim().replace(',', '.')
  return /^-?\d+(?:\.\d*)?$/.test(normalized) ? Number(normalized) : Number.NaN
}

export const moneySchema = z.number({ error: 'Укажите корректную сумму.' })
  .min(0, 'Сумма не может быть отрицательной.')
  .max(MAX_MONEY, 'Сумма не должна превышать 99 999 999,99 ₽.')
  .refine(hasCentPrecision, 'Укажите не более двух знаков после запятой.')
