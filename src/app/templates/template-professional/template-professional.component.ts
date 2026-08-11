import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { CvSection, EducationEntry } from '../../models/cv.model';
import { DiffTextComponent } from '../../components/diff-text/diff-text.component';
import { CvTemplateBase } from '../cv-template-base';

@Component({
  selector: 'app-template-professional',
  standalone: true,
  imports: [NgStyle, DiffTextComponent],
  templateUrl: './template-professional.component.html',
  styleUrl: './template-professional.component.scss',
})
export class TemplateProfessionalComponent extends CvTemplateBase {
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
