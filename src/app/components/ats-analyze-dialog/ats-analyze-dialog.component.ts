import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtsAiService, AtsAnalysis } from '../../services/ats-ai.service';
import { CvStoreService } from '../../services/cv-store.service';
import { ExportService } from '../../services/export.service';
import { CvData, normalizeCv } from '../../models/cv.model';
import { AtsCvFrameComponent } from '../ats-cv-frame/ats-cv-frame.component';

function normalizeAtsAnalysis(raw: Partial<AtsAnalysis> | null | undefined): AtsAnalysis {
  return {
    matchScore: Number(raw?.matchScore ?? 0),
    company: {
      name: raw?.company?.name || '',
      sector: raw?.company?.sector || '',
      summary: raw?.company?.summary || '',
      needs: Array.isArray(raw?.company?.needs) ? raw!.company!.needs : [],
    },
    keywords: {
      requiredFromJd: raw?.keywords?.requiredFromJd ?? [],
      presentInCv: raw?.keywords?.presentInCv ?? [],
      missingFromCv: raw?.keywords?.missingFromCv ?? [],
      suggestedAdditions: raw?.keywords?.suggestedAdditions ?? [],
    },
    atsChecks: {
      strengths: raw?.atsChecks?.strengths ?? [],
      risks: raw?.atsChecks?.risks ?? [],
    },
    advice: Array.isArray(raw?.advice) ? raw!.advice! : [],
    priorityFixes: Array.isArray(raw?.priorityFixes) ? raw!.priorityFixes! : [],
  };
}

@Component({
  selector: 'app-ats-analyze-dialog',
  standalone: true,
  imports: [FormsModule, AtsCvFrameComponent],
  templateUrl: './ats-analyze-dialog.component.html',
  styleUrl: './ats-analyze-dialog.component.scss',
})
export class AtsAnalyzeDialogComponent {
  private ai = inject(AtsAiService);
  private store = inject(CvStoreService);
  private exportService = inject(ExportService);

  @ViewChild('exportHost') exportHost?: ElementRef<HTMLElement>;

  closed = output<void>();

  jobDescription = '';
  companyUrl = '';
  loading = signal(false);
  adapting = signal(false);
  savingCopy = signal(false);
  error = signal('');
  analysis = signal<AtsAnalysis | null>(null);
  metaLabel = signal('');
  /** Snapshot of the CV used for the analysis (for diff). */
  originalCv = signal<CvData | null>(null);
  adaptedCv = signal<CvData | null>(null);
  adaptMeta = signal('');

  close(): void {
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ats-backdrop')) {
      this.close();
    }
  }

  async analyze(): Promise<void> {
    this.error.set('');
    this.analysis.set(null);
    this.adaptedCv.set(null);
    this.originalCv.set(null);
    const jd = this.jobDescription.trim();
    if (jd.length < 40) {
      this.error.set('Pega la Job Description completa (mín. ~40 caracteres).');
      return;
    }

    this.loading.set(true);
    try {
      const cv = this.store.cv();
      this.originalCv.set(structuredClone(cv));
      const res = await this.ai.analyze({
        cv,
        jobDescription: jd,
        companyUrl: this.companyUrl.trim() || undefined,
      });
      this.analysis.set(normalizeAtsAnalysis(res.analysis));
      this.metaLabel.set(
        `${res.meta.used.provider} · ${res.meta.used.model}` +
          (res.meta.research.pagesFetched
            ? ` · ${res.meta.research.pagesFetched} página(s) de empresa`
            : '')
      );
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ||
        'No se pudo completar el análisis ATS';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  async generateAdaptedPreview(): Promise<void> {
    this.error.set('');
    const jd = this.jobDescription.trim();
    if (jd.length < 40) {
      this.error.set('Pega la Job Description completa (mín. ~40 caracteres).');
      return;
    }

    this.adapting.set(true);
    try {
      const cv = this.originalCv() ?? this.store.cv();
      if (!this.originalCv()) {
        this.originalCv.set(structuredClone(cv));
      }
      const res = await this.ai.adapt({
        cv,
        jobDescription: jd,
        companyUrl: this.companyUrl.trim() || undefined,
        analysis: this.analysis(),
      });
      this.adaptedCv.set(normalizeCv(res.adaptedCv));
      this.adaptMeta.set(`${res.meta.used.provider} · ${res.meta.used.model}`);
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ||
        'No se pudo generar el CV adaptado';
      this.error.set(message);
    } finally {
      this.adapting.set(false);
    }
  }

  async createAdaptedCopy(): Promise<void> {
    const adapted = this.adaptedCv();
    if (!adapted) return;
    const base = adapted.name || this.store.cv().name || 'Mi CV';
    const suggested = `${base} (ATS)`;
    const name = prompt('Nombre del nuevo CV adaptado:', suggested);
    if (name === null) return;

    this.savingCopy.set(true);
    this.error.set('');
    try {
      const created = await this.store.createFromAdapted(adapted, name.trim() || suggested);
      if (!created) {
        this.error.set('No se pudo crear la copia del CV adaptado.');
        return;
      }
      this.close();
    } finally {
      this.savingCopy.set(false);
    }
  }

  async downloadAdapted(): Promise<void> {
    const adapted = this.adaptedCv();
    const el = this.exportHost?.nativeElement;
    if (!adapted || !el) return;

    const name =
      adapted.name?.replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') ||
      adapted.personalInfo.fullName.replace(/\s+/g, '_') ||
      'CV_ATS';
    await this.exportService.downloadPdf(el, `${name}_ATS`, { atsOnly: true });
  }
}
