import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DiffTextComponent } from '../../components/diff-text/diff-text.component';
import { CvTemplateBase } from '../cv-template-base';

@Component({
  selector: 'app-template-creative',
  standalone: true,
  imports: [NgStyle, DiffTextComponent],
  templateUrl: './template-creative.component.html',
  styleUrl: './template-creative.component.scss',
})
export class TemplateCreativeComponent extends CvTemplateBase {}
