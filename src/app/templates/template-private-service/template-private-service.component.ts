import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DiffTextComponent } from '../../components/diff-text/diff-text.component';
import { CvTemplateBase } from '../cv-template-base';

@Component({
  selector: 'app-template-private-service',
  standalone: true,
  imports: [NgStyle, DiffTextComponent],
  templateUrl: './template-private-service.component.html',
  styleUrl: './template-private-service.component.scss',
})
export class TemplatePrivateServiceComponent extends CvTemplateBase {}
