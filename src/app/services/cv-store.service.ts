import { Injectable, signal, computed, inject } from '@angular/core';
import {
  CvData,
  CvLibrary,
  CvTheme,
  TemplateId,
  ExperienceEntry,
  EducationEntry,
  Language,
  Interest,
  CvSection,
  createDefaultCv,
  createPrivateServiceCv,
  createId,
  cloneCv,
  normalizeCv,
} from '../models/cv.model';
import { CvApiService } from './cv-api.service';
import { AuthService } from './auth.service';

const LOCAL_LIBRARY_KEY = 'cv-builder-library-v1';
const LOCAL_LEGACY_KEYS = [
  'cv-builder-library-v1',
  'cv-builder-data-v16',
  'cv-builder-data-v15',
  'cv-builder-data-v14',
  'cv-builder-data-v13',
  'cv-builder-data-v12',
  'cv-builder-data-v11',
  'cv-builder-data-v10',
  'cv-builder-data-v9',
  'cv-builder-data-v8',
  'cv-builder-data-v7',
  'cv-builder-data-v6',
  'cv-builder-data-v5',
  'cv-builder-data-v4',
  'cv-builder-data-v3',
  'cv-builder-data-v2',
  'cv-builder-data',
];

@Injectable({ providedIn: 'root' })
export class CvStoreService {
  private api = inject(CvApiService);
  private auth = inject(AuthService);

  private readonly librarySignal = signal<CvLibrary>({
    activeId: '',
    documents: [],
  });
  private readonly readySignal = signal(false);
  private readonly syncErrorSignal = signal('');
  /** Debounced save timers per document id */
  private readonly saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  /** Document ids currently flushing to the API */
  private readonly savingIds = new Set<string>();
  /** Dirty again while a save was in flight — flush once more when done */
  private readonly resaveIds = new Set<string>();
  private bootPromise: Promise<void> | null = null;

  readonly documents = computed(() => this.librarySignal().documents);
  readonly activeId = computed(() => this.librarySignal().activeId);
  readonly ready = this.readySignal.asReadonly();
  readonly syncError = this.syncErrorSignal.asReadonly();
  readonly cv = computed(() => {
    const lib = this.librarySignal();
    return (
      lib.documents.find((d) => d.id === lib.activeId) ??
      lib.documents[0] ??
      createDefaultCv('Mi CV')
    );
  });
  readonly theme = computed(() => this.cv().theme);
  readonly templateId = computed(() => this.cv().templateId);

  async bootstrap(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.readySignal.set(false);
      return;
    }
    if (this.bootPromise) return this.bootPromise;

    this.bootPromise = (async () => {
      this.readySignal.set(false);
      this.syncErrorSignal.set('');
      try {
        let docs = (await this.api.list()).map((d) => normalizeCv(d));
        docs = await this.migrateLocalCvsIfNeeded(docs);

        if (!docs.length) {
          const created = await this.api.create(createDefaultCv('Mi CV'));
          docs = [normalizeCv(created)];
        }
        this.librarySignal.set({
          activeId: docs[0].id,
          documents: docs,
        });
        this.readySignal.set(true);
      } catch (error) {
        console.error(error);
        const status = (error as { status?: number })?.status;
        const msg =
          status === 0 || status === undefined
            ? 'No se pudo conectar con la API (¿está corriendo en :3000?). Usa `pnpm run start:api`.'
            : status === 401
              ? 'Sesión expirada. Vuelve a iniciar sesión.'
              : 'No se pudieron cargar tus CVs desde el servidor';
        this.syncErrorSignal.set(msg);
        this.readySignal.set(true);
      } finally {
        this.bootPromise = null;
      }
    })();

    return this.bootPromise;
  }

  /** One-shot: upload pre-MongoDB localStorage CVs, then wipe local copies. */
  private async migrateLocalCvsIfNeeded(remoteDocs: CvData[]): Promise<CvData[]> {
    const localDocs = this.readLocalCvs();
    if (!localDocs.length) return remoteDocs;

    try {
      for (const doc of localDocs) {
        await this.api.create(doc);
      }

      // Drop the auto-created placeholder from first login after MongoDB.
      const stockIds = remoteDocs
        .filter((d) => (d.name || '').trim() === 'Mi CV')
        .map((d) => d.id);
      for (const id of stockIds) {
        try {
          await this.api.remove(id);
        } catch {
          /* keep going */
        }
      }

      this.clearLocalCvStorage();
      return (await this.api.list()).map((d) => normalizeCv(d));
    } catch (error) {
      console.error('Local CV migration failed', error);
      this.syncErrorSignal.set(
        'No se pudieron migrar los CVs locales. Recarga e inténtalo de nuevo.'
      );
      return remoteDocs;
    }
  }

  private readLocalCvs(): CvData[] {
    for (const key of LOCAL_LEGACY_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as CvLibrary | Partial<CvData>;
        if (
          parsed &&
          typeof parsed === 'object' &&
          'documents' in parsed &&
          Array.isArray(parsed.documents) &&
          parsed.documents.length
        ) {
          return parsed.documents.map((d) => normalizeCv(d));
        }
        if (parsed && typeof parsed === 'object' && 'personalInfo' in parsed) {
          return [normalizeCv(parsed as Partial<CvData>)];
        }
      } catch {
        /* try next key */
      }
    }
    return [];
  }

  private clearLocalCvStorage(): void {
    for (const key of LOCAL_LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem(LOCAL_LIBRARY_KEY);
  }

  private setLibrary(library: CvLibrary): void {
    this.librarySignal.set(library);
  }

  private scheduleSave(id: string): void {
    const prev = this.saveTimers.get(id);
    if (prev) clearTimeout(prev);
    // Wait until typing pauses so in-flight saves don't race with the caret.
    this.saveTimers.set(
      id,
      setTimeout(() => {
        this.saveTimers.delete(id);
        void this.persistDocument(id);
      }, 900)
    );
  }

  /**
   * Persist local → API. Local state is the source of truth while editing:
   * never replace the open document with the server response (that was
   * overwriting keystrokes mid-type via one-way ngModel bindings).
   */
  private async persistDocument(id: string): Promise<void> {
    if (this.savingIds.has(id)) {
      this.resaveIds.add(id);
      return;
    }

    const doc = this.librarySignal().documents.find((d) => d.id === id);
    if (!doc) return;

    this.savingIds.add(id);
    this.resaveIds.delete(id);

    try {
      await this.api.update(id, doc);
      this.syncErrorSignal.set('');
    } catch (error) {
      console.error(error);
      this.syncErrorSignal.set('Error al guardar en MongoDB');
    } finally {
      this.savingIds.delete(id);
      if (this.resaveIds.has(id)) {
        this.resaveIds.delete(id);
        // Latest local snapshot after edits that landed during the request.
        void this.persistDocument(id);
      }
    }
  }

  private update(updater: (current: CvData) => CvData): void {
    const lib = this.librarySignal();
    if (!lib.activeId) return;
    const documents = lib.documents.map((doc) => {
      if (doc.id !== lib.activeId) return doc;
      const next = updater(doc);
      return { ...next, updatedAt: new Date().toISOString() };
    });
    this.setLibrary({ ...lib, documents });
    this.scheduleSave(lib.activeId);
  }

  selectDocument(id: string): void {
    const lib = this.librarySignal();
    if (!lib.documents.some((d) => d.id === id) || lib.activeId === id) return;
    this.setLibrary({ ...lib, activeId: id });
  }

  async duplicateActive(name?: string): Promise<CvData | null> {
    const current = this.cv();
    try {
      const created = normalizeCv(await this.api.duplicate(current.id, name));
      const lib = this.librarySignal();
      this.setLibrary({
        activeId: created.id,
        documents: [created, ...lib.documents],
      });
      return created;
    } catch (error) {
      console.error(error);
      // Fallback: local clone then create remotely
      const copy = cloneCv(current, name);
      try {
        const created = normalizeCv(await this.api.create(copy));
        const lib = this.librarySignal();
        this.setLibrary({
          activeId: created.id,
          documents: [created, ...lib.documents],
        });
        return created;
      } catch (err) {
        console.error(err);
        this.syncErrorSignal.set('No se pudo crear la copia en MongoDB');
        return null;
      }
    }
  }

  /** Creates a new CV from a preset (e.g. private chauffeur) and makes it active. */
  async createFromPreset(
    preset: 'default' | 'private-service',
    name?: string
  ): Promise<CvData | null> {
    const draft =
      preset === 'private-service'
        ? createPrivateServiceCv(name || 'CV Chófer personal')
        : createDefaultCv(name || 'Mi CV');
    try {
      const created = normalizeCv(await this.api.create(draft));
      const lib = this.librarySignal();
      this.setLibrary({
        activeId: created.id,
        documents: [created, ...lib.documents],
      });
      return created;
    } catch (error) {
      console.error(error);
      this.syncErrorSignal.set('No se pudo crear el CV en MongoDB');
      return null;
    }
  }

  /** Creates a new CV document from adapted ATS content and makes it active. */
  async createFromAdapted(adapted: CvData, name?: string): Promise<CvData | null> {
    const draft = cloneCv(adapted, name);
    try {
      const created = normalizeCv(await this.api.create(draft));
      const lib = this.librarySignal();
      this.setLibrary({
        activeId: created.id,
        documents: [created, ...lib.documents],
      });
      return created;
    } catch (error) {
      console.error(error);
      this.syncErrorSignal.set('No se pudo crear el CV adaptado en MongoDB');
      return null;
    }
  }

  renameActive(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.update((cv) => ({ ...cv, name: trimmed }));
  }

  renameDocument(id: string, name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lib = this.librarySignal();
    this.setLibrary({
      ...lib,
      documents: lib.documents.map((d) =>
        d.id === id ? { ...d, name: trimmed, updatedAt: new Date().toISOString() } : d
      ),
    });
    this.scheduleSave(id);
  }

  async deleteDocument(id: string): Promise<void> {
    const lib = this.librarySignal();
    if (lib.documents.length <= 1) return;
    try {
      await this.api.remove(id);
      const documents = lib.documents.filter((d) => d.id !== id);
      const activeId = lib.activeId === id ? documents[0].id : lib.activeId;
      this.setLibrary({ activeId, documents });
    } catch (error) {
      console.error(error);
      this.syncErrorSignal.set('No se pudo eliminar el CV');
    }
  }

  reset(): void {
    const current = this.cv();
    const fresh =
      current.templateId === 'private-service'
        ? createPrivateServiceCv(current.name || 'CV Chófer personal')
        : createDefaultCv(current.name || 'Mi CV');
    const lib = this.librarySignal();
    const currentId = lib.activeId;
    const replaced = { ...fresh, id: currentId };
    this.setLibrary({
      activeId: currentId,
      documents: lib.documents.map((d) => (d.id === currentId ? replaced : d)),
    });
    this.scheduleSave(currentId);
  }

  setTemplate(templateId: TemplateId): void {
    this.update((cv) => ({ ...cv, templateId }));
  }

  updateTheme(partial: Partial<CvTheme>): void {
    this.update((cv) => ({ ...cv, theme: { ...cv.theme, ...partial } }));
  }

  updatePersonalInfo(partial: Partial<CvData['personalInfo']>): void {
    this.update((cv) => ({ ...cv, personalInfo: { ...cv.personalInfo, ...partial } }));
  }

  updateContact(partial: Partial<Omit<CvData['contact'], 'visibility'>>): void {
    this.update((cv) => ({ ...cv, contact: { ...cv.contact, ...partial } }));
  }

  toggleContactVisibility(field: keyof CvData['contact']['visibility']): void {
    this.update((cv) => ({
      ...cv,
      contact: {
        ...cv.contact,
        visibility: {
          ...cv.contact.visibility,
          [field]: !cv.contact.visibility[field],
        },
      },
    }));
  }

  updateOtherInfo(items: string[]): void {
    this.update((cv) => ({ ...cv, otherInfo: items }));
  }

  addOtherInfo(text = ''): void {
    this.update((cv) => ({ ...cv, otherInfo: [...cv.otherInfo, text] }));
  }

  updateOtherInfoItem(index: number, text: string): void {
    this.update((cv) => {
      const otherInfo = [...cv.otherInfo];
      otherInfo[index] = text;
      return { ...cv, otherInfo };
    });
  }

  removeOtherInfo(index: number): void {
    this.update((cv) => ({
      ...cv,
      otherInfo: cv.otherInfo.filter((_, i) => i !== index),
    }));
  }

  updateSection(sectionId: string, partial: Partial<CvSection>): void {
    this.update((cv) => ({
      ...cv,
      sections: cv.sections.map((s) => (s.id === sectionId ? { ...s, ...partial } : s)),
    }));
  }

  reorderSections(orderedIds: string[]): void {
    this.update((cv) => ({
      ...cv,
      sections: orderedIds.map((id, index) => {
        const section = cv.sections.find((s) => s.id === id)!;
        return { ...section, order: index };
      }),
    }));
  }

  addExperience(): void {
    const entry: ExperienceEntry = {
      id: createId(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      achievements: [''],
    };
    this.update((cv) => ({ ...cv, experience: [...cv.experience, entry] }));
  }

  updateExperience(id: string, partial: Partial<ExperienceEntry>): void {
    this.update((cv) => ({
      ...cv,
      experience: cv.experience.map((e) => (e.id === id ? { ...e, ...partial } : e)),
    }));
  }

  removeExperience(id: string): void {
    this.update((cv) => ({ ...cv, experience: cv.experience.filter((e) => e.id !== id) }));
  }

  addEducation(): void {
    const entry: EducationEntry = {
      id: createId(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      description: [{ id: createId(), text: '', visible: true }],
    };
    this.update((cv) => ({ ...cv, education: [...cv.education, entry] }));
  }

  updateEducation(id: string, partial: Partial<EducationEntry>): void {
    this.update((cv) => ({
      ...cv,
      education: cv.education.map((e) => (e.id === id ? { ...e, ...partial } : e)),
    }));
  }

  removeEducation(id: string): void {
    this.update((cv) => ({ ...cv, education: cv.education.filter((e) => e.id !== id) }));
  }

  addSkill(name = ''): void {
    this.update((cv) => ({ ...cv, skills: [...cv.skills, { id: createId(), name }] }));
  }

  updateSkill(id: string, name: string): void {
    this.update((cv) => ({
      ...cv,
      skills: cv.skills.map((s) => (s.id === id ? { ...s, name } : s)),
    }));
  }

  removeSkill(id: string): void {
    this.update((cv) => ({ ...cv, skills: cv.skills.filter((s) => s.id !== id) }));
  }

  moveSkill(id: string, direction: -1 | 1): void {
    this.update((cv) => {
      const skills = [...cv.skills];
      const index = skills.findIndex((s) => s.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= skills.length) return cv;
      [skills[index], skills[target]] = [skills[target], skills[index]];
      return { ...cv, skills };
    });
  }

  addLanguage(): void {
    this.update((cv) => ({
      ...cv,
      languages: [...cv.languages, { id: createId(), name: '', level: '' }],
    }));
  }

  updateLanguage(id: string, partial: Partial<Language>): void {
    this.update((cv) => ({
      ...cv,
      languages: cv.languages.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    }));
  }

  removeLanguage(id: string): void {
    this.update((cv) => ({ ...cv, languages: cv.languages.filter((l) => l.id !== id) }));
  }

  addInterest(name = ''): void {
    this.update((cv) => ({ ...cv, interests: [...cv.interests, { id: createId(), name }] }));
  }

  updateInterest(id: string, name: string): void {
    this.update((cv) => ({
      ...cv,
      interests: cv.interests.map((i) => (i.id === id ? { ...i, name } : i)),
    }));
  }

  removeInterest(id: string): void {
    this.update((cv) => ({ ...cv, interests: cv.interests.filter((i) => i.id !== id) }));
  }
}
