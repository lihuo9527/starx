import { format, getTime, formatDistanceToNow } from 'date-fns';
// ----------------------------------------------------------------------

export function fDate(date) {
  return date ? format(new Date(date), 'dd MMMM yyyy') : '';
}

export function fDateTime(date, onlyDay = false) {
  return date ? format(new Date(date), `yyyy-MM-dd${!onlyDay ? ' HH:mm:ss' : ''}`) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fDateTimeSuffix(date) {
  return date ? format(new Date(date), 'dd/MM/yyyy hh:mm p') : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function formatDate(date) {
  return date ? format(new Date(date), 'yyyy-MM-dd') : '';
}
