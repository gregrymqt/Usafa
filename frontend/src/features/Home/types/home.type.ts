// Copie exatamente os nomes dos ENUMS do seu Java
export type ContentType = 'CAROUSEL_MAIN' | 'SERVICE_CARD' | 'ABOUT_SECTION' | 'GALLERY_PHOTO';

export interface HomeContent {
  id: number;
  type: ContentType;
  title: string;
  description: string;
  imageUrl: string; // O Java manda a URL pronta
  isActive: boolean;
}