import { Component, ViewChild, OnInit, inject, signal } from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';
import { CvPreviewComponent } from '../cv-preview/cv-preview.component';
import { CustomizationPanelComponent } from '../customization-panel/customization-panel.component';
import { SectionsPanelComponent } from '../sections-panel/sections-panel.component';
import { AtsAnalyzeDialogComponent } from '../ats-analyze-dialog/ats-analyze-dialog.component';
import { CvStoreService } from '../../services/cv-store.service';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [
    ToolbarComponent,
    EditorPanelComponent,
    CvPreviewComponent,
    CustomizationPanelComponent,
    SectionsPanelComponent,
    AtsAnalyzeDialogComponent,
  ],
  templateUrl: './editor-page.component.html',
  styleUrl: './editor-page.component.scss',
})
export class EditorPageComponent implements OnInit {
  @ViewChild(CvPreviewComponent) preview!: CvPreviewComponent;

  private store = inject(CvStoreService);

  sidePanel: 'theme' | 'sections' | '' = '';
  loading = signal(true);
  showAtsDialog = signal(false);

  ready = this.store.ready;
  syncError = this.store.syncError;

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    await this.store.bootstrap();
    this.loading.set(false);
  }

  onPanelToggle(panel: string): void {
    if (panel === 'theme' || panel === 'sections') {
      this.sidePanel = this.sidePanel === panel ? '' : panel;
    } else {
      this.sidePanel = '';
    }
  }

  onDownload(): void {
    this.preview?.download();
  }

  openAtsDialog(): void {
    this.showAtsDialog.set(true);
  }

  closeAtsDialog(): void {
    this.showAtsDialog.set(false);
  }
}
