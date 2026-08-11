import { Component, Input } from '@angular/core';
import { CvData } from '../../models/cv.model';
import { TemplateProfessionalComponent } from '../../templates/template-professional/template-professional.component';
import { TemplateClassicComponent } from '../../templates/template-classic/template-classic.component';
import { TemplateModernComponent } from '../../templates/template-modern/template-modern.component';
import { TemplateCreativeComponent } from '../../templates/template-creative/template-creative.component';
import { TemplateExecutiveComponent } from '../../templates/template-executive/template-executive.component';
import { TemplatePrivateServiceComponent } from '../../templates/template-private-service/template-private-service.component';

/** Renders a CV with the selected template; optional originalCv enables ATS diff highlights. */
@Component({
  selector: 'app-ats-cv-frame',
  standalone: true,
  imports: [
    TemplateProfessionalComponent,
    TemplateClassicComponent,
    TemplateModernComponent,
    TemplateCreativeComponent,
    TemplateExecutiveComponent,
    TemplatePrivateServiceComponent,
  ],
  template: `
    @switch (cv.templateId) {
      @case ('professional') {
        <app-template-professional [cv]="cv" [originalCv]="originalCv" />
      }
      @case ('classic') {
        <app-template-classic [cv]="cv" [originalCv]="originalCv" />
      }
      @case ('modern') {
        <app-template-modern [cv]="cv" [originalCv]="originalCv" />
      }
      @case ('creative') {
        <app-template-creative [cv]="cv" [originalCv]="originalCv" />
      }
      @case ('executive') {
        <app-template-executive [cv]="cv" [originalCv]="originalCv" />
      }
      @case ('private-service') {
        <app-template-private-service [cv]="cv" [originalCv]="originalCv" />
      }
    }
  `,
})
export class AtsCvFrameComponent {
  @Input({ required: true }) cv!: CvData;
  @Input() originalCv: CvData | null = null;
}
