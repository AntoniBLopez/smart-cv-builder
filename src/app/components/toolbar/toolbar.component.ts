import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CvStoreService } from '../../services/cv-store.service';
import { AuthService } from '../../services/auth.service';
import { TEMPLATES } from '../../models/cv.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  store = inject(CvStoreService);
  auth = inject(AuthService);

  templates = TEMPLATES;
  currentTemplate = this.store.templateId;
  documents = this.store.documents;
  activeId = this.store.activeId;
  cv = this.store.cv;
  user = this.auth.user;

  downloadClicked = output<void>();
  panelToggled = output<string>();
  atsAnalyzeClicked = output<void>();

  activePanel = '';
  editingId: string | null = null;
  draftName = '';

  selectTemplate(id: (typeof TEMPLATES)[number]['id']): void {
    this.store.setTemplate(id);
  }

  togglePanel(panel: string): void {
    this.activePanel = this.activePanel === panel ? '' : panel;
    this.panelToggled.emit(
      this.activePanel === 'theme' || this.activePanel === 'sections' ? this.activePanel : ''
    );
    if (this.activePanel !== 'documents') {
      this.editingId = null;
    }
  }

  openDocuments(): void {
    this.togglePanel('documents');
  }

  selectDocument(id: string): void {
    this.store.selectDocument(id);
    this.activePanel = '';
    this.editingId = null;
  }

  async createCopy(): Promise<void> {
    const base = this.cv().name || 'Mi CV';
    const suggested = `${base} (copia)`;
    const name = prompt('Nombre del nuevo CV (copia del actual):', suggested);
    if (name === null) return;
    await this.store.duplicateActive(name.trim() || suggested);
    this.activePanel = '';
  }

  startRenameFor(id: string, currentName: string): void {
    this.editingId = id;
    this.draftName = currentName;
  }

  saveRename(): void {
    if (!this.editingId) return;
    this.store.renameDocument(this.editingId, this.draftName);
    this.editingId = null;
  }

  cancelRename(): void {
    this.editingId = null;
  }

  async deleteDocument(id: string, name: string, event: Event): Promise<void> {
    event.stopPropagation();
    if (this.documents().length <= 1) return;
    if (!confirm(`¿Eliminar el CV "${name}"?`)) return;
    await this.store.deleteDocument(id);
  }

  onDownload(): void {
    this.downloadClicked.emit();
  }

  onAtsAnalyze(): void {
    this.activePanel = '';
    this.atsAnalyzeClicked.emit();
  }

  logout(): void {
    this.auth.logout();
  }
}
