import { Input, Directive } from '@angular/core';
import { CvData, CvSection, EducationEntry, ExperienceEntry } from '../models/cv.model';
import { getThemeStyles, formatDateRange, photoBorderRadius } from '../utils/theme.utils';

/** Shared inputs/helpers for CV templates (incl. optional ATS diff original). */
@Directive()
export abstract class CvTemplateBase {
  @Input({ required: true }) cv!: CvData;
  /** When set, templates highlight text changes vs this snapshot. */
  @Input() originalCv: CvData | null = null;

  get showDiff(): boolean {
    return !!this.originalCv;
  }

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

  origTitle(): string {
    return this.originalCv?.personalInfo?.title ?? '';
  }

  origSummary(): string {
    return this.originalCv?.personalInfo?.summary ?? '';
  }

  origExp(id: string): ExperienceEntry | undefined {
    return this.originalCv?.experience?.find((e) => e.id === id);
  }

  origEdu(id: string): EducationEntry | undefined {
    return this.originalCv?.education?.find((e) => e.id === id);
  }

  origEduText(eduId: string, detailId: string): string {
    return (
      this.origEdu(eduId)?.description?.find((d) => d.id === detailId)?.text ?? ''
    );
  }

  origSkillName(id: string): string {
    return this.originalCv?.skills?.find((s) => s.id === id)?.name ?? '';
  }

  origAchievement(expId: string, index: number): string {
    return this.origExp(expId)?.achievements?.[index] ?? '';
  }

  origOther(index: number): string {
    return this.originalCv?.otherInfo?.[index] ?? '';
  }

  /** New skills added in adapted CV (ids not in original). */
  isNewSkill(id: string): boolean {
    if (!this.originalCv) return false;
    return !this.originalCv.skills.some((s) => s.id === id);
  }
}
