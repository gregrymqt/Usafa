// types/homeAdmin.type.ts

export type ContentType = 'CAROUSEL_MAIN' | 'SERVICE_CARD' | 'ABOUT_SECTION' | 'GALLERY_PHOTO';

// Interface completa (O que vem do Banco de Dados)
export interface HomeContent {
  id: number | string;
  type: ContentType;
  title: string;
  description: string;
  imageUrl?: string; // URL da imagem para preview (vem do back)
  imageFile?: File;  // Arquivo real para upload (vai para o back)
  isActive: boolean;
}

// Interface de Requisição (O que enviamos para o Back)
// Omitimos 'id' e 'imageUrl' pois não enviamos isso na criação/edição manual
export type HomeContentRequest = Omit<HomeContent, 'id' | 'imageUrl'>;


export const CONTENT_TYPES: { label: string; value: ContentType }[] = [
  { label: 'Banner Principal', value: 'CAROUSEL_MAIN' },
  { label: 'Seção de Serviços', value: 'SERVICE_CARD' },
  { label: 'Sobre Nós', value: 'ABOUT_SECTION' },
  { label: 'Galeria', value: 'GALLERY_PHOTO' }
];