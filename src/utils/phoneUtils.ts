import { Representante, GerenteDistrito } from '../types/contact';
import { getMappedUnit } from '../App';

/**
 * Normalizes phone numbers from Venezuela format (e.g. "424-2510098", "0424 2510098")
 * to international E.164 without plus: "584242510098"
 */
export function formatVenezuelaPhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('58') && digits.length >= 12) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return '58' + digits.substring(1);
  }
  if (digits.length === 10) {
    return '58' + digits;
  }
  return digits;
}

export function getWhatsAppUrl(phone: string, contactName?: string): string {
  const normalized = formatVenezuelaPhone(phone);
  if (!normalized) return '#';
  const text = contactName 
    ? encodeURIComponent(`Hola ${contactName}, te contacto desde la Agenda de Contactos Farma.`)
    : encodeURIComponent('Hola, te contacto desde la Agenda de Contactos Farma.');
  return `https://wa.me/${normalized}?text=${text}`;
}

export function getTelUrl(phone: string): string {
  const normalized = formatVenezuelaPhone(phone);
  if (!normalized) return '#';
  return `tel:+${normalized}`;
}

export function downloadVCard(contact: Representante | GerenteDistrito, isRep: boolean): void {
  const fullName = contact.nombre;
  const org = 'La Santé';
  const role = isRep ? 'Representante Sales Farma' : (contact as GerenteDistrito).cargo || 'Gerente de Distrito';
  const phone = contact.telefono;
  const email = contact.correo;
  const normPhone = formatVenezuelaPhone(phone);

  let note = '';
  if (isRep) {
    const rep = contact as Representante;
    note = `Región: ${rep.region} | Unidad: ${getMappedUnit(rep.unidadNegocio)} | Gerente: ${rep.gerenteDistrito} | Cédula: ${rep.cedula} | Sector: ${rep.codigoSector}`;
  } else {
    const gd = contact as GerenteDistrito;
    note = `Cargo: ${gd.cargo} | Región: ${gd.region} | Supervisor: ${gd.supervisor} | Cédula: ${gd.cedula}`;
  }

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName}`,
    `ORG:${org}`,
    `TITLE:${role}`,
    phone ? `TEL;TYPE=CELL,VOICE:+${normPhone}` : '',
    email ? `EMAIL;TYPE=WORK,INTERNET:${email}` : '',
    (contact as any).ciudad
      ? `ADR;TYPE=WORK:;;${(contact as any).ciudad};${(contact as any).estado || ''};;;Venezuela`
      : 'ADR;TYPE=WORK:;;;;;;Venezuela',
    `NOTE:${note}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanFileName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${cleanFileName}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsvFile(data: Record<string, any>[], filename: string): void {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(h => {
      const val = item[h] !== undefined && item[h] !== null ? String(item[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(';')
  );

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
