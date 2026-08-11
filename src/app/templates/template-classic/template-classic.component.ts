import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DiffTextComponent } from '../../components/diff-text/diff-text.component';
import { CvTemplateBase } from '../cv-template-base';

@Component({
  selector: 'app-template-classic',
  standalone: true,
  imports: [NgStyle, DiffTextComponent],
  templateUrl: './template-classic.component.html',
  styleUrl: './template-classic.component.scss',
})
export class TemplateClassicComponent extends CvTemplateBase {}
