import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  computed,
  signal,
  effect,
  afterNextRender,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CvStoreService } from '../../services/cv-store.service';
import { ExportService } from '../../services/export.service';
import { TemplateProfessionalComponent } from '../../templates/template-professional/template-professional.component';
import { TemplateClassicComponent } from '../../templates/template-classic/template-classic.component';
import { TemplateModernComponent } from '../../templates/template-modern/template-modern.component';
import { TemplateCreativeComponent } from '../../templates/template-creative/template-creative.component';
import { TemplateExecutiveComponent } from '../../templates/template-executive/template-executive.component';
import { TemplatePrivateServiceComponent } from '../../templates/template-private-service/template-private-service.component';

/** A4 at 96dpi — matches template width/min-height (794×1123) */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

@Component({
  selector: 'app-cv-preview',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    TemplateProfessionalComponent,
    TemplateClassicComponent,
    TemplateModernComponent,
    TemplateCreativeComponent,
    TemplateExecutiveComponent,
    TemplatePrivateServiceComponent,
  ],
  templateUrl: './cv-preview.component.html',
  styleUrl: './cv-preview.component.scss',
})
export class CvPreviewComponent {
  private store = inject(CvStoreService);
  private exportService = inject(ExportService);

  @ViewChild('cvElement') cvElement!: ElementRef<HTMLElement>;
  @ViewChild('measureHost') measureHost!: ElementRef<HTMLElement>;

  readonly pageHeight = A4_HEIGHT_PX;
  readonly pageWidth = A4_WIDTH_PX;

  cv = this.store.cv;
  templateId = computed(() => this.cv().templateId);

  private readonly contentHeight = signal(A4_HEIGHT_PX);

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.contentHeight() / A4_HEIGHT_PX))
  );

  readonly pageIndexes = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i)
  );

  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      // Re-measure when CV data or template changes
      this.cv();
      this.templateId();
      queueMicrotask(() => this.measureContent());
    });

    afterNextRender(() => {
      this.measureContent();
      const host = this.measureHost?.nativeElement;
      if (!host || typeof ResizeObserver === 'undefined') return;
      this.resizeObserver = new ResizeObserver(() => this.measureContent());
      this.resizeObserver.observe(host);
    });
  }

  private measureContent(): void {
    const host = this.measureHost?.nativeElement;
    if (!host) return;
    const page = host.querySelector('.cv-page') as HTMLElement | null;
    const height = Math.max(page?.scrollHeight ?? 0, page?.offsetHeight ?? 0, A4_HEIGHT_PX);
    this.contentHeight.set(height);
  }

  async download(): Promise<void> {
    const el = this.cvElement?.nativeElement;
    if (!el) return;
    const name =
      this.cv().name?.replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') ||
      this.cv().personalInfo.fullName.replace(/\s+/g, '_') ||
      'CV';
    await this.exportService.downloadPdf(el, name);
  }

  /** 0 = closed, 1 = first warning, 2 = final confirmation */
  readonly resetStep = signal(0);

  openResetDialog(): void {
    this.resetStep.set(1);
  }

  closeResetDialog(): void {
    this.resetStep.set(0);
  }

  goToResetStep2(): void {
    this.resetStep.set(2);
  }

  performReset(): void {
    this.store.reset();
    this.closeResetDialog();
  }

  onResetBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('reset-backdrop')) {
      this.closeResetDialog();
    }
  }
}
