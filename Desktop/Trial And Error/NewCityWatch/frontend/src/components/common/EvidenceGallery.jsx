import React, { useState } from 'react';
import { X, Play, Image as ImageIcon } from 'lucide-react';
import './EvidenceGallery.css';

const EvidenceGallery = ({ evidence = [] }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (!evidence || evidence.length === 0) {
    return null;
  }

  // Helper to get full URL (MVP localhost hardcoded, ideally env var)
  const getUrl = (path) => `http://localhost:5000${path}`;

  return (
    <>
      <div className="evidence-grid">
        {evidence.map((item) => (
          <div 
            key={item.id} 
            className="evidence-thumbnail"
            onClick={() => setSelectedMedia(item)}
          >
            {item.type === 'VIDEO' ? (
              <div className="video-thumb">
                <video src={getUrl(item.filePath)} preload="metadata" />
                <div className="play-overlay">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
            ) : (
              <img src={getUrl(item.filePath)} alt="Evidence" loading="lazy" />
            )}
            
            <div className="evidence-type-badge">
              {item.type === 'VIDEO' ? <Play size={12} /> : <ImageIcon size={12} />}
              <span>{item.type === 'VIDEO' ? 'Video' : 'Photo'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="lightbox-overlay" onClick={() => setSelectedMedia(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedMedia(null)}>
              <X size={24} />
            </button>
            
            {selectedMedia.type === 'VIDEO' ? (
              <video 
                src={getUrl(selectedMedia.filePath)} 
                controls 
                autoPlay 
                className="lightbox-media"
              />
            ) : (
              <img 
                src={getUrl(selectedMedia.filePath)} 
                alt="Evidence Fullscreen" 
                className="lightbox-media"
              />
            )}
            
            <div className="lightbox-caption">
              Uploaded on {new Date(selectedMedia.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EvidenceGallery;
