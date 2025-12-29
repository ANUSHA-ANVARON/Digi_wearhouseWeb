/**
 * Compresses an image file to stay under a target size (in bytes).
 * Uses a canvas-based approach to resize and compress.
 */
export const compressImage = async (file, targetSizeMB = 10, quality = 0.8) => {
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  
  if (file.size <= targetSizeBytes) {
    return file;
  }

  console.log(`Compressing ${file.name} from ${(file.size / (1024 * 1024)).toFixed(2)}MB to stay under ${targetSizeMB}MB`);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // If very large, downscale dimensions too
        const MAX_DIMENSION = 2000;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          } else {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compress = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas toBlob failed'));
                return;
              }
              
              if (blob.size <= targetSizeBytes || q <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`Compression finished: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);
                resolve(compressedFile);
              } else {
                // Iteratively reduce quality
                compress(q - 0.1);
              }
            },
            'image/jpeg',
            q
          );
        };

        compress(quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
