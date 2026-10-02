import * as z from 'zod/v4';

const API_BASE = 'https://indicepa.gov.it/ipa-dati/api/3/action/';
const DATASETS = {
  entities: 'enti',
  offices: 'responsabili-della-transizione-al-digitale',
} as const;
const MAX_BYTES = 2 * 1024 * 1024;
const CACHE_MS = 5 * 60 * 1000;

const nullableText = z.string().nullable();
export const sourceSchema = z.object({
  attribution: z.string(),
  dataset_url: z.string(),
  resource_id: z.string(),
  license: nullableText,
  license_url: nullableText,
  dataset_refreshed_at: nullableText,
});
export const contactSchema = z.object({ address: z.string(), type: nullableText });
export const entitySchema = z.object({
  ipa_code: z.string(),
  name: z.string(),
  category_code: nullableText,
  municipality_istat_code: nullableText,
  website: nullableText,
  contacts: z.array(contactSchema),
  record_updated_at: nullableText,
});
export const officeSchema = z.object({
  unit_code: nullableText,
  description: nullableText,
  responsible_name: nullableText,
  responsible_email: nullableText,
  responsible_phone: nullableText,
  office_contacts: z.array(contactSchema),
  record_updated_at: nullableText,
});
export const searchResultSchema = z.object({
  query: z.string(),
  retrieved_at: z.string(),
  total: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  next_offset: z.number().int().nonnegative().nullable(),
  entities: z.array(entitySchema),
  source: sourceSchema,
  notes: z.array(z.string()),
});
export const officesResultSchema = z.object({
  ipa_code: z.string(),
  retrieved_at: z.string(),
  entity_found: z.boolean(),
  entity: entitySchema.nullable(),
  total_offices: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  next_offset: z.number().int().nonnegative().nullable(),
  offices: z.array(officeSchema),
  sources: z.object({ entities: sourceSchema, offices: sourceSchema }),
  notes: z.array(z.string()),
});

type Row = Record<string, unknown>;
type Source = z.infer<typeof sourceSchema>;
const envelopeSchema = z.object({ success: z.boolean(), result: z.unknown().optional() });
const packageSchema = z.object({
  license_id: nullableText.optional(),
  license_url: nullableText.optional(),
  metadata_modified: nullableText.optional(),
  resources: z.array(z.object({
    id: z.string(),
    datastore_active: z.boolean().optional(),
    last_modified: nullableText.optional(),
  })),
});
const datastoreSchema = z.object({
  total: z.number().int().nonnegative(),
  records: z.array(z.record(z.string(), z.unknown())),
});

function text(row: Row, field: string): string | null {
  const value = row[field];
  return value == null || String(value).trim() === '' ? null : String(value).trim();
}

function contacts(row: Row, count: number) {
  return Array.from({ length: count }, (_, index) => index + 1)
    .map(index => ({ address: text(row, `Mail${index}`), type: text(row, `Tipo_Mail${index}`) }))
    .filter((entry): entry is { address: string; type: string | null } => entry.address !== null);
}

function entity(row: Row): z.infer<typeof entitySchema> {
  const code = text(row, 'Codice_IPA');
  const name = text(row, 'Denominazione_ente');
  if (!code || !name) throw new Error('IPA ha restituito un ente senza codice o denominazione.');
  return {
    ipa_code: code,
    name,
    category_code: text(row, 'Codice_Categoria'),
    municipality_istat_code: text(row, 'Codice_comune_ISTAT'),
    website: text(row, 'Sito_istituzionale'),
    contacts: contacts(row, 5),
    record_updated_at: text(row, 'Data_aggiornamento'),
  };
}

function office(row: Row): z.infer<typeof officeSchema> {
  const name = [text(row, 'Nome_responsabile'), text(row, 'Cognome_responsabile')]
    .filter(Boolean).join(' ') || null;
  return {
    unit_code: text(row, 'Codice_uni_uo'),
    description: text(row, 'Descrizione_uo'),
    responsible_name: name,
    responsible_email: text(row, 'Mail_responsabile'),
    responsible_phone: text(row, 'Telefono_responsabile'),
    office_contacts: contacts(row, 3),
    record_updated_at: text(row, 'Data_aggiornamento'),
  };
}

/** Fixed upstream, bounded reads and a short metadata cache. No credentials or arbitrary URLs. */
export class IpaClient {
  private readonly cache = new Map<string, { expires: number; value: Promise<Source> }>();

  constructor(private readonly fetcher: typeof fetch = fetch) {}

  private async action(action: 'package_show' | 'datastore_search', params: Record<string, string>) {
    const url = new URL(action, API_BASE);
    url.search = new URLSearchParams(params).toString();
    const response = await this.fetcher(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`Indice PA non disponibile (HTTP ${response.status}). Riprova più tardi.`);
    if (!response.body) throw new Error('Risposta vuota da Indice PA.');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > MAX_BYTES) throw new Error('Risposta IPA troppo grande per questo lookup.');
        chunks.push(chunk.value);
      }
    } finally {
      await reader.cancel();
    }
    const body = Buffer.concat(chunks).toString('utf8');
    const envelope = envelopeSchema.parse(JSON.parse(body));
    if (!envelope.success) throw new Error('Indice PA non ha completato la ricerca. Riprova più tardi.');
    return envelope.result;
  }

  private async source(kind: keyof typeof DATASETS): Promise<Source> {
    const cached = this.cache.get(kind);
    if (cached && cached.expires > Date.now()) return cached.value;
    const value = (async () => {
      const data = packageSchema.parse(await this.action('package_show', { id: DATASETS[kind] }));
      const resource = data.resources.find(item => item.datastore_active);
      if (!resource) throw new Error('Il dataset IPA non espone al momento una risorsa interrogabile.');
      return {
        attribution: 'AgID — Indice delle Pubbliche Amministrazioni (IPA)',
        dataset_url: `https://indicepa.gov.it/ipa-dati/dataset/${DATASETS[kind]}`,
        resource_id: resource.id,
        license: data.license_id ?? null,
        license_url: data.license_url ?? null,
        dataset_refreshed_at: resource.last_modified ?? data.metadata_modified ?? null,
      };
    })();
    const entry = { expires: Date.now() + CACHE_MS, value };
    this.cache.set(kind, entry);
    try {
      return await value;
    } catch (error) {
      if (this.cache.get(kind) === entry) this.cache.delete(kind);
      throw error;
    }
  }

  private async rows(source: Source, params: Record<string, string>) {
    return datastoreSchema.parse(await this.action('datastore_search', {
      resource_id: source.resource_id,
      ...params,
    }));
  }

  async search(query: string, limit: number, offset: number) {
    const source = await this.source('entities');
    const data = await this.rows(source, {
      q: JSON.stringify({ Denominazione_ente: query }),
      limit: String(limit), offset: String(offset), sort: 'Denominazione_ente asc, Codice_IPA asc',
    });
    return searchResultSchema.parse({
      query,
      retrieved_at: new Date().toISOString(),
      total: data.total,
      offset,
      next_offset: offset + data.records.length < data.total ? offset + data.records.length : null,
      entities: data.records.map(entity),
      source,
      notes: [
        'La ricerca testuale può includere enti omonimi o denominazioni simili: scegliere il codice IPA esatto.',
        'La data di refresh del dataset non certifica la freschezza di ciascun contatto: consultare record_updated_at.',
        'La sede di un ente non indica il territorio coperto dai suoi servizi.',
      ],
    });
  }

  async digitalOffice(ipaCode: string, limit: number, offset: number) {
    const [entitiesSource, officesSource] = await Promise.all([this.source('entities'), this.source('offices')]);
    const filter = JSON.stringify({ Codice_IPA: ipaCode });
    const [entitiesData, officesData] = await Promise.all([
      this.rows(entitiesSource, { filters: filter, limit: '1' }),
      this.rows(officesSource, { filters: filter, limit: String(limit), offset: String(offset), sort: 'Codice_uni_uo asc' }),
    ]);
    if ([...entitiesData.records, ...officesData.records].some(row => text(row, 'Codice_IPA') !== ipaCode)) {
      throw new Error('IPA ha restituito record che non corrispondono al codice richiesto. Non usare questi contatti.');
    }
    const row = entitiesData.records[0];
    const notes = [
      'IPA pubblica soltanto gli uffici per cui l’ente ha indicato il responsabile: l’assenza di risultati non dimostra l’assenza di un RTD.',
      'Un referente condiviso è un indizio da approfondire; questi record da soli non provano una gestione associata.',
      'La nomina RTD e un contatto pubblico non attribuiscono automaticamente il potere di concedere accesso a qualsiasi API.',
      'Usare record_updated_at per valutare ogni contatto; dataset_refreshed_at indica il refresh della fonte.',
    ];
    if (!row) notes.push('Codice IPA non trovato nel registro degli enti: ricercare di nuovo la denominazione prima di contattare qualcuno.');
    return officesResultSchema.parse({
      ipa_code: ipaCode,
      retrieved_at: new Date().toISOString(),
      entity_found: Boolean(row),
      entity: row ? entity(row) : null,
      total_offices: officesData.total,
      offset,
      next_offset: offset + officesData.records.length < officesData.total ? offset + officesData.records.length : null,
      offices: officesData.records.map(office),
      sources: { entities: entitiesSource, offices: officesSource },
      notes,
    });
  }
}
