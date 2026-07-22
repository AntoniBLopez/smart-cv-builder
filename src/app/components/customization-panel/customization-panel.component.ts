import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CvStoreService } from '../../services/cv-store.service';
import { FONT_OPTIONS, PhotoShape } from '../../models/cv.model';

@Component({
  selector: 'app-customization-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customization-panel.component.html',
  styleUrl: './customization-panel.component.scss',
})
export class CustomizationPanelComponent {
  private store = inject(CvStoreService);

  theme = this.store.theme;
  fonts = FONT_OPTIONS;
  photoShapes: { value: PhotoShape; label: string }[] = [
    { value: 'circle', label: 'Circular' },
    { value: 'rounded', label: 'Redondeada' },
    { value: 'square', label: 'Cuadrada' },
  ];

  colorPresets = [
    { name: 'Azul', primary: '#5D9CEC', secondary: '#4A89DC', accent: '#E8F2FF' },
    { name: 'Verde', primary: '#2ECC71', secondary: '#27AE60', accent: '#E8F8F0' },
    { name: 'Morado', primary: '#9B59B6', secondary: '#8E44AD', accent: '#F3E8F8' },
    { name: 'Rojo', primary: '#E74C3C', secondary: '#C0392B', accent: '#FDEDEC' },
    { name: 'Naranja', primary: '#F39C12', secondary: '#E67E22', accent: '#FEF5E7' },
    { name: 'Teal', primary: '#1ABC9C', secondary: '#16A085', accent: '#E8F8F5' },
    { name: 'Oscuro', primary: '#34495E', secondary: '#2C3E50', accent: '#ECF0F1' },
    { name: 'Rosa', primary: '#E91E63', secondary: '#C2185B', accent: '#FCE4EC' },
  ];

  updateTheme(field: string, value: string | number | boolean): void {
    this.store.updateTheme({ [field]: value });
  }

  applyPreset(preset: (typeof this.colorPresets)[number]): void {
    this.store.updateTheme({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  }
}
