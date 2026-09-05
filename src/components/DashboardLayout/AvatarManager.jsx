import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FaUser, FaTrash, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';
import { getCroppedImg } from './cropImage';

export default function AvatarManager({ currentImage, onClose, onUpload, onDelete }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("A imagem escolhida é muito grande! O tamanho máximo permitido é de 10MB.");
        e.target.value = null;
        return;
      }
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropping(true);
    }
  };

  const handleSaveCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      // We pass the blob up to be uploaded
      onUpload(croppedBlob);
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{isCropping ? 'Ajustar Foto' : 'Sua Foto de Perfil'}</h3>
          <FaTimes onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} size={20} />
        </div>

        {isCropping ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsCropping(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar
              </button>
              <button onClick={handleSaveCrop} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-blue)', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <FaCheck /> Salvar Recorte
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid var(--primary-blue)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
              {currentImage ? (
                <img src={currentImage} alt="Atual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FaUser size={70} color="var(--primary-blue)" />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
              <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                {currentImage && (
                  <button onClick={onDelete} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <FaTrash /> Remover
                  </button>
                )}
                
                <label style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-blue)', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', margin: 0, textAlign: 'center' }}>
                  <FaUpload /> Trocar Foto
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </label>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '5px' }}>
                Tamanho máximo permitido: 10 MB (JPG, PNG)
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}
