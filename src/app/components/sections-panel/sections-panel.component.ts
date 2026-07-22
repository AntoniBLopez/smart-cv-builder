import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CvStoreService } from '../../services/cv-store.service';

@Component({
  selector: 'app-sections-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sections-panel.component.html',
  styleUrl: './sections-panel.component.scss',
})
export class SectionsPanelComponent {
  private store = inject(CvStoreService);
  cv = this.store.cv;

  toggleVisibility(sectionId: string, visible: boolean): void {
    this.store.updateSection(sectionId, { visible });
  }

  moveUp(index: number): void {
    const sections = [...this.cv().sections].sort((a, b) => a.order - b.order);
    if (index <= 0) return;
    [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
    this.store.reorderSections(sections.map((s) => s.id));
  }

  moveDown(index: number): void {
    const sections = [...this.cv().sections].sort((a, b) => a.order - b.order);
    if (index >= sections.length - 1) return;
    [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    this.store.reorderSections(sections.map((s) => s.id));
  }

  get sortedSections() {
    return [...this.cv().sections].sort((a, b) => a.order - b.order);
  }
}
