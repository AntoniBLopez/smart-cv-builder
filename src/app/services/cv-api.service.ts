import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CvData } from '../models/cv.model';

@Injectable({ providedIn: 'root' })
export class CvApiService {
  constructor(private http: HttpClient) {}

  list(): Promise<CvData[]> {
    return firstValueFrom(
      this.http.get<{ documents: CvData[] }>(`${environment.apiUrl}/cvs`)
    ).then((res) => res.documents);
  }

  get(id: string): Promise<CvData> {
    return firstValueFrom(
      this.http.get<{ document: CvData }>(`${environment.apiUrl}/cvs/${id}`)
    ).then((res) => res.document);
  }

  create(data: CvData): Promise<CvData> {
    return firstValueFrom(
      this.http.post<{ document: CvData }>(`${environment.apiUrl}/cvs`, { data })
    ).then((res) => res.document);
  }

  update(id: string, data: CvData): Promise<CvData> {
    return firstValueFrom(
      this.http.put<{ document: CvData }>(`${environment.apiUrl}/cvs/${id}`, { data })
    ).then((res) => res.document);
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/cvs/${id}`));
  }

  duplicate(id: string, name?: string): Promise<CvData> {
    return firstValueFrom(
      this.http.post<{ document: CvData }>(`${environment.apiUrl}/cvs/${id}/duplicate`, {
        name,
      })
    ).then((res) => res.document);
  }
}
