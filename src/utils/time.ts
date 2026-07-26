export function msToTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;

  const f_H = hours.toString().padStart(2, '0');
  const f_M = remainingMinutes.toString().padStart(2, '0');
  const f_S = remainingSeconds.toString().padStart(2, '0');

  return `${f_H !== '00' ? f_H + ':' : ''}${f_M}:${f_S}`;
}
