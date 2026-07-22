import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { CvData, CvSection, EducationEntry } from '../../models/cv.model';
import { getThemeStyles, formatDateRange, photoBorderRadius } from '../../utils/theme.utils';

@Component({
  selector: 'app-template-professional',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './template-professional.component.html',
  styleUrl: './template-professional.component.scss',
})
export class TemplateProfessionalComponent {
  @Input({ required: true }) cv!: CvData;

  get styles() {
    return getThemeStyles(this.cv.theme);
  }

  get photoRadius() {
    return photoBorderRadius(this.cv.theme.photoShape);
  }

  formatDateRange = formatDateRange;

  isVisible(type: CvSection['type']): boolean {
    return this.cv.sections.find((s) => s.type === type)?.visible ?? true;
  }

  hasVisibleDetails(edu: EducationEntry): boolean {
    return edu.description.some((d) => d.visible && !!d.text);
  }

  get orderedMainSections(): CvSection['type'][] {
    return this.cv.sections
      .filter((s) => ['summary', 'experience', 'education', 'other'].includes(s.type) && s.visible)
      .sort((a, b) => a.order - b.order)
      .map((s) => s.type);
  }
}
