import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';
import { PhotoShape } from '../../models/cv.model';

@Component({
  selector: 'app-photo-cropper',
  standalone: true,
  imports: [FormsModule, ImageCropperComponent],
  templateUrl: './photo-cropper.component.html',
  styleUrl: './photo-cropper.component.scss',
})
export class PhotoCropperComponent {
  @Input() imageChangedEvent: Event | null = null;
  @Input() imageSource: string | null = null;
  @Input() photoShape: PhotoShape = 'circle';
  @Output() cropped = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  croppedImage = '';
  scale = 1;
  transform: ImageTransform = { scale: 1 };

  get roundCropper(): boolean {
    return this.photoShape === 'circle';
  }

  get imageBase64(): string | undefined {
    return this.imageSource?.startsWith('data:') ? this.imageSource : undefined;
  }

  get imageURL(): string | undefined {
    return this.imageSource && !this.imageSource.startsWith('data:')
      ? this.imageSource
      : undefined;
  }

  get zoomPercent(): number {
    return Math.round(this.scale * 100);
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64 ?? '';
  }

  onScaleChange(value: number): void {
    this.scale = value;
    this.transform = { ...this.transform, scale: value };
  }

  zoomIn(): void {
    this.onScaleChange(Math.min(3, +(this.scale + 0.1).toFixed(2)));
  }

  zoomOut(): void {
    this.onScaleChange(Math.max(0.5, +(this.scale - 0.1).toFixed(2)));
  }

  apply(): void {
    if (this.croppedImage) {
      this.cropped.emit(this.croppedImage);
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
