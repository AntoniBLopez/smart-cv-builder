import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CvData } from '../models/cv.model';

export interface AtsAnalysis {
  matchScore: number;
  company: {
    name: string;
    sector: string;
    summary: string;
    needs: string[];
  };
  keywords: {
    requiredFromJd: string[];
    presentInCv: string[];
    missingFromCv: string[];
    suggestedAdditions: string[];
  };
  atsChecks: {
    strengths: string[];
    risks: string[];
  };
  advice: string[];
  priorityFixes: string[];
}

export interface AtsAnalyzeResponse {
  analysis: AtsAnalysis;
  meta: {
    used: { provider: string; model: string; keyLabel: string };
    research: { urlsFound: string[]; pagesFetched: number; note: string };
    failedAttempts: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AtsAiService {
  constructor(private http: HttpClient) {}

  analyze(payload: {
    cv: CvData;
    jobDescription: string;
    companyUrl?: string;
  }): Promise<AtsAnalyzeResponse> {
    return firstValueFrom(
      this.http.post<AtsAnalyzeResponse>(`${environment.apiUrl}/ai/ats-analyze`, payload)
    );
  }
}
