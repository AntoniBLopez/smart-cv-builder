import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtsAiService, AtsAnalysis } from '../../services/ats-ai.service';
import { CvStoreService } from '../../services/cv-store.service';

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
  imports: [FormsModule],
  templateUrl: './ats-analyze-dialog.component.html',
  styleUrl: './ats-analyze-dialog.component.scss',
})
export class AtsAnalyzeDialogComponent {
  private ai = inject(AtsAiService);
  private store = inject(CvStoreService);

  closed = output<void>();

  jobDescription = '';
  companyUrl = '';
  loading = signal(false);
  error = signal('');
  analysis = signal<AtsAnalysis | null>(null);
  metaLabel = signal('');

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
    const jd = this.jobDescription.trim();
    if (jd.length < 40) {
      this.error.set('Pega la Job Description completa (mín. ~40 caracteres).');
      return;
    }

    this.loading.set(true);
    try {
      const res = await this.ai.analyze({
        cv: this.store.cv(),
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
}
