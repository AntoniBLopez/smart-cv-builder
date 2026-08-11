import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DiffTextComponent } from '../../components/diff-text/diff-text.component';
import { CvTemplateBase } from '../cv-template-base';

@Component({
  selector: 'app-template-modern',
  standalone: true,
  imports: [NgStyle, DiffTextComponent],
  templateUrl: './template-modern.component.html',
  styleUrl: './template-modern.component.scss',
})
export class TemplateModernComponent extends CvTemplateBase {}
