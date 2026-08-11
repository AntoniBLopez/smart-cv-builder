import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DiffTextComponent } from '../../components/diff-text/diff-text.component';
import { CvTemplateBase } from '../cv-template-base';

@Component({
  selector: 'app-template-executive',
  standalone: true,
  imports: [NgStyle, DiffTextComponent],
  templateUrl: './template-executive.component.html',
  styleUrl: './template-executive.component.scss',
})
export class TemplateExecutiveComponent extends CvTemplateBase {}
