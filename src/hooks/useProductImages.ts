/**
 * useProductImages Hook
 * Manages product image upload, deletion, and state
 * Extracted from ProductosManager for reusability
 */
import { useState, useRef, useCallback } from 'react';
import { productosApi, type ImagenProducto } from '../lib/api';

// Allowed image types
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

// Max file size: 16MB
const MAX_FILE_SIZE = 16 * 1024 * 1024;

// Error messages configuration
const ERROR_MESSAGES = {
  invalidType: 'Tipo de archivo no válido. Solo se permiten: PNG, JPG, JPEG, GIF, WEBP',
  fileTooLarge: 'El archivo es demasiado grande. Tamaño máximo: 16MB',
  uploadError: 'Error al subir imagen',
  deleteError: 'Error al eliminar imagen',
} as const;

export interface UseProductImagesReturn {
  // State
  productImages: ImagenProducto[];
  uploadingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  
  // Actions
  loadProductImages: (productoId: number) => Promise<void>;
  handleImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    productoId: number,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  deleteImage: (
    imageId: number,
    productoId: number,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  clearImages: () => void;
  resetFileInput: () => void;
}

export function useProductImages(): UseProductImagesReturn {
  const [productImages, setProductImages] = useState<ImagenProducto[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset file input
  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Clear images state
  const clearImages = useCallback(() => {
    setProductImages([]);
  }, []);

  // Load images for a product
  const loadProductImages = useCallback(async (productoId: number) => {
    try {
      const images = await productosApi.getImages(productoId);
      setProductImages(images);
    } catch (err) {
      console.error('Error loading images:', err);
      setProductImages([]);
    }
  }, []);

  // Validate file before upload
  const validateFile = useCallback((file: File): string | null => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return ERROR_MESSAGES.invalidType;
    }
    if (file.size > MAX_FILE_SIZE) {
      return ERROR_MESSAGES.fileTooLarge;
    }
    return null;
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      productoId: number,
      onSuccess?: () => void,
      onError?: (error: string) => void
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        onError?.(validationError);
        resetFileInput();
        return;
      }

      // First image becomes principal
      const isPrincipal = productImages.length === 0;

      try {
        setUploadingImage(true);
        await productosApi.uploadImage(productoId, file, isPrincipal);
        await loadProductImages(productoId);
        onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.uploadError;
        onError?.(errorMessage);
      } finally {
        setUploadingImage(false);
        resetFileInput();
      }
    },
    [productImages.length, validateFile, resetFileInput, loadProductImages]
  );

  // Delete image
  const deleteImage = useCallback(
    async (
      imageId: number,
      productoId: number,
      onSuccess?: () => void,
      onError?: (error: string) => void
    ) => {
      try {
        await productosApi.deleteImage(imageId);
        await loadProductImages(productoId);
        onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.deleteError;
        onError?.(errorMessage);
      }
    },
    [loadProductImages]
  );

  return {
    productImages,
    uploadingImage,
    fileInputRef,
    loadProductImages,
    handleImageUpload,
    deleteImage,
    clearImages,
    resetFileInput,
  };
}
