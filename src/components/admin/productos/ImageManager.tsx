/**
 * ImageManager Component
 * Handles product image upload, display, and deletion
 * Extracted from ProductosManager for better separation of concerns
 */
import { getImageUrl, type ImagenProducto } from '../../../lib/api';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

interface ImageManagerProps {
  images: ImagenProducto[];
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (imageId: number) => void;
}

// Hoisted static JSX (rendering-hoist-jsx)
const UploadIcon = (
  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const DeleteIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Upload instructions - static content
const UploadInstructions = (
  <>
    <span className="text-sm font-medium text-gray-700">
      Haz clic para subir una imagen
    </span>
    <span className="text-xs text-gray-500">
      PNG, JPG, GIF, WEBP hasta 16MB
    </span>
  </>
);

// Image card component for each image in the grid
function ImageCard({
  image,
  onDelete,
}: {
  image: ImagenProducto;
  onDelete: () => void;
}) {
  return (
    <div className="relative group">
      <img
        src={getImageUrl(image.url)}
        alt={image.descripcion || 'Imagen del producto'}
        className="w-full h-32 object-cover rounded-lg"
      />
      {image.imagen_principal && (
        <span className="badge-primary absolute top-2 left-2">Principal</span>
      )}
      <button
        onClick={onDelete}
        className="btn-icon btn-icon-danger absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Eliminar imagen"
        type="button"
      >
        {DeleteIcon}
      </button>
    </div>
  );
}

export function ImageManager({
  images,
  uploading,
  fileInputRef,
  onUpload,
  onDelete,
}: ImageManagerProps) {
  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className={[
            'cursor-pointer flex flex-col items-center gap-2',
            uploading ? 'opacity-50 pointer-events-none' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {uploading ? (
            <LoadingSpinner size="md" message="Subiendo imagen..." />
          ) : (
            <>
              {UploadIcon}
              {UploadInstructions}
            </>
          )}
        </label>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img) => (
          <ImageCard key={img.id} image={img} onDelete={() => onDelete(img.id)} />
        ))}
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No hay imágenes para este producto. Sube la primera imagen.
        </p>
      )}
    </div>
  );
}
