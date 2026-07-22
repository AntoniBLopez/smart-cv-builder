import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CvStoreService } from '../../services/cv-store.service';
import { CvSection } from '../../models/cv.model';
import { PhotoCropperComponent } from '../photo-cropper/photo-cropper.component';

@Component({
  selector: 'app-editor-panel',
  standalone: true,
  imports: [FormsModule, PhotoCropperComponent],
  templateUrl: './editor-panel.component.html',
  styleUrl: './editor-panel.component.scss',
})
export class EditorPanelComponent {
  store = inject(CvStoreService);
  cv = this.store.cv;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  activeTab = 'personal';
  showCropper = false;
  cropperEvent: Event | null = null;
  cropperSource: string | null = null;

  tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'experience', label: 'Experiencia' },
    { id: 'education', label: 'Educación' },
    { id: 'skills', label: 'Skills' },
    { id: 'extra', label: 'Extra' },
  ];

  isSectionVisible(type: CvSection['type']): boolean {
    return this.cv().sections.find((s) => s.type === type)?.visible ?? true;
  }

  toggleSection(type: CvSection['type'], visible: boolean): void {
    const section = this.cv().sections.find((s) => s.type === type);
    if (!section) return;
    this.store.updateSection(section.id, { visible });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.cropperSource = null;
    this.cropperEvent = event;
    this.showCropper = true;
  }

  adjustCurrentPhoto(): void {
    const url = this.cv().personalInfo.photoUrl;
    if (!url) return;
    this.cropperEvent = null;
    this.cropperSource = url;
    this.showCropper = true;
  }

  onCropApplied(base64: string): void {
    this.store.updatePersonalInfo({ photoUrl: base64 });
    this.closeCropper();
  }

  closeCropper(): void {
    this.showCropper = false;
    this.cropperEvent = null;
    this.cropperSource = null;
    if (this.photoInput?.nativeElement) {
      this.photoInput.nativeElement.value = '';
    }
  }

  updateAchievement(expId: string, index: number, value: string, achievements: string[]): void {
    const updated = [...achievements];
    updated[index] = value;
    this.store.updateExperience(expId, { achievements: updated });
  }

  addAchievement(expId: string, achievements: string[]): void {
    this.store.updateExperience(expId, { achievements: [...achievements, ''] });
  }

  removeAchievement(expId: string, index: number, achievements: string[]): void {
    this.store.updateExperience(expId, { achievements: achievements.filter((_, i) => i !== index) });
  }

  moveAchievement(expId: string, index: number, direction: -1 | 1, achievements: string[]): void {
    const target = index + direction;
    if (target < 0 || target >= achievements.length) return;
    const updated = [...achievements];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    this.store.updateExperience(expId, { achievements: updated });
  }

  updateEduDescription(eduId: string, detailId: string, value: string): void {
    const edu = this.cv().education.find((e) => e.id === eduId);
    if (!edu) return;
    this.store.updateEducation(eduId, {
      description: edu.description.map((d) => (d.id === detailId ? { ...d, text: value } : d)),
    });
  }

  addEduDescription(eduId: string): void {
    const edu = this.cv().education.find((e) => e.id === eduId);
    if (!edu) return;
    this.store.updateEducation(eduId, {
      description: [...edu.description, { id: crypto.randomUUID(), text: '', visible: true }],
    });
  }

  removeEduDescription(eduId: string, detailId: string): void {
    const edu = this.cv().education.find((e) => e.id === eduId);
    if (!edu) return;
    this.store.updateEducation(eduId, {
      description: edu.description.filter((d) => d.id !== detailId),
    });
  }

  toggleEduDescription(eduId: string, detailId: string): void {
    const edu = this.cv().education.find((e) => e.id === eduId);
    if (!edu) return;
    this.store.updateEducation(eduId, {
      description: edu.description.map((d) =>
        d.id === detailId ? { ...d, visible: !d.visible } : d
      ),
    });
  }
}
