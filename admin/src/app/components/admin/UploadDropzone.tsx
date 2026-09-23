import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { FileText, ImageIcon, RefreshCw, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { createUploadApi, deleteUploadApi, replaceUploadApi, UploadPurpose, UploadRecord } from '../../services/api';

const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

type UploadDropzoneProps = {
  purpose: UploadPurpose;
  value?: string;
  record?: UploadRecord | null;
  label?: string;
  compact?: boolean;
  onUploaded: (upload: UploadRecord) => void;
  onDeleted?: () => void;
};

function isImageType(type: string) {
  return type.startsWith('image/');
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

async function optimizeImage(file: File): Promise<{ dataBase64: string; contentType: string; fileName: string }> {
  if (!isImageType(file.type) || file.type === 'image/gif') {
    return { dataBase64: await fileToDataUrl(file), contentType: file.type, fileName: file.name };
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not optimize image.'));
      img.src = imageUrl;
    });
    const maxSide = 1800;
    const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
    const contentType = file.type === 'image/png' ? 'image/png' : 'image/webp';
    const dataBase64 = canvas.toDataURL(contentType, 0.84);
    const fileName = file.name.replace(/\.[^.]+$/, contentType === 'image/webp' ? '.webp' : '.png');
    return { dataBase64, contentType, fileName };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function UploadDropzone({ purpose, value, record, label = 'Upload file', compact = false, onUploaded, onDeleted }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const accept = purpose === 'document'
    ? '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,application/pdf,text/csv,text/plain'
    : 'image/png,image/jpeg,image/jpg,image/webp,image/gif';

  const processFile = async (file: File) => {
    setError('');
    const maxBytes = purpose === 'document' ? DOCUMENT_MAX_BYTES : IMAGE_MAX_BYTES;
    const allowedTypes = purpose === 'document' ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.has(file.type)) {
      setError(purpose === 'document' ? 'Unsupported document type.' : 'Unsupported image type. SVG is not allowed.');
      return;
    }
    if (file.size <= 0 || file.size > maxBytes) {
      setError(`File must be between 1 byte and ${Math.round(maxBytes / 1024 / 1024)}MB.`);
      return;
    }
    setIsBusy(true);
    try {
      const payload = purpose === 'document'
        ? { dataBase64: await fileToDataUrl(file), contentType: file.type || 'application/octet-stream', fileName: file.name }
        : await optimizeImage(file);
      const upload = record?.id
        ? await replaceUploadApi(record.id, { purpose, ...payload })
        : await createUploadApi({ purpose, ...payload });
      onUploaded(upload);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await processFile(file);
    event.target.value = '';
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDelete = async () => {
    if (!record?.id) {
      onDeleted?.();
      return;
    }
    setIsBusy(true);
    try {
      await deleteUploadApi(record.id);
      onDeleted?.();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const hasImagePreview = value && (value.startsWith('/uploads/') || value.startsWith('http') || value.startsWith('data:image/')) && purpose !== 'document';

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => void handleInput(event)} />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => void handleDrop(event)}
        className={`rounded-lg border-2 border-dashed p-4 transition-colors ${isDragOver ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'} ${compact ? 'min-h-28' : 'min-h-36'}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
            {purpose === 'document' ? <FileText size={22} /> : <ImageIcon size={22} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{isBusy ? 'Processing...' : label}</p>
            <p className="text-xs text-muted-foreground">
              {purpose === 'document' ? 'PDF, Office, CSV or TXT up to 15MB' : 'Drag, drop, preview and optimize images up to 8MB'}
            </p>
          </div>
          <Upload size={18} className="text-muted-foreground" />
        </div>
        {hasImagePreview && (
          <div className="mt-3 overflow-hidden rounded-md border bg-background">
            <img src={value} alt={label} className="h-36 w-full object-cover" loading="lazy" decoding="async" />
          </div>
        )}
        {purpose === 'document' && value && (
          <p className="mt-3 truncate rounded-md bg-muted px-3 py-2 text-xs">{value}</p>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value && (
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => inputRef.current?.click()} disabled={isBusy}>
            <RefreshCw size={14} />
            Replace
          </Button>
          <Button type="button" size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => void handleDelete()} disabled={isBusy}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
