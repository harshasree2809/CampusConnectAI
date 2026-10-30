export function downloadFile(content: string, filename: string, type: string) {
 const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function csvCell(value: unknown) {
 let s=String(value??''); if(/^[\s]*[=+\-@]/.test(s)) s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
export function csv(rows: unknown[][]) {return '\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');}
export function icsText(v: unknown) {return String(v??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function fold(line:string) { const chunks:string[]=[];let part='',bytes=0;for(const char of line){const n=new TextEncoder().encode(char).length;if(bytes+n>73){chunks.push(part);part=' ';bytes=1;}part+=char;bytes+=n;}chunks.push(part);return chunks.join('\r\n'); }
export function calendar(events: any[], stamp=new Date()) {
 const date=(s:any)=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Campus Connect AI//Placement Calendar//EN','CALSCALE:GREGORIAN'];
 events.forEach(e=>{const end=e.endDate||new Date(Date.parse(e.date)+3600000).toISOString();lines.push('BEGIN:VEVENT',`UID:${e.id}@campus-connect`, `DTSTAMP:${date(stamp)}`,`DTSTART:${date(e.date)}`,`DTEND:${date(end)}`,`SUMMARY:${icsText(e.company+' - '+e.title)}`,`DESCRIPTION:${icsText(e.notes)}`,`LOCATION:${icsText(e.location)}`,'END:VEVENT');});
 lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
