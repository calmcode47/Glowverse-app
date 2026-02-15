import type { ActivityItem } from './types';

function toCSV(items: ActivityItem[]): string {
  const header = ['id', 'type', 'timestamp', 'title', 'description'];
  const rows = items.map(i => [
    i.id,
    i.type,
    new Date(i.timestamp).toISOString(),
    i.title.replace(/,/g, ' '),
    (i.description || '').replace(/,/g, ' ')
  ]);
  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export async function exportHistory(format: 'pdf' | 'json' | 'csv', items: ActivityItem[]): Promise<{ content: string; mime: string; filename: string }> {
  if (format === 'json') {
    return { content: JSON.stringify(items, null, 2), mime: 'application/json', filename: 'history.json' };
  }
  if (format === 'csv') {
    const content = toCSV(items);
    return { content, mime: 'text/csv', filename: 'history.csv' };
  }
  const html = `<html><body><h1>History</h1><pre>${items.map(i => `${new Date(i.timestamp).toLocaleString()} • ${i.type} • ${i.title}`).join('\n')}</pre></body></html>`;
  return { content: html, mime: 'text/html', filename: 'history.html' };
}

