// apps/web/src/components/questions/ImageUpload.tsx
// 이미지 파일 업로드 → base64 data URL 변환 컴포넌트 (QBNK-07)
// IndexedDB(Dexie)에 저장하기 위한 변환 처리
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'

interface ImageUploadProps {
  value?: string       // base64 data URL
  onChange: (dataUrl: string | undefined) => void
  label?: string
}

const MAX_SIZE_MB = 2
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function ImageUpload({ value, onChange, label = '이미지 업로드' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_SIZE_BYTES) {
      alert(`이미지 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다 (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      // input 초기화
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.onerror = () => alert('이미지를 읽는 중 오류가 발생했습니다')
    reader.readAsDataURL(file)
  }

  if (value) {
    return (
      <div className="relative inline-block">
        <img
          src={value}
          alt="업로드된 이미지"
          className="max-h-48 max-w-full rounded-md object-contain border"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 w-6 h-6"
          onClick={() => {
            onChange(undefined)
            if (inputRef.current) inputRef.current.value = ''
          }}
          aria-label="이미지 삭제"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="w-4 h-4 mr-2" />
        {label}
      </Button>
    </>
  )
}
