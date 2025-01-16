export function numberToHexColor(number: number): string {
  return `#${number.toString(16).padStart(6, '0')}`;
}
