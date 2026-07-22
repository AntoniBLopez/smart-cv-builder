import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { CvData, CvSection } from '../../models/cv.model';
import { getThemeStyles, formatDateRange, photoBorderRadius } from '../../utils/theme.utils';

@Component({
  selector: 'app-template-creative',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './template-creative.component.html',
  styleUrl: './template-creative.component.scss',
})
export class TemplateCreativeComponent {
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

  get orderedSections(): CvSection[] {
    return [...this.cv.sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  }
}
